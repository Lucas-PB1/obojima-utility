import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getBlockId } from '@/features/social/domain/socialRules';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blockedUserId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { blockedUserId } = await params;

    if (!blockedUserId || blockedUserId === user.uid) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 });
    }

    await adminDb.collection('blocks').doc(getBlockId(user.uid, blockedUserId)).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error unblocking user:', error);
    const message = error instanceof Error ? error.message : 'Falha ao desbloquear usuário';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
