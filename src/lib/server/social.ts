import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb, adminMessaging } from '@/config/firebase-admin';
import {
  buildSocialNotificationCopy,
  getBlockId,
  getChatId,
  getFriendshipId
} from '@/features/social/domain/socialRules';
import { SocialNotificationType } from '@/types/social';
import { logger } from '@/utils/logger';

export interface PublicProfileSnapshot {
  uid: string;
  displayName: string;
  searchName: string;
  photoURL: string | null;
}

export interface CreateSocialNotificationInput {
  recipientId: string;
  type: SocialNotificationType;
  actorId?: string | null;
  actorName?: string | null;
  body?: string;
  link?: string | null;
  data?: Record<string, string>;
}

export function publicProfileFromData(
  uid: string,
  data?: FirebaseFirestore.DocumentData
): PublicProfileSnapshot {
  const displayName = String(data?.displayName || data?.email || 'User');

  return {
    uid,
    displayName,
    searchName: displayName.toLowerCase(),
    photoURL: typeof data?.photoURL === 'string' ? data.photoURL : null
  };
}

export async function getPublicProfile(uid: string): Promise<PublicProfileSnapshot> {
  const publicSnap = await adminDb.collection('public_users').doc(uid).get();
  if (publicSnap.exists) return publicProfileFromData(uid, publicSnap.data());

  const userSnap = await adminDb.collection('users').doc(uid).get();
  if (userSnap.exists) return publicProfileFromData(uid, userSnap.data());

  throw new Error('Usuário não encontrado');
}

export function getSocialPairIds(uid1: string, uid2: string) {
  return {
    friendshipId: getFriendshipId(uid1, uid2),
    chatId: getChatId(uid1, uid2),
    forwardBlockId: getBlockId(uid1, uid2),
    reverseBlockId: getBlockId(uid2, uid1)
  };
}

export async function hasBlockBetween(uid1: string, uid2: string): Promise<boolean> {
  const { forwardBlockId, reverseBlockId } = getSocialPairIds(uid1, uid2);
  const [forwardSnap, reverseSnap] = await Promise.all([
    adminDb.collection('blocks').doc(forwardBlockId).get(),
    adminDb.collection('blocks').doc(reverseBlockId).get()
  ]);

  return forwardSnap.exists || reverseSnap.exists;
}

export async function assertNoBlockBetween(uid1: string, uid2: string): Promise<void> {
  if (await hasBlockBetween(uid1, uid2)) {
    throw new Error('Ação bloqueada entre estes usuários');
  }
}

export async function assertActiveFriendship(uid1: string, uid2: string): Promise<void> {
  const friendshipSnap = await adminDb.collection('friends').doc(getFriendshipId(uid1, uid2)).get();
  let friendshipData = friendshipSnap.exists ? friendshipSnap.data() : null;

  if (!friendshipData) {
    const legacySnap = await adminDb
      .collection('friends')
      .where('participants', 'array-contains', uid1)
      .limit(100)
      .get();
    const legacyDoc = legacySnap.docs.find((doc) => {
      const participants = doc.data()?.participants || [];
      return participants.includes(uid1) && participants.includes(uid2);
    });

    friendshipData = legacyDoc?.data() || null;
  }

  if (!friendshipData) {
    throw new Error('Esta ação exige amizade ativa');
  }

  const participants = friendshipData.participants || [];
  if (!participants.includes(uid1) || !participants.includes(uid2)) {
    throw new Error('Amizade inválida');
  }
}

export async function assertCanInteract(uid1: string, uid2: string): Promise<void> {
  await assertActiveFriendship(uid1, uid2);
  await assertNoBlockBetween(uid1, uid2);
}

export async function ensureChatForFriends(uid1: string, uid2: string): Promise<string> {
  const chatId = getChatId(uid1, uid2);
  await adminDb
    .collection('chats')
    .doc(chatId)
    .set(
      {
        participants: [uid1, uid2],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        unreadCounts: {
          [uid1]: 0,
          [uid2]: 0
        }
      },
      { merge: true }
    );

  return chatId;
}

export async function createSocialNotification({
  recipientId,
  type,
  actorId = null,
  actorName = null,
  body,
  link = null,
  data = {}
}: CreateSocialNotificationInput): Promise<void> {
  const fallbackName = actorName || 'Obojima';
  const copy = buildSocialNotificationCopy(type, fallbackName, body);
  const notificationData = {
    recipientId,
    actorId,
    actorName,
    type,
    title: copy.title,
    body: copy.body,
    link,
    read: false,
    data,
    createdAt: Timestamp.now()
  };

  await adminDb
    .collection('users')
    .doc(recipientId)
    .collection('notifications')
    .add(notificationData);

  const tokenSnapshot = await adminDb
    .collection('users')
    .doc(recipientId)
    .collection('fcmTokens')
    .get();

  const tokenDocs = tokenSnapshot.docs
    .map((doc) => ({ ref: doc.ref, token: doc.data().token }))
    .filter((entry): entry is { ref: FirebaseFirestore.DocumentReference; token: string } => {
      return typeof entry.token === 'string' && entry.token.length > 0;
    });

  if (tokenDocs.length === 0) return;

  try {
    const response = await adminMessaging.sendEachForMulticast({
      tokens: tokenDocs.map((entry) => entry.token),
      notification: {
        title: copy.title,
        body: copy.body
      },
      data: {
        type,
        actorId: actorId || '',
        link: link || '',
        ...data
      }
    });

    const cleanupBatch = adminDb.batch();
    let cleanupCount = 0;

    response.responses.forEach((result, index) => {
      const code = result.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        cleanupBatch.delete(tokenDocs[index].ref);
        cleanupCount++;
      }
    });

    if (cleanupCount > 0) await cleanupBatch.commit();
  } catch (error) {
    logger.warn('Falha ao enviar push social:', error);
  }
}

export function serverTimestamp() {
  return Timestamp.now();
}

export function incrementBy(value: number) {
  return FieldValue.increment(value);
}
