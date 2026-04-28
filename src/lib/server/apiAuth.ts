import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';

export interface ApiUser {
  uid: string;
  email?: string;
}

export class ApiAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiAuthError';
    this.status = status;
  }
}

function getBearerToken(req: NextRequest): string {
  const header = req.headers.get('authorization');
  const match = header?.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new ApiAuthError(401, 'Missing authorization token');
  }

  return match[1];
}

export async function requireUser(req: NextRequest): Promise<ApiUser> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(getBearerToken(req));
    return {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  } catch (error) {
    if (error instanceof ApiAuthError) throw error;
    throw new ApiAuthError(401, 'Invalid authorization token');
  }
}

export async function requireAdmin(req: NextRequest): Promise<ApiUser> {
  const user = await requireUser(req);
  await assertCanAccessUser(user, '*');
  return user;
}

export async function assertCanAccessUser(user: ApiUser, targetUid: string): Promise<void> {
  if (targetUid === user.uid) return;

  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  const role = userDoc.exists ? userDoc.data()?.role : undefined;

  if (role !== 'admin') {
    throw new ApiAuthError(403, 'Admin access required');
  }
}

export function apiAuthErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof ApiAuthError)) return null;

  return NextResponse.json(
    {
      success: false,
      error: error.message
    },
    { status: error.status }
  );
}
