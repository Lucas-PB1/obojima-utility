'use client';
import { StatsGrid, PageHeader } from '@/components/ui';
import { useAdminStats } from '@/hooks/useAdminStats';
import { UserList } from './UserList';
import { AdminRoute } from './AdminRoute';
import { SystemMigration } from './SystemMigration';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminContent() {
  const { t } = useTranslation();
  const { stats } = useAdminStats();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-mesh p-8 pt-24 font-sans text-foreground animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} icon="🛡️" />

          <div className="space-y-8">
            <StatsGrid title={t('admin.stats.status')} stats={stats} />
            <SystemMigration />
            <UserList />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
