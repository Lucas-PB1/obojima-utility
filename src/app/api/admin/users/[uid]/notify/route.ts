import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logAdminAction } from '@/lib/server/adminAudit';
import { createSocialNotification } from '@/lib/server/social';
import { logger } from '@/utils/logger';

const MAX_TITLE = 80;
const MAX_BODY = 500;

/** Sends a system notification (in-app + push when enabled) to one player. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    const body = (await req.json()) as { title?: string; message?: string };
    const title = String(body.title || '').trim();
    const message = String(body.message || '').trim();

    if (!title || !message || title.length > MAX_TITLE || message.length > MAX_BODY) {
      return NextResponse.json(
        {
          success: false,
          error: `Título (até ${MAX_TITLE}) e mensagem (até ${MAX_BODY} caracteres) são obrigatórios`
        },
        { status: 400 }
      );
    }
    if (!(await adminDb.collection('users').doc(uid).get()).exists) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    await createSocialNotification({
      recipientId: uid,
      type: 'system',
      actorName: 'Obojima',
      title,
      body: message
    });
    await logAdminAction(admin, 'user.notify', `Notificação enviada: "${title}"`, uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;
    logger.error('Error sending admin notification:', error);
    const message = error instanceof Error ? error.message : 'Falha ao enviar notificação';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
