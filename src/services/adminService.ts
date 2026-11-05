import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';
import {
  AdminAuditAction,
  AdminAuditEntry,
  AdminDashboardState,
  AdminGrantPayload,
  AdminItemType,
  AdminReportRow,
  AdminUserDetails
} from '@/features/admin/types';
import { createDemoDetails } from '@/features/admin/data/demoData';
import {
  buildAdminStats,
  getSelfActionBlock,
  isAdminDemoMode,
  validateGrantPayload
} from '@/features/admin/domain/adminRules';
import { CollectedIngredient, CreatedPotion, Ingredient, Potion } from '@/types/ingredients';
import { UserReport } from '@/types/social';
import {
  createDevId,
  getDevState,
  isDevMode,
  resetDevData,
  setDevState
} from '@/features/dev-mode';
import { DevState } from '@/features/dev-mode/types';

type ReportStatus = UserReport['status'];

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'reaberta',
  reviewed: 'revisada',
  dismissed: 'dispensada'
};

function userName(state: DevState, uid: string): string {
  const user = state.users.find((item) => item.uid === uid);
  return user?.displayName || user?.email || uid;
}

class AdminService {
  getMode(): 'live' | 'demo' {
    return isDevMode() || isAdminDemoMode() || !isFirebaseConfigured ? 'demo' : 'live';
  }

  /** The signed-in admin, used to stop self-lockout before a request is even sent. */
  getCurrentUid(): string | null {
    return authService.getUserId();
  }

