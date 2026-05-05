'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserProfile } from '@/types/auth';
import { adminService } from '@/services/adminService';
import { logger } from '@/utils/logger';
import { AdminDashboardState, AdminUserDetails } from '../types';
import { adminDemoDashboard } from '../data/demoData';
import { clampAdminQuantity, getAdminUserStatus } from '../domain/adminRules';

export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardState>(adminDemoDashboard);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'orphaned'>(
    'all'
  );

  const mode = dashboard.mode;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDashboard(await adminService.getDashboard());
    } catch (err) {
      logger.error('Error loading admin dashboard:', err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openUser = useCallback(async (user: UserProfile) => {
    setSelectedUser(user);
    setDetails(null);
    setDetailsLoading(true);
    try {
      setDetails(await adminService.getUserDetails(user.uid));
    } catch (err) {
      logger.error('Error loading admin user details:', err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeUser = useCallback(() => {
    setSelectedUser(null);
    setDetails(null);
  }, []);

  const syncUsers = useCallback(async () => {
    try {
      setLoading(true);
      await adminService.syncUsers();
      await refresh();
    } catch (err) {
      logger.error('Error syncing users:', err);
      setError(err instanceof Error ? err.message : 'Falha ao sincronizar usuários');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateUser = useCallback(async (uid: string, updates: Partial<UserProfile>) => {
    try {
      await adminService.updateUser(uid, updates);
      setDashboard((prev) => ({
        ...prev,
        users: prev.users.map((user) => (user.uid === uid ? { ...user, ...updates } : user))
      }));
      setSelectedUser((prev) => (prev?.uid === uid ? { ...prev, ...updates } : prev));
      setDetails((prev) =>
        prev?.user.uid === uid ? { ...prev, user: { ...prev.user, ...updates } } : prev
      );
    } catch (err) {
      logger.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar usuário');
    }
  }, []);

  const updateUserGold = useCallback(async (uid: string, gold: number) => {
    try {
      await adminService.updateUserGold(uid, gold);
      setDetails((prev) => (prev?.user.uid === uid ? { ...prev, gold: Math.max(0, gold) } : prev));
    } catch (err) {
      logger.error('Error updating user gold:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar gold');
    }
  }, []);

  const deleteUser = useCallback(
    async (uid: string) => {
      try {
        await adminService.deleteUser(uid);
        setDashboard((prev) => ({
          ...prev,
          users: prev.users.filter((user) => user.uid !== uid)
        }));
        closeUser();
      } catch (err) {
        logger.error('Error deleting user:', err);
        setError(err instanceof Error ? err.message : 'Falha ao excluir usuário');
      }
    },
    [closeUser]
  );

  const updateReportStatus = useCallback(
    async (reportId: string, status: 'open' | 'reviewed' | 'dismissed') => {
      try {
        await adminService.updateReportStatus(reportId, status);
        setDetails((prev) =>
          prev
            ? {
                ...prev,
                social: {
                  ...prev.social,
                  reports: prev.social.reports.map((report) =>
                    report.id === reportId ? { ...report, status } : report
                  )
                }
              }
            : prev
        );
      } catch (err) {
        logger.error('Error updating report status:', err);
        setError(err instanceof Error ? err.message : 'Falha ao atualizar denúncia');
      }
    },
    []
  );

  const updateIngredientQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!details) return;
      const safeQuantity = clampAdminQuantity(quantity);
      try {
        await adminService.updateIngredientQuantity(details.user.uid, itemId, safeQuantity);
        setDetails((prev) =>
          prev
            ? {
                ...prev,
                ingredients: prev.ingredients.map((item) =>
                  item.id === itemId ? { ...item, quantity: safeQuantity } : item
                )
              }
            : prev
        );
      } catch (err) {
        logger.error('Error updating ingredient quantity:', err);
        setError(err instanceof Error ? err.message : 'Falha ao atualizar ingrediente');
      }
    },
    [details]
  );

  const deleteIngredient = useCallback(
    async (itemId: string) => {
      if (!details) return;
      try {
        await adminService.deleteIngredient(details.user.uid, itemId);
        setDetails((prev) =>
          prev
            ? { ...prev, ingredients: prev.ingredients.filter((item) => item.id !== itemId) }
            : prev
        );
      } catch (err) {
        logger.error('Error deleting ingredient:', err);
        setError(err instanceof Error ? err.message : 'Falha ao remover ingrediente');
      }
    },
    [details]
  );

  const updatePotionQuantity = useCallback(
    async (potionId: string, current: number, change: number) => {
      if (!details) return;
      try {
        await adminService.updatePotionQuantity(details.user.uid, potionId, current, change);
        setDetails((prev) =>
          prev
            ? {
                ...prev,
                potions: prev.potions
                  .map((potion) => {
                    if (potion.id !== potionId) return potion;
                    const nextQuantity = current + change;
                    return {
                      ...potion,
                      quantity: nextQuantity <= 0 ? 0 : clampAdminQuantity(nextQuantity)
                    };
                  })
                  .filter((potion) => potion.quantity > 0)
              }
            : prev
        );
      } catch (err) {
        logger.error('Error updating potion quantity:', err);
        setError(err instanceof Error ? err.message : 'Falha ao atualizar poção');
      }
    },
    [details]
  );

  const deletePotion = useCallback(
    async (potionId: string) => {
      if (!details) return;
      try {
        await adminService.deletePotion(details.user.uid, potionId);
        setDetails((prev) =>
          prev
            ? { ...prev, potions: prev.potions.filter((potion) => potion.id !== potionId) }
            : prev
        );
      } catch (err) {
        logger.error('Error deleting potion:', err);
        setError(err instanceof Error ? err.message : 'Falha ao remover poção');
      }
    },
    [details]
  );

  const users = useMemo(() => {
    const term = query.trim().toLowerCase();
    return dashboard.users.filter((user) => {
      const matchesQuery =
        !term ||
        user.displayName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.uid.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || getAdminUserStatus(user) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [dashboard.users, query, statusFilter]);

  return {
    dashboard,
    users,
    selectedUser,
    details,
    mode,
    loading,
    detailsLoading,
    error,
    query,
    statusFilter,
    setQuery,
    setStatusFilter,
    setError,
    refresh,
    openUser,
    closeUser,
    syncUsers,
    updateUser,
    updateUserGold,
    deleteUser,
    updateReportStatus,
    updateIngredientQuantity,
    deleteIngredient,
    updatePotionQuantity,
    deletePotion,
    resetDevData: adminService.resetDevData
  };
}
