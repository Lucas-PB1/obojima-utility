import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';
import { UserReport } from '@/types/social';
import { logAdminAction } from '@/lib/server/adminAudit';

const STATUS_LABELS: Record<UserReport['status'], string> = {
  open: 'reaberta',
  reviewed: 'revisada',
  dismissed: 'dispensada'
};

const validStatuses: UserReport['status'][] = ['open', 'reviewed', 'dismissed'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const admin = await requireAdmin(req);

    const { reportId } = await params;
    const body = (await req.json()) as { status?: UserReport['status']; note?: string };

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Invalid report status' }, { status: 400 });
    }

    const ref = adminDb.collection('reports').doc(reportId);
    const report = (await ref.get()).data();
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Denúncia não encontrada' },
        { status: 404 }
      );
    }

    const note = String(body.note || '')
      .trim()
      .slice(0, 1000);
    await ref.update({
      status: body.status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: admin.uid,
      ...(note ? { resolutionNote: note } : {})
    });

    await logAdminAction(
      admin,
      'report.status',
      `Denúncia (${report.reason}) ${STATUS_LABELS[body.status]}${note ? `: ${note}` : ''}`,
      report.reportedUserId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error updating report status:', error);
    const message = error instanceof Error ? error.message : 'Falha ao atualizar denúncia';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
