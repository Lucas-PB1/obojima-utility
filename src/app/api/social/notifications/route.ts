import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const snapshot = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .where('read', '==', false)
      .limit(100)
      .get();

    if (!snapshot.empty) {
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error marking notifications as read:', error);
    const message = error instanceof Error ? error.message : 'Falha ao atualizar notificações';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
