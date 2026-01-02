import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { useTranslation } from './useTranslation';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';

export function useAdminStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<
    Array<{
      label: string;
      value: string | number;
      color: 'totoro-blue' | 'totoro-green' | 'totoro-yellow' | 'totoro-gray' | 'totoro-orange';
    }>
  >([
    { label: t('admin.stats.users'), value: '...', color: 'totoro-blue' },
    { label: t('admin.stats.admins'), value: '...', color: 'totoro-orange' },
    { label: t('admin.stats.active'), value: '...', color: 'totoro-green' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const users = await adminService.getAllUsers();

        const totalUsers = users.length;
        const adminCount = users.filter((u: UserProfile) => u.role === 'admin').length;
        const activeCount = users.filter((u: UserProfile) => u.isAuthActive).length;

        setStats([
          { label: t('admin.stats.users'), value: totalUsers, color: 'totoro-blue' as const },
          { label: t('admin.stats.admins'), value: adminCount, color: 'totoro-orange' as const },
          { label: t('admin.stats.active'), value: activeCount, color: 'totoro-green' as const }
        ]);
      } catch (error) {
        logger.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [t]);

  return {
    stats,
    loading
  };
}
