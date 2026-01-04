import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';

export class ProfileService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  async ensurePublicProfile(
    user: Pick<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>
  ): Promise<void> {
    if (!this.isClient() || !user.uid) return;

    const publicRef = doc(db, 'public_users', user.uid);
    await setDoc(
      publicRef,
      {
        uid: user.uid,
        displayName: user.displayName,
        searchName: (user.displayName || '').toLowerCase(),
        email: user.email,
        photoURL: user.photoURL,
        lastSeen: Timestamp.now()
      },
      { merge: true }
    );
  }

  async getPublicProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isClient() || !uid) return null;

    try {
      const publicRef = doc(db, 'public_users', uid);
      const snapshot = await getDoc(publicRef);
      
      if (snapshot.exists()) {
        return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching public profile:', error);
      return null;
    }
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    console.log(`[ProfileService] searchUsers triggered with: ${searchTerm}`);
    if (!this.isClient() || !searchTerm || searchTerm.length < 3) return [];

    try {
      const usersRef = collection(db, 'public_users');
      const termLowerCase = searchTerm.toLowerCase();

      // Busca por nome (prefixo)
      const nameQuery = query(
        usersRef,
        where('searchName', '>=', termLowerCase),
        where('searchName', '<=', termLowerCase + '\uf8ff'),
        orderBy('searchName'),
        limit(10)
      );

      // Busca por email (prefixo)
      const emailQuery = query(
        usersRef,
        where('email', '>=', termLowerCase),
        where('email', '<=', termLowerCase + '\uf8ff'),
        orderBy('email'),
        limit(10)
      );

      // Fallback: Busca por displayName (case-sensitive)
      const displayQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        orderBy('displayName'),
        limit(10)
      );

      const [nameSnapshot, emailSnapshot, displaySnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery),
        getDocs(displayQuery)
      ]);

      const usersMap = new Map<string, UserProfile>();

      nameSnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      emailSnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      displaySnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      return Array.from(usersMap.values()).slice(0, 10);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async updateHeartbeat(): Promise<void> {
    const userId = authService.getUserId();
    if (!userId) return;

    try {
      const publicRef = doc(db, 'public_users', userId);
      await updateDoc(publicRef, {
        lastSeen: Timestamp.now()
      });
    } catch (error) {
      logger.warn('Error updating heartbeat, trying to ensure profile exists...', error);
      const user = authService.getCurrentUser();
      if (user) {
        await this.ensurePublicProfile({
           uid: user.uid,
           displayName: user.displayName || 'User',
           email: user.email || '',
           photoURL: user.photoURL
        });
      }
    }
  }
}
