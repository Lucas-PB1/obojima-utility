'use client';
import { User } from 'firebase/auth';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserUtils } from '@/lib/userUtils';
import { authService } from '@/services/authService';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { e2eUser, isE2EMode } from '@/lib/e2e/mockData';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { isAdminDemoMode } from '@/features/admin/domain/adminRules';
import { getDevState, isDevMode } from '@/features/dev-mode';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    if (isE2EMode() || isAdminDemoMode() || isDevMode()) {
      const devState = getDevState();
      const devProfile =
        devState.users.find((item) => item.uid === devState.activeUserId) || devState.users[0];
      setUser(e2eUser as User);
      setUserProfile(devProfile);
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (!data.displayName || !data.email) {
              await updateDoc(userDocRef, {
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                lastLogin: new Date().toISOString()
              });
              setUserProfile({
                ...data,
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                lastLogin: new Date().toISOString()
              });
            } else {
              await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
              setUserProfile(data);
            }
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || UserUtils.getFallbackName(currentUser.email),
              photoURL: currentUser.photoURL,
              role: 'user',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
          }

          profileUnsubscribe = onSnapshot(
            userDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setUserProfile(snapshot.data() as UserProfile);
              }
            },
            (error) => {
              logger.error('Error subscribing to user profile:', error);
            }
          );
        } catch (error) {
          logger.error('Error fetching/creating user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    if (isE2EMode() || isAdminDemoMode() || isDevMode()) return;

    try {
      firebaseStorageService.cleanup();
      firebaseRecipeService.cleanup();
      firebaseCreatedPotionService.cleanup();
      firebaseSettingsService.cleanup();
      await authService.logout();
      router.push('/login');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    loading,
    isAuthenticated: !!user,
    logout
  };
}
