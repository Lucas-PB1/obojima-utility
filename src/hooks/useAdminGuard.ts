'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdminDemoMode } from '@/features/admin/domain/adminRules';

export function useAdminGuard() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin && !isAdminDemoMode()) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  return {
    isAuthorized: isAdmin || isAdminDemoMode(),
    isLoading: loading
  };
}
