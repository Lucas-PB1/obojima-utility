import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { AdminLogic } from '@/lib/admin/adminLogic';
import { logger } from '@/utils/logger';

export async function POST() {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const authUsers = listUsersResult.users;

    const firestoreSnap = await adminDb.collection('users').get();
    const firestoreUsers = new Map();
    firestoreSnap.forEach((doc) => firestoreUsers.set(doc.id, doc.data()));

    let updatedCount = 0;
    let createdCount = 0;
    const now = new Date().toISOString();

    for (const authUser of authUsers) {
      const existing = firestoreUsers.get(authUser.uid);
      const result = await AdminLogic.syncUserToFirestore(authUser, existing);

      if (result === 'created') createdCount++;
      else if (result === 'updated') updatedCount++;
    }

    const authUids = new Set(authUsers.map((u) => u.uid));
    const batch = adminDb.batch();
    let orphanedCount = 0;

    for (const [uid, data] of firestoreUsers) {
      if (!authUids.has(uid) && data.isAuthActive !== false) {
        batch.update(adminDb.collection('users').doc(uid), {
          isAuthActive: false,
          updatedAt: now
        });
        orphanedCount++;
      }
    }

    if (orphanedCount > 0) await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Sync completo: ${createdCount} novos, ${updatedCount} atualizados, ${orphanedCount} órfãos. Total Auth: ${authUsers.length}.`
    });
  } catch (error) {
    logger.error('Error syncing users:', error);

    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('The default Firebase app does not exist')) {
      errorMessage =
        'Firebase Admin não inicializado. Verifique se as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY estão corretamente configuradas no seu .env.local.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao sincronizar usuários',
        details: errorMessage,
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
