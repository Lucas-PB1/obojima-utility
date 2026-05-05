import { auth, isFirebaseConfigured } from '@/config/firebase';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { socialService } from '@/services/socialService';
import { getDevState, isDevMode } from '@/features/dev-mode';

class AuthService {
  private createGoogleProvider(): GoogleAuthProvider {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }

  private async ensurePublicProfile(user: User): Promise<void> {
    await socialService.ensurePublicProfile({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || null
    });
  }

  async register(email: string, password: string): Promise<UserCredential> {
    if (typeof window === 'undefined') {
      throw new Error('Autenticação só pode ser feita no cliente');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await this.ensurePublicProfile(userCredential.user);
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
        await this.ensurePublicProfile(userCredential.user);
      }

      return userCredential;
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      throw this.handleAuthError(error);
    }
  }

  async loginWithGoogle(): Promise<UserCredential> {
    if (typeof window === 'undefined') {
      throw new Error('Autenticação só pode ser feita no cliente');
    }

    try {
      const userCredential = await signInWithPopup(auth, this.createGoogleProvider());

      if (userCredential.user) {
        await this.ensurePublicProfile(userCredential.user);
      }

      return userCredential;
    } catch (error) {
      logger.error('Erro ao fazer login com Google:', error);
      throw this.handleAuthError(error);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Autenticação só pode ser feita no cliente');
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      logger.error('Erro ao enviar reset de senha:', error);
      throw this.handleAuthError(error);
    }
  }

  async linkGoogleAccount(): Promise<User> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const userCredential = await linkWithPopup(user, this.createGoogleProvider());
      await userCredential.user.reload();

      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      return userCredential.user;
    } catch (error) {
      logger.error('Erro ao vincular conta Google:', error);
      throw this.handleAuthError(error);
    }
  }

  getLinkedProviderIds(user: User | null = this.getCurrentUser()): string[] {
    return user?.providerData.map((provider) => provider.providerId) || [];
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
    if (isDevMode()) {
      const state = getDevState();
      const user = state.users.find((item) => item.uid === state.activeUserId) || state.users[0];
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerData: [],
        getIdToken: async () => 'dev-token'
      } as unknown as User;
    }
    if (!isFirebaseConfigured) return null;
    if (typeof window === 'undefined') return null;
    return auth.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (isDevMode()) {
      callback(this.getCurrentUser());
      return () => {};
    }

    if (typeof window === 'undefined' || !isFirebaseConfigured) {
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

  async getIdToken(): Promise<string> {
    if (isDevMode()) return 'dev-token';
    if (!isFirebaseConfigured) throw new Error('Firebase não configurado');
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.getIdToken();
  }

  async getAuthorizationHeaders(): Promise<HeadersInit> {
    const token = await this.getIdToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

  private handleAuthError(error: unknown): Error {
    let message = 'Erro desconhecido ao autenticar';

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };

      switch (firebaseError.code) {
        case 'auth/invalid-credential':
          message = 'Senha atual incorreta';
          break;
        case 'auth/email-already-in-use':
          message = 'Este email já está em uso';
          break;
        case 'auth/account-exists-with-different-credential':
          message =
            'Já existe uma conta com este email. Entre com email e senha e vincule o Google nas configurações da conta.';
          break;
        case 'auth/credential-already-in-use':
          message = 'Esta conta Google já está vinculada a outro usuário.';
          break;
        case 'auth/provider-already-linked':
          message = 'Sua conta Google já está vinculada.';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Login com Google cancelado.';
          break;
        case 'auth/popup-blocked':
          message = 'O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente.';
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
        case 'auth/requires-recent-login':
          message = 'Confirme sua senha atual para continuar';
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

      await setDoc(
        doc(db, 'users', user.uid),
        {
          displayName: displayName || 'User',
          email: user.email || '',
          photoURL: photoURL,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      throw this.handleAuthError(error);
    }
  }

  async updatePasswordWithReauth(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');
    if (!user.email) throw new Error('Usuário sem email associado');

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      logger.error('Erro ao atualizar senha:', error);
      throw this.handleAuthError(error);
    }
  }
}

export const authService = new AuthService();
