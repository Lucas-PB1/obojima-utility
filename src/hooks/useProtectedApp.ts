'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';

export function useProtectedApp() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { isInitialized } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isClient, router]);

  return {
    user,
    userProfile,
    authLoading,
    isAuthenticated,
    logout,
    isClient,
    isInitialized,
    isReady: isClient && !authLoading && isAuthenticated && isInitialized
  };
}
