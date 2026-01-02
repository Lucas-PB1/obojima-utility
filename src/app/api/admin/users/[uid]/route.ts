import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/config/firebase-admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const body = await req.json();
    const { displayName, disabled, role } = body;

    const updates: any = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (disabled !== undefined) updates.disabled = disabled;

    if (Object.keys(updates).length > 0) {
      await adminAuth.updateUser(uid, updates);
    }

    const firestoreUpdates: any = { ...updates, updatedAt: new Date().toISOString() };
    if (role !== undefined) firestoreUpdates.role = role;

    await adminDb.collection('users').doc(uid).update(firestoreUpdates);

    return NextResponse.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao atualizar usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;

    try {
      await adminAuth.deleteUser(uid);
    } catch (e: any) {
      console.warn(`User ${uid} not found in Auth, continuing with Firestore cleanup.`);
    }

    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao excluir usuário' },
      { status: 500 }
    );
  }
}
