import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getChatId } from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { assertActiveFriendship } from '@/lib/server/social';
import { logger } from '@/utils/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { friendId } = await params;

    if (!friendId || friendId === user.uid) {
      return NextResponse.json({ success: false, error: 'Chat inválido' }, { status: 400 });
    }

    await assertActiveFriendship(user.uid, friendId);

    const chatId = getChatId(user.uid, friendId);
    await adminDb
      .collection('chats')
      .doc(chatId)
      .set(
        {
          unreadCounts: {
            [user.uid]: 0
          }
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error marking chat as read:', error);
    const message = error instanceof Error ? error.message : 'Falha ao marcar chat como lido';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
