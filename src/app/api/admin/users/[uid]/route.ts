import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { AdminUserDetails } from '@/features/admin/types';
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
    ]
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin(req);

    const { uid } = await params;
    const body = await req.json();
    const { displayName, disabled, role, gold } = body as UserUpdateBody;

    const updates: Partial<UserProfile> = {};
    const authUpdates: { displayName?: string; disabled?: boolean } = {};

    if (displayName !== undefined) {
      authUpdates.displayName = displayName;
      updates.displayName = displayName;
    }
    if (disabled !== undefined) {
      authUpdates.disabled = disabled;
      updates.disabled = disabled;
    }

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
    }

    const firestoreUpdates: Partial<UserProfile> & { updatedAt: string } = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (role !== undefined) {
      if (role !== 'admin' && role !== 'user') {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
      }
      firestoreUpdates.role = role;
    }
    if (gold !== undefined) {
      await adminDb
        .collection('users')
        .doc(uid)
        .update({
          ...firestoreUpdates,
          'settings.gold': Math.max(0, Math.floor(Number(gold) || 0))
        });

      return NextResponse.json({ success: true, message: 'Usuário atualizado com sucesso' });
    }

    await adminDb.collection('users').doc(uid).update(firestoreUpdates);

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
    await requireAdmin(req);

    const { uid } = await params;

    try {
      await adminAuth.deleteUser(uid);
    } catch {
      logger.warn(`User ${uid} not found in Auth, continuing with Firestore cleanup.`);
    }

    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
