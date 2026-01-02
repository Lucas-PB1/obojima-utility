'use client';
import DataTable from '@/components/ui/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useUserTableColumns } from '@/hooks/useUserTableColumns';

export default function UserList() {
  const { t } = useTranslation();
  const { users, loading, handleSync, handleUpdate, handleDelete } = useAdminUsers();
  const columns = useUserTableColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete
  });

  if (loading && users.length === 0) return <div>Loading users...</div>;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-totoro-green">
          {t('admin.users.title', users.length)}
        </h2>
        <Button onClick={handleSync} variant="primary" size="sm" disabled={loading}>
          {t('admin.users.sync')}
        </Button>
      </div>
      <DataTable
        data={users}
        columns={columns}
        searchKeys={['displayName', 'email', 'role', 'isAuthActive']}
        searchPlaceholder={t('admin.users.search')}
      />
    </div>
  );
}
