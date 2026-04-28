import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { logger } from '@/utils/logger';

interface TokenBody {
  token?: string;
}

function tokenDocId(token: string): string {
  return Buffer.from(token).toString('base64url').slice(0, 1400);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { token } = (await req.json()) as TokenBody;

    if (!token || token.length > 4096) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 400 });
    }

    await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('fcmTokens')
      .doc(tokenDocId(token))
      .set(
        {
          token,
          userAgent: req.headers.get('user-agent') || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error registering FCM token:', error);
    const message = error instanceof Error ? error.message : 'Falha ao registrar push';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { token } = (await req.json()) as TokenBody;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 400 });
    }

    await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('fcmTokens')
      .doc(tokenDocId(token))
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error removing FCM token:', error);
    const message = error instanceof Error ? error.message : 'Falha ao remover push';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
