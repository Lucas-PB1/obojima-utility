import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { AdminLogic } from '@/lib/admin/adminLogic';
import { logger } from '@/utils/logger';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logAdminAction } from '@/lib/server/adminAudit';

const BATCH_LIMIT = 400;

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    // listUsers() returns at most 1000 accounts per page; walk every page.
    const authUsers: Awaited<ReturnType<typeof adminAuth.listUsers>>['users'] = [];
    let pageToken: string | undefined;
    do {
      const page = await adminAuth.listUsers(1000, pageToken);
      authUsers.push(...page.users);
      pageToken = page.pageToken;
    } while (pageToken);

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
    let orphanedCount = 0;
    let batch = adminDb.batch();
    let pending = 0;

    for (const [uid, data] of firestoreUsers) {
      if (!authUids.has(uid) && data.isAuthActive !== false) {
        batch.update(adminDb.collection('users').doc(uid), {
          isAuthActive: false,
          updatedAt: now
        });
        orphanedCount++;
        pending++;
        // A Firestore batch accepts at most 500 writes.
        if (pending >= BATCH_LIMIT) {
          await batch.commit();
          batch = adminDb.batch();
          pending = 0;
        }
      }
    }

    if (pending > 0) await batch.commit();

    const message = `Sync completo: ${createdCount} novos, ${updatedCount} atualizados, ${orphanedCount} órfãos. Total Auth: ${authUsers.length}.`;
    await logAdminAction(admin, 'users.sync', message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('Error syncing users:', error);

    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('The default Firebase app does not exist')) {
      errorMessage =
        'Firebase Admin não inicializado. Verifique se as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY estão corretamente configuradas no seu .env.local.';
    }

    return NextResponse.json(
      {
        success: false,
        error: `Falha ao sincronizar usuários: ${errorMessage}`,
        details: errorMessage,
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
