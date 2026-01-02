import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST() {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const authUsers = listUsersResult.users;

    let updatedCount = 0;
    const batch = adminDb.batch();

    for (const authUser of authUsers) {
      const userRef = adminDb.collection('public_users').doc(authUser.uid);

      const publicProfile = {
        uid: authUser.uid,
        displayName: authUser.displayName || 'Bardo Viajante',
        searchName: (authUser.displayName || 'Bardo Viajante').toLowerCase(),
        email: authUser.email || '',
        photoURL: authUser.photoURL || null,
        lastSeen: Timestamp.now()
      };

      batch.set(userRef, publicProfile, { merge: true });
      updatedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Migração completa: ${updatedCount} perfis públicos sincronizados.`
    });
  } catch (error) {
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
