'use client';
import React, { useState } from 'react';
import { UserProfile } from '@/types/auth';
import { Button, DataTable } from '@/components/ui';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserTableColumns } from '@/hooks/useUserTableColumns';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';

export function UserList() {
  const { t } = useTranslation();
  const { users, loading, handleSync, handleUpdate, handleDelete } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = useUserTableColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete
  });

  const handleRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) return <div>Loading users...</div>;

  return (
    <>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
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
          onRowClick={handleRowClick}
        />
      </div>

      <AdminUserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
