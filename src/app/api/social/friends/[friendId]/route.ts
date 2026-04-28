import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getChatId, getFriendshipId } from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { friendId } = await params;

    if (!friendId || friendId === user.uid) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 });
    }

    const friendshipId = getFriendshipId(user.uid, friendId);
    const chatId = getChatId(user.uid, friendId);

    await adminDb.runTransaction(async (transaction) => {
      const friendshipRef = adminDb.collection('friends').doc(friendshipId);
      const chatRef = adminDb.collection('chats').doc(chatId);
      const friendshipSnap = await transaction.get(friendshipRef);

      if (!friendshipSnap.exists) {
        throw new Error('Amizade não encontrada');
      }

      const participants = friendshipSnap.data()?.participants || [];
      if (!participants.includes(user.uid) || !participants.includes(friendId)) {
        throw new Error('Sem permissão');
      }

      transaction.delete(friendshipRef);
      transaction.delete(chatRef);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error removing friend:', error);
    const message = error instanceof Error ? error.message : 'Falha ao remover amigo';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
