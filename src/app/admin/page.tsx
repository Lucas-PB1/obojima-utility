'use client';

import AdminRoute from '@/components/admin/AdminRoute';
import UserList from '@/components/admin/UserList';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminPage() {
  const { t } = useTranslation();
  const { stats } = useAdminStats();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-mesh p-8 pt-24 font-sans text-foreground animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title={t('admin.title')}
            subtitle={t('admin.subtitle')}
            icon="🛡️"
          />

          <div className="space-y-8">
            <StatsGrid title={t('admin.stats.status')} stats={stats} />
            <UserList />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
