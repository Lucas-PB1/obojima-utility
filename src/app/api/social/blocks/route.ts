import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import {
  getBlockId,
  getChatId,
  getFriendRequestId,
  getFriendshipId
} from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { getPublicProfile } from '@/lib/server/social';
import { logger } from '@/utils/logger';

interface BlockBody {
  blockedUserId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { blockedUserId } = (await req.json()) as BlockBody;

    if (!blockedUserId || blockedUserId === user.uid) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 });
    }

    const blockedProfile = await getPublicProfile(blockedUserId);
    const blockId = getBlockId(user.uid, blockedUserId);
    const friendshipId = getFriendshipId(user.uid, blockedUserId);
    const chatId = getChatId(user.uid, blockedUserId);
    const outgoingRequestId = getFriendRequestId(user.uid, blockedUserId);
    const incomingRequestId = getFriendRequestId(blockedUserId, user.uid);

    await adminDb.runTransaction(async (transaction) => {
      const blockRef = adminDb.collection('blocks').doc(blockId);
      const friendshipRef = adminDb.collection('friends').doc(friendshipId);
      const chatRef = adminDb.collection('chats').doc(chatId);
      const outgoingRequestRef = adminDb.collection('friendRequests').doc(outgoingRequestId);
      const incomingRequestRef = adminDb.collection('friendRequests').doc(incomingRequestId);
      const [outgoingRequestSnap, incomingRequestSnap] = await Promise.all([
        transaction.get(outgoingRequestRef),
        transaction.get(incomingRequestRef)
      ]);

      transaction.set(blockRef, {
        blockerId: user.uid,
        blockedUserId,
        blockedUser: blockedProfile,
        createdAt: Timestamp.now()
      });
      transaction.delete(friendshipRef);
      transaction.delete(chatRef);

      if (outgoingRequestSnap.exists && outgoingRequestSnap.data()?.status === 'pending') {
        transaction.update(outgoingRequestRef, { status: 'canceled', updatedAt: Timestamp.now() });
      }

      if (incomingRequestSnap.exists && incomingRequestSnap.data()?.status === 'pending') {
        transaction.update(incomingRequestRef, { status: 'canceled', updatedAt: Timestamp.now() });
      }
    });

    return NextResponse.json({ success: true, blockId });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error blocking user:', error);
    const message = error instanceof Error ? error.message : 'Falha ao bloquear usuário';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
