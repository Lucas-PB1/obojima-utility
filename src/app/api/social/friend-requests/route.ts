import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { getFriendRequestId, getFriendshipId } from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import {
  assertNoBlockBetween,
  createSocialNotification,
  getPublicProfile
} from '@/lib/server/social';
import { logger } from '@/utils/logger';

interface FriendRequestBody {
  toUserId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { toUserId } = (await req.json()) as FriendRequestBody;

    if (!toUserId || toUserId === user.uid) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 });
    }

    await assertNoBlockBetween(user.uid, toUserId);

    const [fromProfile, toProfile] = await Promise.all([
      getPublicProfile(user.uid),
      getPublicProfile(toUserId)
    ]);

    const requestId = getFriendRequestId(user.uid, toUserId);
    const reverseRequestId = getFriendRequestId(toUserId, user.uid);
    const friendshipId = getFriendshipId(user.uid, toUserId);

    await adminDb.runTransaction(async (transaction) => {
      const requestRef = adminDb.collection('friendRequests').doc(requestId);
      const reverseRequestRef = adminDb.collection('friendRequests').doc(reverseRequestId);
      const friendshipRef = adminDb.collection('friends').doc(friendshipId);

      const [requestSnap, reverseRequestSnap, friendshipSnap] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(reverseRequestRef),
        transaction.get(friendshipRef)
      ]);

      if (friendshipSnap.exists) {
        throw new Error('Vocês já são amigos');
      }

      if (requestSnap.exists && requestSnap.data()?.status === 'pending') {
        throw new Error('Solicitação já enviada');
      }

      if (reverseRequestSnap.exists && reverseRequestSnap.data()?.status === 'pending') {
        throw new Error('Este usuário já enviou uma solicitação para você');
      }

      transaction.set(requestRef, {
        fromUserId: user.uid,
        fromUserName: fromProfile.displayName,
        fromUserPhotoURL: fromProfile.photoURL,
        toUserId,
        toUserName: toProfile.displayName,
        toUserPhotoURL: toProfile.photoURL,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        respondedAt: null
      });
    });

    await createSocialNotification({
      recipientId: toUserId,
      actorId: user.uid,
      actorName: fromProfile.displayName,
      type: 'friend_request',
      link: '/?tab=social',
      data: {
        requestId,
        fromUserId: user.uid,
        toUserId: toProfile.uid
      }
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error creating friend request:', error);
    const message = error instanceof Error ? error.message : 'Falha ao enviar solicitação';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
