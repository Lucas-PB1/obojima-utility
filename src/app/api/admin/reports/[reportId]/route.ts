import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';
import { UserReport } from '@/types/social';

const validStatuses: UserReport['status'][] = ['open', 'reviewed', 'dismissed'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    await requireAdmin(req);

    const { reportId } = await params;
    const body = (await req.json()) as { status?: UserReport['status'] };

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Invalid report status' }, { status: 400 });
    }

    await adminDb.collection('reports').doc(reportId).update({
      status: body.status,
      reviewedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error updating report status:', error);
    const message = error instanceof Error ? error.message : 'Falha ao atualizar denúncia';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
