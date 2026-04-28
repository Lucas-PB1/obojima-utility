import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import {
  getChatId,
  normalizeSocialMessage,
  validateSocialMessage
} from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { assertCanInteract, createSocialNotification, getPublicProfile } from '@/lib/server/social';
import { logger } from '@/utils/logger';

interface MessageBody {
  friendId?: string;
  content?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { friendId, content = '' } = (await req.json()) as MessageBody;

    if (!friendId || friendId === user.uid) {
      return NextResponse.json({ success: false, error: 'Destinatário inválido' }, { status: 400 });
    }

    const validationError = validateSocialMessage(content);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    await assertCanInteract(user.uid, friendId);

    const normalizedContent = normalizeSocialMessage(content);
    const [senderProfile] = await Promise.all([
      getPublicProfile(user.uid),
      getPublicProfile(friendId)
    ]);
    const chatId = getChatId(user.uid, friendId);
    const now = Timestamp.now();
    const messageRef = adminDb.collection('chats').doc(chatId).collection('messages').doc();

    await adminDb.runTransaction(async (transaction) => {
      const chatRef = adminDb.collection('chats').doc(chatId);

      transaction.set(messageRef, {
        senderId: user.uid,
        receiverId: friendId,
        content: normalizedContent,
        timestamp: now,
        read: false,
        readBy: [user.uid]
      });

      transaction.set(
        chatRef,
        {
          participants: [user.uid, friendId],
          updatedAt: now,
          lastMessage: {
            content: normalizedContent,
            senderId: user.uid,
            timestamp: now
          },
          unreadCounts: {
            [user.uid]: 0,
            [friendId]: FieldValue.increment(1)
          }
        },
        { merge: true }
      );
    });

    await createSocialNotification({
      recipientId: friendId,
      actorId: user.uid,
      actorName: senderProfile.displayName,
      type: 'message',
      body: normalizedContent,
      link: '/?tab=social',
      data: {
        chatId,
        messageId: messageRef.id
      }
    });

    return NextResponse.json({ success: true, messageId: messageRef.id, chatId });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error sending social message:', error);
    const message = error instanceof Error ? error.message : 'Falha ao enviar mensagem';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
