'use client';

import AdminRoute from '@/components/admin/AdminRoute';
import UserList from '@/components/admin/UserList';
import StatsGrid from '@/components/ui/StatsGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminPage() {
  const { t } = useTranslation();
  const { stats } = useAdminStats();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-totoro-bg p-8 pt-24 font-sans text-foreground">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-totoro-green tracking-tight">
              {t('admin.title')}
            </h1>
            <p className="text-lg text-foreground/60">{t('admin.subtitle')}</p>
          </div>

          <StatsGrid title={t('admin.stats.status')} stats={stats} />

          <div className="grid gap-8">
            <UserList />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
