import { isDevMode } from '@/features/dev-mode';
import { UserProfile } from '@/types/auth';
import { AdminGrantPayload, AdminStats, AdminUserDetails, AdminUserStatus } from '../types';

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
  details?: Pick<AdminUserDetails, 'social'>[],
  openReportsCount?: number
): AdminStats {
  const openReports =
    openReportsCount ??
    details?.reduce(
      (total, item) =>
        total + item.social.reports.filter((report) => report.status === 'open').length,
      0
    ) ??
    0;

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

export const ADMIN_MAX_GRANT_QUANTITY = 999;

/**
 * Guards against an admin locking themselves (and possibly everyone) out:
 * no self-demotion, self-disable or self-delete. Returns an error message or null.
 */
export function getSelfActionBlock(
  actorUid: string,
  targetUid: string,
  change: { role?: string; disabled?: boolean; delete?: boolean }
): string | null {
  if (actorUid !== targetUid) return null;
  if (change.delete) return 'Você não pode excluir a sua própria conta pelo painel.';
  if (change.disabled === true) return 'Você não pode desativar a sua própria conta.';
  if (change.role !== undefined && change.role !== 'admin') {
    return 'Você não pode remover o seu próprio acesso de admin.';
  }
  return null;
}

export function validateGrantPayload(payload: Partial<AdminGrantPayload>): string | null {
  if (payload.type !== 'ingredient' && payload.type !== 'potion') return 'Tipo de item inválido';
  const item = payload.item;
  if (!item || typeof item.id !== 'number' || typeof item.nome !== 'string' || !item.nome) {
    return 'Item do catálogo inválido';
  }
  const quantity = Number(payload.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > ADMIN_MAX_GRANT_QUANTITY) {
    return `Quantidade deve ser entre 1 e ${ADMIN_MAX_GRANT_QUANTITY}`;
  }
  if (
    payload.type === 'potion' &&
    payload.category !== 'combat' &&
    payload.category !== 'utility' &&
    payload.category !== 'whimsy'
  ) {
    return 'Categoria da poção inválida';
  }
  return null;
}

/** Escapes a value for a CSV cell (RFC 4180) and neutralises spreadsheet formulas. */
export function toCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildUsersCsv(users: UserProfile[]): string {
  const header = ['uid', 'nome', 'email', 'funcao', 'status', 'criado_em', 'ultimo_login'];
  const rows = users.map((user) =>
    [
      user.uid,
      user.displayName,
      user.email,
      user.role,
      getAdminUserStatus(user),
      user.createdAt,
      user.lastLogin
    ]
      .map(toCsvCell)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}
