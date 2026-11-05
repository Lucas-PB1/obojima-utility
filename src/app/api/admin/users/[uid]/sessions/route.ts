import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logAdminAction } from '@/lib/server/adminAudit';
import { logger } from '@/utils/logger';

/** Signs the player out of every device by revoking their refresh tokens. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;

    await adminAuth.revokeRefreshTokens(uid);
    await logAdminAction(
      admin,
      'user.sessions',
      'Sessões encerradas em todos os dispositivos',
      uid
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;
    logger.error('Error revoking sessions:', error);
    const message = error instanceof Error ? error.message : 'Falha ao encerrar sessões';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
