import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { Timestamp } from 'firebase-admin/firestore';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const listUsersResult = await adminAuth.listUsers();
    const authUsers = listUsersResult.users;

    let updatedCount = 0;
    const batch = adminDb.batch();

    for (const authUser of authUsers) {
      const userRef = adminDb.collection('public_users').doc(authUser.uid);
      const displayName = authUser.displayName || 'Bardo Viajante';

      const publicProfile = {
        uid: authUser.uid,
        displayName,
        searchName: displayName.toLowerCase(),
        photoURL: authUser.photoURL || null,
        createdAt: Timestamp.now(),
        lastSeen: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      batch.set(userRef, publicProfile);
      updatedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Migração completa: ${updatedCount} perfis públicos sincronizados.`
    });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error migrating public profiles:', error);

    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('The default Firebase app does not exist')) {
      errorMessage = 'Firebase Admin não inicializado.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Falha na migração',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
