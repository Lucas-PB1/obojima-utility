import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

function participantsFromChatId(chatId: string): string[] {
  const [first, ...rest] = chatId.split('_');
  const second = rest.join('_');
  return first && second ? [first, second] : [];
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const snapshot = await adminDb.collection('chats').get();
    let updatedCount = 0;
    const batch = adminDb.batch();

    snapshot.docs.forEach((chatDoc) => {
      const participants = chatDoc.data().participants || participantsFromChatId(chatDoc.id);

      if (participants.length === 2) {
        batch.set(chatDoc.ref, { participants }, { merge: true });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Backfill completo: ${updatedCount} chats atualizados.`
    });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error backfilling chat participants:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha no backfill';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
