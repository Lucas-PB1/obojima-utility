import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { AdminAuditAction, AdminUserDetails } from '@/features/admin/types';
import { getSelfActionBlock } from '@/features/admin/domain/adminRules';
import { listAdminAudit, logAdminAction } from '@/lib/server/adminAudit';
import {
  BlockedUser,
  ChatConversation,
  Friend,
  FriendRequest,
  SocialNotification,
  TradeTransaction,
  UserReport
} from '@/types/social';
import { CollectedIngredient, CreatedPotion, ForageAttempt } from '@/types/ingredients';

interface UserUpdateBody {
  displayName?: string;
  disabled?: boolean;
  role?: string;
  gold?: number;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (!value) return value;

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        normalizeFirestoreValue(item)
      ])
    );
  }

  return value;
}

function docsToRows<T = Record<string, unknown>>(snapshot: FirebaseFirestore.QuerySnapshot): T[] {
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...(normalizeFirestoreValue(doc.data()) as Record<string, unknown>)
      }) as unknown as T
  );
}

async function readUserDetails(uid: string): Promise<AdminUserDetails> {
  const userRef = adminDb.collection('users').doc(uid);

  const [
    userDoc,
    ingredientsSnap,
    potionsSnap,
    historySnap,
    notificationsSnap,
    friendshipsSnap,
    incomingRequestsSnap,
    outgoingRequestsSnap,
    chatsSnap,
    blockedByUserSnap,
    blockingUserSnap,
    reportsAboutUserSnap,
    reportsByUserSnap,
    tradesSnap
  ] = await Promise.all([
    userRef.get(),
    userRef.collection('collectedIngredients').get(),
    userRef.collection('createdPotions').get(),
    userRef.collection('forageAttempts').orderBy('timestamp', 'desc').limit(50).get(),
    userRef.collection('notifications').orderBy('createdAt', 'desc').limit(50).get(),
    adminDb.collection('friends').where('participants', 'array-contains', uid).limit(100).get(),
    adminDb.collection('friendRequests').where('toUserId', '==', uid).limit(100).get(),
    adminDb.collection('friendRequests').where('fromUserId', '==', uid).limit(100).get(),
    adminDb.collection('chats').where('participants', 'array-contains', uid).limit(100).get(),
    adminDb.collection('blocks').where('blockerId', '==', uid).limit(100).get(),
    adminDb.collection('blocks').where('blockedUserId', '==', uid).limit(100).get(),
    adminDb.collection('reports').where('reportedUserId', '==', uid).limit(100).get(),
    adminDb.collection('reports').where('reporterId', '==', uid).limit(100).get(),
    adminDb.collection('trades').where('participants', 'array-contains', uid).limit(100).get()
  ]);

  if (!userDoc.exists) {
    throw new Error('Usuário não encontrado');
  }

  const user = {
    ...(normalizeFirestoreValue(userDoc.data()) as UserProfile),
    uid
  };
  const adminLog = await listAdminAudit({ targetUid: uid, limit: 50 }).catch(() => []);
  const settings = (userDoc.data()?.settings || {}) as { gold?: number };

  const reports = [
    ...docsToRows<UserReport>(reportsAboutUserSnap),
    ...docsToRows<UserReport>(reportsByUserSnap)
  ].filter((report, index, rows) => rows.findIndex((item) => item.id === report.id) === index);

  const blockedUsers = [
    ...docsToRows<BlockedUser>(blockedByUserSnap),
    ...docsToRows<BlockedUser>(blockingUserSnap)
  ].filter((block, index, rows) => rows.findIndex((item) => item.id === block.id) === index);

  return {
    user,
    gold: Math.max(0, Math.floor(Number(settings.gold || 0))),
    ingredients: docsToRows<CollectedIngredient>(ingredientsSnap),
    potions: docsToRows<CreatedPotion>(potionsSnap),
    history: docsToRows<ForageAttempt>(historySnap),
    social: {
      friends: docsToRows<Friend>(friendshipsSnap),
      incomingRequests: docsToRows<FriendRequest>(incomingRequestsSnap),
      outgoingRequests: docsToRows<FriendRequest>(outgoingRequestsSnap),
      conversations: docsToRows<ChatConversation>(chatsSnap),
      blockedUsers,
      reports,
      notifications: docsToRows<SocialNotification>(notificationsSnap),
      trades: docsToRows<TradeTransaction>(tradesSnap)
    },
    audit: [
      { id: 'uid', label: 'UID', value: uid },
      { id: 'createdAt', label: 'Criado em', value: user.createdAt || '-' },
      { id: 'updatedAt', label: 'Atualizado em', value: user.updatedAt || '-' },
      { id: 'lastLogin', label: 'Último login', value: user.lastLogin || '-' }
    ],
    adminLog
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin(req);
    const { uid } = await params;
    const details = await readUserDetails(uid);
    return NextResponse.json({ success: true, details });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error fetching user details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao carregar usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

const BATCH_LIMIT = 400;

async function deleteRefs(refs: FirebaseFirestore.DocumentReference[]): Promise<number> {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = adminDb.batch();
    refs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return refs.length;
}

/**
 * Removes everything that belongs to the account so it no longer shows up in
 * search, friend lists or chats. Reports and trade records are kept as history.
 */
async function deleteUserData(uid: string) {
  const [friendships, sentRequests, receivedRequests, blocksBy, blocksOn, chats] =
    await Promise.all([
      adminDb.collection('friends').where('participants', 'array-contains', uid).get(),
      adminDb.collection('friendRequests').where('fromUserId', '==', uid).get(),
      adminDb.collection('friendRequests').where('toUserId', '==', uid).get(),
      adminDb.collection('blocks').where('blockerId', '==', uid).get(),
      adminDb.collection('blocks').where('blockedUserId', '==', uid).get(),
      adminDb.collection('chats').where('participants', 'array-contains', uid).get()
    ]);

  const relationshipRefs = [
    ...friendships.docs,
    ...sentRequests.docs,
    ...receivedRequests.docs,
    ...blocksBy.docs,
    ...blocksOn.docs
  ].map((doc) => doc.ref);

  await deleteRefs(relationshipRefs);
  // recursiveDelete also removes subcollections (messages, inventory, notifications...).
  for (const chat of chats.docs) await adminDb.recursiveDelete(chat.ref);
  await adminDb.collection('public_users').doc(uid).delete();
  await adminDb.recursiveDelete(adminDb.collection('users').doc(uid));

  return {
    friendships: friendships.size,
    requests: sentRequests.size + receivedRequests.size,
    blocks: blocksBy.size + blocksOn.size,
    chats: chats.size
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);

    const { uid } = await params;
    const body = await req.json();
    const { displayName, disabled, role, gold } = body as UserUpdateBody;

    const selfBlock = getSelfActionBlock(admin.uid, uid, { role, disabled });
    if (selfBlock) {
      return NextResponse.json({ success: false, error: selfBlock }, { status: 400 });
    }
    if (role !== undefined && role !== 'admin' && role !== 'user') {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }
    if (displayName !== undefined && !String(displayName).trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome não pode ficar vazio' },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(uid);
    const before = (await userRef.get()).data() || {};
    const targetName = String(before.displayName || before.email || uid);

    const authUpdates: { displayName?: string; disabled?: boolean } = {};
    const firestoreUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const changes: Array<{ action: AdminAuditAction; summary: string }> = [];

    if (displayName !== undefined && displayName.trim() !== before.displayName) {
      authUpdates.displayName = displayName.trim();
      firestoreUpdates.displayName = displayName.trim();
      changes.push({
        action: 'user.update',
        summary: `Nome alterado de "${before.displayName || '-'}" para "${displayName.trim()}"`
      });
    }
    if (disabled !== undefined && disabled !== Boolean(before.disabled)) {
      authUpdates.disabled = disabled;
      firestoreUpdates.disabled = disabled;
      changes.push({
        action: disabled ? 'user.disable' : 'user.enable',
        summary: disabled ? 'Conta desativada' : 'Conta reativada'
      });
    }
    if (role !== undefined && role !== before.role) {
      firestoreUpdates.role = role;
      changes.push({
        action: 'user.role',
        summary: `Função alterada de ${before.role || 'user'} para ${role}`
      });
    }
    if (gold !== undefined) {
      const nextGold = Math.max(0, Math.floor(Number(gold) || 0));
      const previousGold = Math.max(0, Math.floor(Number(before.settings?.gold || 0)));
      if (nextGold !== previousGold) {
        firestoreUpdates['settings.gold'] = nextGold;
        changes.push({ action: 'user.gold', summary: `Gold: ${previousGold} → ${nextGold}` });
      }
    }

    if (changes.length === 0) {
      return NextResponse.json({ success: true, message: 'Nada para atualizar' });
    }

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
    }
    await userRef.update(firestoreUpdates);

    if (firestoreUpdates.displayName) {
      const name = String(firestoreUpdates.displayName);
      await adminDb
        .collection('public_users')
        .doc(uid)
        .set({ displayName: name, searchName: name.toLowerCase() }, { merge: true });
    }

    // A disabled Firebase account keeps working until its ID token expires
    // (up to an hour); revoking refresh tokens signs it out everywhere.
    if (disabled === true) await adminAuth.revokeRefreshTokens(uid);

    await Promise.all(
      changes.map((change) => logAdminAction(admin, change.action, change.summary, uid, targetName))
    );

    return NextResponse.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);

    const { uid } = await params;
    const selfBlock = getSelfActionBlock(admin.uid, uid, { delete: true });
    if (selfBlock) {
      return NextResponse.json({ success: false, error: selfBlock }, { status: 400 });
    }

    const before = (await adminDb.collection('users').doc(uid).get()).data() || {};
    const targetName = String(before.displayName || before.email || uid);

    try {
      await adminAuth.deleteUser(uid);
    } catch {
      logger.warn(`User ${uid} not found in Auth, continuing with Firestore cleanup.`);
    }

    const removed = await deleteUserData(uid);
    await logAdminAction(
      admin,
      'user.delete',
      `Conta excluída (${removed.friendships} amizades, ${removed.requests} solicitações, ${removed.blocks} bloqueios, ${removed.chats} chats removidos)`,
      uid,
      targetName
    );

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso', removed });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
