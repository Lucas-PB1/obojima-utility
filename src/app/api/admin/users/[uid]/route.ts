import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';

interface UserUpdateBody {
  displayName?: string;
  disabled?: boolean;
  role?: string;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const body = await req.json();
    const { displayName, disabled, role } = body as UserUpdateBody;

    const updates: Partial<UserProfile> = {};
    const authUpdates: { displayName?: string; disabled?: boolean } = {};

    if (displayName !== undefined) {
      authUpdates.displayName = displayName;
      updates.displayName = displayName;
    }
    if (disabled !== undefined) {
      authUpdates.disabled = disabled;
      updates.disabled = disabled;
    }

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
    }

    const firestoreUpdates: Partial<UserProfile> & { updatedAt: string } = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (role !== undefined) firestoreUpdates.role = role as 'admin' | 'user';

    await adminDb.collection('users').doc(uid).update(firestoreUpdates);

    return NextResponse.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    logger.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;

    try {
      await adminAuth.deleteUser(uid);
    } catch (e) {
      logger.warn(`User ${uid} not found in Auth, continuing with Firestore cleanup.`);
    }

    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir usuário';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
