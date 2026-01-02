import { useState, useEffect, useMemo } from 'react';
import { adminService } from '@/services/adminService';
import { useTranslation } from './useTranslation';

export function useAdminStats() {
  const { t } = useTranslation();
  const [userCount, setUserCount] = useState<number | string>('...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        await adminService.syncUsers().catch((err) => console.error('Auto-sync failed:', err));
        const count = await adminService.getUserCount();
        setUserCount(count);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = useMemo(
    () => [
      { label: t('admin.stats.users'), value: userCount, color: 'totoro-blue' as const },
      { label: t('admin.stats.sessions'), value: '...', color: 'totoro-green' as const },
      { label: t('admin.stats.reviews'), value: '...', color: 'totoro-yellow' as const },
      { label: t('admin.stats.status'), value: 'Good', color: 'totoro-gray' as const }
    ],
    [t, userCount]
  );

  return {
    userCount,
    stats,
    loading
  };
}
