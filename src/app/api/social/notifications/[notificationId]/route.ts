import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { notificationId } = await params;

    await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .doc(notificationId)
      .set({ read: true }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error marking notification as read:', error);
    const message = error instanceof Error ? error.message : 'Falha ao atualizar notificação';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
