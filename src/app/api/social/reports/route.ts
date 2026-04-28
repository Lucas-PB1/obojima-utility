import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { ReportReason } from '@/types/social';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { getPublicProfile } from '@/lib/server/social';
import { logger } from '@/utils/logger';

interface ReportBody {
  reportedUserId?: string;
  reason?: ReportReason;
  details?: string;
}

const validReasons: ReportReason[] = ['spam', 'abuse', 'harassment', 'trade', 'other'];

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { reportedUserId, reason = 'other', details = '' } = (await req.json()) as ReportBody;

    if (!reportedUserId || reportedUserId === user.uid) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 });
    }

    if (!validReasons.includes(reason)) {
      return NextResponse.json({ success: false, error: 'Motivo inválido' }, { status: 400 });
    }

    const [reporter, reported] = await Promise.all([
      getPublicProfile(user.uid),
      getPublicProfile(reportedUserId)
    ]);

    const reportRef = await adminDb.collection('reports').add({
      reporterId: user.uid,
      reportedUserId,
      reporter,
      reported,
      reason,
      details: details.trim().slice(0, 1000),
      status: 'open',
      createdAt: Timestamp.now()
    });

    return NextResponse.json({ success: true, reportId: reportRef.id });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error reporting user:', error);
    const message = error instanceof Error ? error.message : 'Falha ao denunciar usuário';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
