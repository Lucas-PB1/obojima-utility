'use client';
import { User } from 'firebase/auth';
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserUtils } from '@/lib/userUtils';
import { authService } from '@/services/authService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
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
            setUserProfile(newProfile);
          }
        } catch (error) {
          logger.error('Error fetching/creating user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
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
