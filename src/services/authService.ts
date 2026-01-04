import { auth } from '@/config/firebase';
import { logger } from '@/utils/logger';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User,
  UserCredential
} from 'firebase/auth';

import { socialService } from '@/services/socialService';

class AuthService {
  async register(email: string, password: string): Promise<UserCredential> {
    if (typeof window === 'undefined') {
      throw new Error('Autenticação só pode ser feita no cliente');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await socialService.ensurePublicProfile({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || 'User',
          photoURL: userCredential.user.photoURL || null
        });
      }

      return userCredential;
    } catch (error) {
      logger.error('Erro ao registrar usuário:', error);
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    if (typeof window === 'undefined') {
      throw new Error('Autenticação só pode ser feita no cliente');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await socialService.ensurePublicProfile({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || 'User',
          photoURL: userCredential.user.photoURL || null
        });
      }

      return userCredential;
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await signOut(auth);
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    return auth.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (typeof window === 'undefined') {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, callback);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.uid || null;
  }

  private handleAuthError(error: unknown): Error {
    let message = 'Erro desconhecido ao autenticar';

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };

      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida';
          break;
        case 'auth/weak-password':
          message = 'Senha muito fraca. Use pelo menos 6 caracteres';
          break;
        case 'auth/user-disabled':
          message = 'Usuário desabilitado';
          break;
        case 'auth/user-not-found':
          message = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          message = 'Senha incorreta';
          break;
        case 'auth/too-many-requests':
          message = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/network-request-failed':
          message = 'Erro de conexão. Verifique sua internet';
          break;
        default:
          message = firebaseError.message || message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return new Error(message);
  }

  async updateProfile(displayName: string, photoURL: string | null): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      await updateProfile(user, {
        displayName,
        photoURL
      });

      await socialService.ensurePublicProfile({
        uid: user.uid,
        displayName: displayName || 'User',
        email: user.email || '',
        photoURL: photoURL
      });
      
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      throw this.handleAuthError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      logger.error('Erro ao atualizar senha:', error);
      throw this.handleAuthError(error);
    }
  }
}

export const authService = new AuthService();
