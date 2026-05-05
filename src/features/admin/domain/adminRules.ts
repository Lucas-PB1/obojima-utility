import { isDevMode } from '@/features/dev-mode';
import { UserProfile } from '@/types/auth';
import { AdminStats, AdminUserDetails, AdminUserStatus } from '../types';

const demoEnabled =
  isDevMode() ||
  process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE === 'true' ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo' ||
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

export function isAdminDemoMode(): boolean {
  return demoEnabled;
}

export function getAdminUserStatus(
  user: Pick<UserProfile, 'disabled' | 'isAuthActive'>
): AdminUserStatus {
  if (user.isAuthActive === false) return 'orphaned';
  if (user.disabled) return 'disabled';
  return 'active';
}

export function getAdminStatusLabel(status: AdminUserStatus): string {
  const labels: Record<AdminUserStatus, string> = {
    active: 'Ativo',
    disabled: 'Desativado',
    orphaned: 'Órfão'
  };
  return labels[status];
}

export function clampAdminQuantity(value: unknown, fallback = 1): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.floor(numeric));
}

export function buildAdminStats(
  users: UserProfile[],
  details?: Pick<AdminUserDetails, 'social'>[]
): AdminStats {
  const openReports =
    details?.reduce(
      (total, item) =>
        total + item.social.reports.filter((report) => report.status === 'open').length,
      0
    ) ?? 0;

  return {
    totalUsers: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    active: users.filter((user) => getAdminUserStatus(user) === 'active').length,
    disabled: users.filter((user) => getAdminUserStatus(user) === 'disabled').length,
    orphaned: users.filter((user) => getAdminUserStatus(user) === 'orphaned').length,
    openReports
  };
}

export function assertLiveAdminMutation(mode: 'live' | 'demo'): void {
  if (mode === 'demo') {
    throw new Error(
      'Modo demo: ações destrutivas reais ficam bloqueadas até configurar o Firebase.'
    );
  }
}