  private async request<T = Record<string, unknown>>(
    path: string,
    init: RequestInit = {},
    fallbackError = 'Falha na ação do admin'
  ): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(await authService.getAuthorizationHeaders()),
        ...(init.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.error || fallbackError);
    return data as T;
  }

  private recordDemo(action: AdminAuditAction, summary: string, targetUid?: string) {
    setDevState((state) => {
      const actorId = this.getCurrentUid() || state.activeUserId;
      const entry: AdminAuditEntry = {
        id: createDevId('audit'),
        actorId,
        actorName: userName(state, actorId),
        action,
        targetUid: targetUid || null,
        targetName: targetUid ? userName(state, targetUid) : null,
        summary,
        createdAt: new Date().toISOString()
      };
      return { ...state, adminAudit: [entry, ...(state.adminAudit || [])].slice(0, 300) };
    });
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (this.getMode() === 'demo') return getDevState().users;
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserProfile), uid: doc.id }));
  }

  async getDashboard(): Promise<AdminDashboardState> {
    const [users, reports] = await Promise.all([
      this.getAllUsers(),
      this.getReports().catch(() => [] as AdminReportRow[])
    ]);
    const openReports = reports.filter((report) => report.status === 'open').length;
    return { mode: this.getMode(), users, stats: buildAdminStats(users, undefined, openReports) };
  }

  async getUserDetails(uid: string): Promise<AdminUserDetails> {
    if (this.getMode() === 'demo') {
      const state = getDevState();
      const user = state.users.find((item) => item.uid === uid) || state.users[0];
      const base = createDemoDetails(user);
      return {
        ...base,
        user,
        gold: state.settingsByUser[uid]?.gold || 0,
        ingredients: state.ingredientsByUser[uid] || [],
        potions: state.potionsByUser[uid] || [],
        history: state.attemptsByUser[uid] || [],
        social: {
          friends: state.friendsByUser[uid] || [],
          incomingRequests: state.incomingRequestsByUser[uid] || [],
          outgoingRequests: state.sentRequestsByUser[uid] || [],
          conversations: state.conversationsByUser[uid] || [],
          blockedUsers: state.blockedByUser[uid] || [],
          reports: state.reports.filter(
            (report) => report.reportedUserId === uid || report.reporterId === uid
          ),
          notifications: state.notificationsByUser[uid] || [],
          trades: state.trades.filter((trade) => trade.participants.includes(uid))
        },
        adminLog: (state.adminAudit || []).filter((entry) => entry.targetUid === uid)
      };
    }

    const data = await this.request<{ details: AdminUserDetails }>(
      `/api/admin/users/${uid}`,
      {},
      'Erro ao carregar detalhes do usuário'
    );
    return data.details;
  }

  async getReports(): Promise<AdminReportRow[]> {
    if (this.getMode() === 'demo') {
      const state = getDevState();
      return [...state.reports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((report) => {
          const extra = report as UserReport & {
            reviewedAt?: string;
            reviewedBy?: string;
            resolutionNote?: string;
          };
          return {
            ...report,
            createdAt: new Date(report.createdAt).toISOString(),
            reviewedAt: extra.reviewedAt || null,
            reviewedBy: extra.reviewedBy || null,
            resolutionNote: extra.resolutionNote || null,
            reporterName: userName(state, report.reporterId),
            reportedName: userName(state, report.reportedUserId)
          };
        });
    }
    const data = await this.request<{ reports: AdminReportRow[] }>(
      '/api/admin/reports',
      {},
      'Erro ao carregar denúncias'
    );
    return data.reports;
  }

  async getAudit(targetUid?: string): Promise<AdminAuditEntry[]> {
    if (this.getMode() === 'demo') {
      const entries = getDevState().adminAudit || [];
      return targetUid ? entries.filter((entry) => entry.targetUid === targetUid) : entries;
    }
    const query = targetUid ? `?targetUid=${encodeURIComponent(targetUid)}` : '';
    const data = await this.request<{ entries: AdminAuditEntry[] }>(
      `/api/admin/audit${query}`,
      {},
      'Erro ao carregar auditoria'
    );
    return data.entries;
  }

  async syncUsers(): Promise<string> {
    if (this.getMode() === 'demo') {
      this.recordDemo('users.sync', 'Sincronização simulada no modo demo');
      return 'Modo demo: sincronização simulada.';
    }
    const data = await this.request<{ message: string }>(
      '/api/admin/sync-users',
      { method: 'POST' },
      'Erro ao sincronizar'
    );
    return data.message;
  }

  async updateUser(uid: string, updates: Partial<UserProfile> & { gold?: number }) {
    const selfBlock = getSelfActionBlock(this.getCurrentUid() || '', uid, updates);
    if (selfBlock) throw new Error(selfBlock);

    if (this.getMode() === 'demo') {
      const state = getDevState();
      const before = state.users.find((user) => user.uid === uid);
      const { gold, ...profile } = updates;
      const previousGold = state.settingsByUser[uid]?.gold || 0;
      setDevState((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.uid === uid ? { ...user, ...profile, updatedAt: new Date().toISOString() } : user
        ),
        settingsByUser:
          gold === undefined
            ? current.settingsByUser
            : {
                ...current.settingsByUser,
                [uid]: {
                  ...(current.settingsByUser[uid] || current.settingsByUser[current.activeUserId]),
                  gold: Math.max(0, Math.floor(gold))
                }
              }
      }));
      if (profile.displayName !== undefined && profile.displayName !== before?.displayName)
        this.recordDemo('user.update', `Nome alterado para "${profile.displayName}"`, uid);
      if (profile.role !== undefined && profile.role !== before?.role)
        this.recordDemo('user.role', `Função alterada para ${profile.role}`, uid);
      if (profile.disabled !== undefined && profile.disabled !== Boolean(before?.disabled))
        this.recordDemo(
          profile.disabled ? 'user.disable' : 'user.enable',
          profile.disabled ? 'Conta desativada' : 'Conta reativada',
          uid
        );
      if (gold !== undefined && gold !== previousGold)
        this.recordDemo('user.gold', `Gold: ${previousGold} → ${gold}`, uid);
      return;
    }

    await this.request(
      `/api/admin/users/${uid}`,
      { method: 'PATCH', body: JSON.stringify(updates) },
      'Erro ao atualizar usuário'
    );
  }

  async deleteUser(uid: string) {
    const selfBlock = getSelfActionBlock(this.getCurrentUid() || '', uid, { delete: true });
    if (selfBlock) throw new Error(selfBlock);

    if (this.getMode() === 'demo') {
      this.recordDemo('user.delete', 'Conta excluída', uid);
      setDevState((state) => ({
        ...state,
        users: state.users.filter((user) => user.uid !== uid),
        publicUsers: state.publicUsers.filter((user) => user.uid !== uid)
      }));
      return;
    }
    await this.request(`/api/admin/users/${uid}`, { method: 'DELETE' }, 'Erro ao excluir usuário');
  }

  async revokeSessions(uid: string) {
    if (this.getMode() === 'demo') {
      this.recordDemo('user.sessions', 'Sessões encerradas (simulado)', uid);
      return;
    }
    await this.request(
      `/api/admin/users/${uid}/sessions`,
      { method: 'POST' },
      'Erro ao encerrar sessões'
    );
  }

  async notifyUser(uid: string, title: string, message: string) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        notificationsByUser: {
          ...state.notificationsByUser,
          [uid]: [
            {
              id: createDevId('notification'),
              recipientId: uid,
              actorName: 'Obojima',
              type: 'system',
              title,
              body: message,
              read: false,
              createdAt: new Date()
            },
            ...(state.notificationsByUser[uid] || [])
          ]
        }
      }));
      this.recordDemo('user.notify', `Notificação enviada: "${title}"`, uid);
      return;
    }
    await this.request(
      `/api/admin/users/${uid}/notify`,
      { method: 'POST', body: JSON.stringify({ title, message }) },
      'Erro ao enviar notificação'
    );
  }

  async updateReportStatus(reportId: string, status: ReportStatus, note = '') {
    if (this.getMode() === 'demo') {
      const report = getDevState().reports.find((item) => item.id === reportId);
      setDevState((state) => ({
        ...state,
        reports: state.reports.map((item) =>
          item.id === reportId
            ? {
                ...item,
                status,
                reviewedAt: new Date().toISOString(),
                reviewedBy: this.getCurrentUid(),
                ...(note ? { resolutionNote: note } : {})
              }
            : item
        )
      }));
      this.recordDemo(
        'report.status',
        `Denúncia (${report?.reason}) ${REPORT_STATUS_LABELS[status]}${note ? `: ${note}` : ''}`,
        report?.reportedUserId
      );
      return;
    }
    await this.request(
      `/api/admin/reports/${reportId}`,
      { method: 'PATCH', body: JSON.stringify({ status, note }) },
      'Erro ao atualizar denúncia'
    );
  }

  async grantItem(uid: string, payload: AdminGrantPayload) {
    const error = validateGrantPayload(payload);
    if (error) throw new Error(error);

    if (this.getMode() === 'demo') {
      const label = `${payload.quantity}x ${payload.item.nome}`;
      setDevState((state) => {
        if (payload.type === 'ingredient') {
          const current = state.ingredientsByUser[uid] || [];
          const existing = current.find(
            (entry) =>
              !entry.used &&
              entry.ingredient.id === payload.item.id &&
              entry.ingredient.nome === payload.item.nome
          );
          const next: CollectedIngredient[] = existing
            ? current.map((entry) =>
                entry.id === existing.id
                  ? { ...entry, quantity: entry.quantity + payload.quantity, used: false }
                  : entry
              )
            : [
                {
                  id: createDevId('ingredient'),
                  ingredient: payload.item as unknown as Ingredient,
                  quantity: payload.quantity,
                  collectedAt: new Date(),
                  used: false,
                  forageAttemptId: 'admin-grant'
                },
                ...current
              ];
          return { ...state, ingredientsByUser: { ...state.ingredientsByUser, [uid]: next } };
        }

        const potion = payload.item as unknown as Potion;
        const created: CreatedPotion = {
          id: createDevId('potion'),
          potion,
          recipe: {
            id: createDevId('admin-grant'),
            ingredients: [],
            combatScore: 0,
            utilityScore: 0,
            whimsyScore: 0,
            winningAttribute: payload.category || 'utility',
            resultingPotion: potion,
            createdAt: new Date()
          },
          quantity: payload.quantity,
          createdAt: new Date(),
          used: false
        };
        return {
          ...state,
          potionsByUser: {
            ...state.potionsByUser,
            [uid]: [created, ...(state.potionsByUser[uid] || [])]
          }
        };
      });
      this.recordDemo(
        'item.grant',
        `Concedeu ${label} (${payload.type === 'ingredient' ? 'ingrediente' : 'poção'})`,
        uid
      );
      return;
    }

    await this.request(
      `/api/admin/users/${uid}/items`,
      { method: 'POST', body: JSON.stringify(payload) },
      'Erro ao conceder item'
    );
  }

  async setItemQuantity(uid: string, type: AdminItemType, itemId: string, quantity: number) {
    if (this.getMode() === 'demo') {
      setDevState((state) =>
        type === 'ingredient'
          ? {
              ...state,
              ingredientsByUser: {
                ...state.ingredientsByUser,
                [uid]: (state.ingredientsByUser[uid] || []).map((item) =>
                  item.id === itemId ? { ...item, quantity, used: false } : item
                )
              }
            }
          : {
              ...state,
              potionsByUser: {
                ...state.potionsByUser,
                [uid]: (state.potionsByUser[uid] || []).map((item) =>
                  item.id === itemId ? { ...item, quantity, used: false } : item
                )
              }
            }
      );
      this.recordDemo('item.update', `Quantidade ajustada para ${quantity}`, uid);
      return;
    }
    await this.request(
      `/api/admin/users/${uid}/items`,
      { method: 'PATCH', body: JSON.stringify({ type, itemId, quantity }) },
      'Erro ao atualizar item'
    );
  }

  async deleteItem(uid: string, type: AdminItemType, itemId: string) {
    if (this.getMode() === 'demo') {
      setDevState((state) =>
        type === 'ingredient'
          ? {
              ...state,
              ingredientsByUser: {
                ...state.ingredientsByUser,
                [uid]: (state.ingredientsByUser[uid] || []).filter((item) => item.id !== itemId)
              }
            }
          : {
              ...state,
              potionsByUser: {
                ...state.potionsByUser,
                [uid]: (state.potionsByUser[uid] || []).filter((item) => item.id !== itemId)
              }
            }
      );
      this.recordDemo('item.delete', 'Item removido do inventário', uid);
      return;
    }
    const query = `type=${type}&itemId=${encodeURIComponent(itemId)}`;
    await this.request(
      `/api/admin/users/${uid}/items?${query}`,
      { method: 'DELETE' },
      'Erro ao remover item'
    );
  }

  /** One-off data repair jobs that used to live in the old admin screen. */
  async runMaintenance(job: 'profiles' | 'chats'): Promise<string> {
    if (this.getMode() === 'demo') {
      this.recordDemo('maintenance.run', `Manutenção simulada: ${job}`);
      return 'Modo demo: manutenção simulada.';
    }
    const path =
      job === 'profiles'
        ? '/api/admin/migrate-public-profiles'
        : '/api/admin/backfill-chat-participants';
    const data = await this.request<{ message: string }>(
      path,
      { method: 'POST' },
      'Erro na manutenção'
    );
    return data.message;
  }

  resetDevData() {
    resetDevData();
    return { success: true, id: createDevId('reset') };
  }
}

export const adminService = new AdminService();
