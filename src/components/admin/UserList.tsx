'use client';
import React, { useState } from 'react';
import Image from 'next/image';
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

  const mobileRenderer = (user: UserProfile) => {
    return (
      <div
        onClick={() => handleRowClick(user)}
        className="flex items-center justify-between p-5 hover:bg-totoro-blue/5 transition-colors active:bg-totoro-blue/10 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-totoro-blue/10 flex items-center justify-center text-lg text-totoro-blue font-bold border-2 border-white shadow-sm relative overflow-hidden">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || ''}
                fill
                className="object-cover"
              />
            ) : (
              (user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-totoro-gray text-sm group-hover:text-totoro-blue transition-colors">
              {user.displayName || t('admin.users.noName')}
            </span>
            <span className="text-[11px] text-totoro-gray/50 font-medium truncate max-w-[180px]">
              {user.email || t('admin.users.noEmail')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              user.role === 'admin'
                ? 'bg-totoro-blue/10 text-totoro-blue'
                : 'bg-totoro-gray/10 text-totoro-gray/60'
            }`}
          >
            {user.role}
          </span>
          <span
            className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
              user.isAuthActive ? 'text-totoro-green' : 'text-totoro-orange'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${user.isAuthActive ? 'bg-totoro-green' : 'bg-totoro-orange'}`}
            />
            {user.isAuthActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    );
  };

  if (loading && users.length === 0) return <div>Loading users...</div>;

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        searchKeys={['displayName', 'email', 'role', 'isAuthActive']}
        searchPlaceholder={t('admin.users.search')}
        onRowClick={handleRowClick}
        title={t('admin.users.title', users.length)}
        icon="👥"
        action={
          <Button onClick={handleSync} variant="primary" size="sm" disabled={loading}>
            {t('admin.users.sync')}
          </Button>
        }
        mobileRenderer={mobileRenderer}
      />

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
