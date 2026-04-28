import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { getChatId, getFriendshipId } from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import {
  assertNoBlockBetween,
  createSocialNotification,
  getPublicProfile
} from '@/lib/server/social';
import { logger } from '@/utils/logger';

interface FriendRequestActionBody {
  action?: 'accept' | 'reject';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { requestId } = await params;
    const { action } = (await req.json()) as FriendRequestActionBody;

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    }

    const requestRef = adminDb.collection('friendRequests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    const requestData = requestSnap.data() || {};
    if (requestData.toUserId !== user.uid) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
    }

    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Solicitação já respondida' },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      await requestRef.update({
        status: 'rejected',
        updatedAt: Timestamp.now(),
        respondedAt: Timestamp.now()
      });

      return NextResponse.json({ success: true });
    }

    await assertNoBlockBetween(requestData.fromUserId, requestData.toUserId);

    const [senderProfile, receiverProfile] = await Promise.all([
      getPublicProfile(requestData.fromUserId),
      getPublicProfile(requestData.toUserId)
    ]);

    const friendshipId = getFriendshipId(requestData.fromUserId, requestData.toUserId);
    const chatId = getChatId(requestData.fromUserId, requestData.toUserId);

    await adminDb.runTransaction(async (transaction) => {
      const freshRequestSnap = await transaction.get(requestRef);
      if (!freshRequestSnap.exists || freshRequestSnap.data()?.status !== 'pending') {
        throw new Error('Solicitação já respondida');
      }

      const friendshipRef = adminDb.collection('friends').doc(friendshipId);
      const chatRef = adminDb.collection('chats').doc(chatId);
      const now = Timestamp.now();
      const participants = [requestData.fromUserId, requestData.toUserId];

      transaction.set(friendshipRef, {
        participants,
        createdAt: now,
        updatedAt: now,
        users: {
          [senderProfile.uid]: senderProfile,
          [receiverProfile.uid]: receiverProfile
        }
      });

      transaction.set(
        chatRef,
        {
          participants,
          createdAt: now,
          updatedAt: now,
          lastMessage: null,
          unreadCounts: {
            [requestData.fromUserId]: 0,
            [requestData.toUserId]: 0
          }
        },
        { merge: true }
      );

      transaction.update(requestRef, {
        status: 'accepted',
        updatedAt: now,
        respondedAt: now
      });
    });

    await createSocialNotification({
      recipientId: requestData.fromUserId,
      actorId: user.uid,
      actorName: receiverProfile.displayName,
      type: 'friend_accepted',
      link: '/?tab=social',
      data: {
        friendshipId,
        chatId
      }
    });

    return NextResponse.json({ success: true, friendshipId, chatId });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error responding to friend request:', error);
    const message = error instanceof Error ? error.message : 'Falha ao responder solicitação';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { requestId } = await params;
    const requestRef = adminDb.collection('friendRequests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    const requestData = requestSnap.data() || {};
    if (requestData.fromUserId !== user.uid || requestData.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
    }

    await requestRef.update({
      status: 'canceled',
      updatedAt: Timestamp.now(),
      respondedAt: Timestamp.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error canceling friend request:', error);
    const message = error instanceof Error ? error.message : 'Falha ao cancelar solicitação';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
