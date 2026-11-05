'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserProfile } from '@/types/auth';
import { UserReport } from '@/types/social';
import { adminService } from '@/services/adminService';
import { logger } from '@/utils/logger';
import {
  AdminAuditEntry,
  AdminDashboardState,
  AdminGrantPayload,
  AdminItemType,
  AdminReportRow,
  AdminUserDetails,
  AdminUserStatus
} from '../types';
import { adminDemoDashboard } from '../data/demoData';
import { buildUsersCsv, getAdminUserStatus } from '../domain/adminRules';

export type AdminSection = 'overview' | 'users' | 'reports' | 'audit' | 'maintenance';
export type AdminUserSort = 'name' | 'recent' | 'lastLogin';

export interface AdminToast {
  id: number;
  tone: 'success' | 'error';
  message: string;
}

function timeOf(value?: string) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

export function useAdminDashboard() {
  const [section, setSection] = useState<AdminSection>('overview');
  const [dashboard, setDashboard] = useState<AdminDashboardState>(adminDemoDashboard);
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [audit, setAudit] = useState<AdminAuditEntry[]>([]);
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [openUid, setOpenUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminUserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [sort, setSort] = useState<AdminUserSort>('name');
  const toastId = useRef(0);

  const mode = dashboard.mode;
  const currentUid = adminService.getCurrentUid();

  const notify = useCallback((tone: AdminToast['tone'], message: string) => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nextDashboard, nextReports, nextAudit] = await Promise.all([
        adminService.getDashboard(),
        adminService.getReports().catch((error) => {
          logger.error('Error loading reports:', error);
          return [] as AdminReportRow[];
        }),
        adminService.getAudit().catch((error) => {
          logger.error('Error loading audit:', error);
          return [] as AdminAuditEntry[];
        })
      ]);
      setDashboard(nextDashboard);
      setReports(nextReports);
      setAudit(nextAudit);
    } catch (error) {
      logger.error('Error loading admin dashboard:', error);
      notify('error', error instanceof Error ? error.message : 'Falha ao carregar admin');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const loadDetails = useCallback(async (uid: string) => {
    setDetailsLoading(true);
    try {
      setDetails(await adminService.getUserDetails(uid));
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const openUser = useCallback(
    async (uid: string) => {
      setOpenUid(uid);
      setDetails(null);
      try {
        await loadDetails(uid);
      } catch (error) {
        logger.error('Error loading admin user details:', error);
        notify('error', error instanceof Error ? error.message : 'Falha ao carregar detalhes');
        setOpenUid(null);
      }
    },
    [loadDetails, notify]
  );

  const closeUser = useCallback(() => {
    setOpenUid(null);
    setDetails(null);
  }, []);

  /**
   * Runs an admin action with a busy flag, a visible result message and a
   * refresh of whatever the action may have changed.
   */
  const run = useCallback(
    async (
      key: string,
      action: () => Promise<unknown>,
      success: string,
      options: { reloadDetails?: string | null; reloadAll?: boolean } = {}
    ): Promise<boolean> => {
      setBusy(key);
      try {
        await action();
        notify('success', success);
        await Promise.all([
          options.reloadAll === false ? Promise.resolve() : loadAll(),
          options.reloadDetails ? loadDetails(options.reloadDetails) : Promise.resolve()
        ]);
        return true;
      } catch (error) {
        logger.error(`Admin action ${key} failed:`, error);
        notify('error', error instanceof Error ? error.message : 'A ação falhou');
        return false;
      } finally {
        setBusy(null);
      }
    },
    [loadAll, loadDetails, notify]
  );

  const actions = useMemo(
    () => ({
      saveProfile: (uid: string, updates: Partial<UserProfile> & { gold?: number }) =>
        run('profile', () => adminService.updateUser(uid, updates), 'Perfil salvo', {
          reloadDetails: uid
        }),
      setDisabled: (uid: string, disabled: boolean) =>
        run(
          'disable',
          () => adminService.updateUser(uid, { disabled }),
          disabled ? 'Conta desativada e sessões encerradas' : 'Conta reativada',
          { reloadDetails: uid }
        ),
      revokeSessions: (uid: string) =>
        run(
          'sessions',
          () => adminService.revokeSessions(uid),
          'Sessões encerradas em todos os dispositivos',
          { reloadDetails: uid, reloadAll: false }
        ),
      notifyUser: (uid: string, title: string, message: string) =>
        run('notify', () => adminService.notifyUser(uid, title, message), 'Notificação enviada', {
          reloadDetails: uid,
          reloadAll: false
        }),
      deleteUser: async (uid: string) => {
        const ok = await run('delete', () => adminService.deleteUser(uid), 'Conta excluída');
        if (ok) closeUser();
        return ok;
      },
      grantItem: (uid: string, payload: AdminGrantPayload) =>
        run(
          'grant',
          () => adminService.grantItem(uid, payload),
          `${payload.quantity}x ${payload.item.nome} concedido`,
          { reloadDetails: uid }
        ),
      setItemQuantity: (uid: string, type: AdminItemType, itemId: string, quantity: number) =>
        run(
          `item-${itemId}`,
          () => adminService.setItemQuantity(uid, type, itemId, quantity),
          'Quantidade atualizada',
          { reloadDetails: uid }
        ),
      deleteItem: (uid: string, type: AdminItemType, itemId: string) =>
        run(`item-${itemId}`, () => adminService.deleteItem(uid, type, itemId), 'Item removido', {
          reloadDetails: uid
        }),
      setReportStatus: (reportId: string, status: UserReport['status'], note?: string) =>
        run(
          `report-${reportId}`,
          () => adminService.updateReportStatus(reportId, status, note),
          status === 'open'
            ? 'Denúncia reaberta'
            : status === 'reviewed'
              ? 'Denúncia marcada como revisada'
              : 'Denúncia dispensada',
          { reloadDetails: openUid }
        ),
      syncUsers: async () => {
        setBusy('sync');
        try {
          const message = await adminService.syncUsers();
          notify('success', message);
          await loadAll();
        } catch (error) {
          notify('error', error instanceof Error ? error.message : 'Falha ao sincronizar');
        } finally {
          setBusy(null);
        }
      },
      runMaintenance: async (key: 'profiles' | 'chats') => {
        setBusy(`maintenance-${key}`);
        try {
          const message = await adminService.runMaintenance(key);
          notify('success', message);
          await loadAll();
        } catch (error) {
          notify('error', error instanceof Error ? error.message : 'Falha na manutenção');
        } finally {
          setBusy(null);
        }
      },
      resetDevData: async () => {
        adminService.resetDevData();
        notify('success', 'Dados de demonstração restaurados');
        closeUser();
        await loadAll();
      }
    }),
    [run, notify, loadAll, closeUser, openUid]
  );

  const users = useMemo(() => {
    const term = query.trim().toLowerCase();
    return dashboard.users
      .filter((user) => {
        const matchesQuery =
          !term ||
          user.displayName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.uid.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'all' || getAdminUserStatus(user) === statusFilter;
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesQuery && matchesStatus && matchesRole;
      })
      .sort((a, b) => {
        if (sort === 'recent') return timeOf(b.createdAt) - timeOf(a.createdAt);
        if (sort === 'lastLogin') return timeOf(b.lastLogin) - timeOf(a.lastLogin);
        return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
      });
  }, [dashboard.users, query, statusFilter, roleFilter, sort]);

  const exportUsersCsv = useCallback(() => {
    const csv = buildUsersCsv(users);
    // BOM so Excel opens accented names correctly.
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `obojima-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', `${users.length} usuários exportados`);
  }, [users, notify]);

  const openReports = useMemo(
    () => reports.filter((report) => report.status === 'open'),
    [reports]
  );

  return {
    section,
    setSection,
    mode,
    currentUid,
    dashboard,
    users,
    reports,
    openReports,
    audit,
    details,
    openUid,
    loading,
    detailsLoading,
    busy,
    toasts,
    dismissToast,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    sort,
    setSort,
    refresh: loadAll,
    openUser,
    closeUser,
    exportUsersCsv,
    actions
  };
}

export type AdminDashboardModel = ReturnType<typeof useAdminDashboard>;
