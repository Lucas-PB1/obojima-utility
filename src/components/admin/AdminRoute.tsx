'use client';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-totoro-blue"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="bg-red-50 border-b border-red-100 p-2 text-center text-xs text-red-600 font-mono">
        ADMIN MODE ACTIVE
      </div>
      {children}
    </>
  );
}
