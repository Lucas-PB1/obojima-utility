"use client";
import { db } from '@/config/firebase';
import { logger } from '@/utils/logger';
import { UserProfile } from '@/types/auth';
import { adminService } from '@/services/adminService';
import { useTranslation } from '@/hooks/useTranslation';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            uid: doc.id
          }) as UserProfile
      );
      setUsers(usersData);
    } catch (error) {
      logger.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSync = async () => {
    try {
      setLoading(true);
      await adminService.syncUsers();
      alert(t('admin.users.sync.success'));
      await fetchUsers();
    } catch (error) {
      logger.error('Error syncing users:', error);
      const errorMessage = error instanceof Error ? error.message : t('admin.users.sync.error');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      await adminService.updateUser(uid, updates);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u)));
    } catch (error) {
      logger.error('Error updating user:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('admin.users.role.update.error');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string, name: string) => {
    if (!confirm(t('admin.users.delete.confirm', name))) return;

    try {
      setLoading(true);
      await adminService.deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      alert(t('admin.users.delete.success'));
    } catch (error) {
      logger.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : t('admin.users.delete.error');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    handleSync,
    handleUpdate,
    handleDelete,
    refresh: fetchUsers
  };
}
