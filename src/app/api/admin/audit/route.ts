import { NextRequest, NextResponse } from 'next/server';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { listAdminAudit } from '@/lib/server/adminAudit';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const entries = await listAdminAudit({
      targetUid: searchParams.get('targetUid'),
      limit: Number(searchParams.get('limit')) || 100
    });
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;
    logger.error('Error listing admin audit:', error);
    const message = error instanceof Error ? error.message : 'Falha ao carregar auditoria';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
