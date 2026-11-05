import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { AdminReportRow } from '@/features/admin/types';
import { UserReport } from '@/types/social';
import { logger } from '@/utils/logger';

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return String(value);
}

/** Moderation queue: every report with reporter and reported names resolved. */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const snapshot = await adminDb
      .collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const uids = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.reporterId) uids.add(data.reporterId);
      if (data.reportedUserId) uids.add(data.reportedUserId);
    });

    const names = new Map<string, string>();
    const refs = Array.from(uids).map((uid) => adminDb.collection('users').doc(uid));
    if (refs.length > 0) {
      const docs = await adminDb.getAll(...refs);
      docs.forEach((doc) => {
        const data = doc.data();
        names.set(doc.id, String(data?.displayName || data?.email || doc.id));
      });
    }

    const reports: AdminReportRow[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId,
        reason: data.reason as UserReport['reason'],
        details: data.details || '',
        status: (data.status || 'open') as UserReport['status'],
        createdAt: toIso(data.createdAt) || '',
        reviewedAt: toIso(data.reviewedAt),
        reviewedBy: data.reviewedBy || null,
        resolutionNote: data.resolutionNote || null,
        reporterName: names.get(data.reporterId) || data.reporterId || '-',
        reportedName: names.get(data.reportedUserId) || data.reportedUserId || '-'
      };
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;
    logger.error('Error listing reports:', error);
    const message = error instanceof Error ? error.message : 'Falha ao carregar denúncias';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
