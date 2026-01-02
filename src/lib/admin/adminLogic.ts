import { adminAuth, adminDb } from '@/config/firebase-admin';
import { UserProfile } from '@/types/auth';
import * as admin from 'firebase-admin';
import { UserUtils } from '../userUtils';

/**
 * Utilitários para lógica de administração (Server-side)
 */
export const AdminLogic = {
  /**
   * Formata os dados de um usuário do Firebase Auth para o perfil do Firestore
   */
  formatUserProfile(
    authUser: admin.auth.UserRecord
  ): Partial<UserProfile> & { isAuthActive: boolean; updatedAt: string } {
    const email = authUser.email || null;
    return {
      uid: authUser.uid,
      email: email,
      displayName: authUser.displayName || UserUtils.getFallbackName(email),
      photoURL: authUser.photoURL || null,
      disabled: authUser.disabled || false,
      lastLogin: authUser.metadata.lastSignInTime || undefined,
      updatedAt: new Date().toISOString(),
      isAuthActive: true
    };
  },

  /**
   * Sincroniza um usuário específico ou novo no Firestore
   */
  async syncUserToFirestore(authUser: admin.auth.UserRecord, existingData?: UserProfile) {
    const userRef = adminDb.collection('users').doc(authUser.uid);
    const userData = this.formatUserProfile(authUser);

    if (!existingData) {
      await userRef.set({
        ...userData,
        role: 'user',
        createdAt: authUser.metadata.creationTime || userData.updatedAt
      });
      return 'created';
    } else {
      const updates: Partial<UserProfile> = {};
      if (existingData.email !== userData.email) updates.email = userData.email;
      if (existingData.displayName !== userData.displayName)
        updates.displayName = userData.displayName;
      if (existingData.photoURL !== userData.photoURL) updates.photoURL = userData.photoURL;
      if (existingData.lastLogin !== userData.lastLogin) updates.lastLogin = userData.lastLogin;
      if (existingData.disabled !== userData.disabled) updates.disabled = userData.disabled;
      if (!existingData.isAuthActive) updates.isAuthActive = true;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = userData.updatedAt;
        await userRef.update(updates);
        return 'updated';
      }
    }
    return 'unchanged';
  }
};
