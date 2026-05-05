import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { AdminDashboardState, AdminUserDetails } from '@/features/admin/types';
import { createDemoDetails } from '@/features/admin/data/demoData';
import {
  assertLiveAdminMutation,
  buildAdminStats,
  isAdminDemoMode
} from '@/features/admin/domain/adminRules';
import {
  createDevId,
  getDevState,
  isDevMode,
  resetDevData,
  setDevState
} from '@/features/dev-mode';

class AdminService {
  getMode(): 'live' | 'demo' {
    return isDevMode() || isAdminDemoMode() || !isFirebaseConfigured ? 'demo' : 'live';
  }

  private async getJsonHeaders(): Promise<HeadersInit> {
    return {
      'Content-Type': 'application/json',
      ...(await authService.getAuthorizationHeaders())
    };
  }

  async getUserCount(): Promise<number> {
    if (this.getMode() === 'demo') return getDevState().users.length;
    const coll = collection(db, 'users');
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (this.getMode() === 'demo') return getDevState().users;
    const coll = collection(db, 'users');
    const snapshot = await getDocs(coll);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserProfile), uid: doc.id }));
  }

  async getDashboard(): Promise<AdminDashboardState> {
    if (this.getMode() === 'demo') {
      const state = getDevState();
      return { mode: 'demo', users: state.users, stats: buildAdminStats(state.users) };
    }

    const users = await this.getAllUsers();
    return {
      mode: 'live',
      users,
      stats: buildAdminStats(users)
    };
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
        }
      };
    }

    const res = await fetch(`/api/admin/users/${uid}`, {
      method: 'GET',
      headers: await authService.getAuthorizationHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao carregar detalhes do usuário');
    return data.details;
  }

  async syncUsers() {
    if (this.getMode() === 'demo') return { success: true, message: 'Modo dev sincronizado' };
    assertLiveAdminMutation(this.getMode());
    const res = await fetch('/api/admin/sync-users', {
      method: 'POST',
      headers: await authService.getAuthorizationHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao sincronizar');
    return data;
  }

  async updateUser(uid: string, updates: Partial<UserProfile>) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        users: state.users.map((user) =>
          user.uid === uid ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
        )
      }));
      return { success: true };
    }
    assertLiveAdminMutation(this.getMode());
    const res = await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      headers: await this.getJsonHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao atualizar usuário');
    return data;
  }

  async updateUserGold(uid: string, gold: number) {
    const normalizedGold = Math.max(0, Math.floor(Number(gold) || 0));
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        settingsByUser: {
          ...state.settingsByUser,
          [uid]: {
            ...(state.settingsByUser[uid] || state.settingsByUser[state.activeUserId]),
            gold: normalizedGold
          }
        }
      }));
      return { success: true };
    }

    const res = await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      headers: await this.getJsonHeaders(),
      body: JSON.stringify({ gold: normalizedGold })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao atualizar gold');
    return data;
  }

  async deleteUser(uid: string) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({ ...state, users: state.users.filter((user) => user.uid !== uid) }));
      return { success: true };
    }
    assertLiveAdminMutation(this.getMode());
    const res = await fetch(`/api/admin/users/${uid}`, {
      method: 'DELETE',
      headers: await authService.getAuthorizationHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao excluir usuário');
    return data;
  }

  async backfillChatParticipants() {
    assertLiveAdminMutation(this.getMode());
    const res = await fetch('/api/admin/backfill-chat-participants', {
      method: 'POST',
      headers: await authService.getAuthorizationHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao atualizar chats');
    return data;
  }

  async updateReportStatus(reportId: string, status: 'open' | 'reviewed' | 'dismissed') {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        reports: state.reports.map((report) =>
          report.id === reportId ? { ...report, status } : report
        )
      }));
      return { success: true };
    }
    assertLiveAdminMutation(this.getMode());
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: await this.getJsonHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao atualizar denúncia');
    return data;
  }

  async updateIngredientQuantity(userId: string, itemId: string, quantity: number) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        ingredientsByUser: {
          ...state.ingredientsByUser,
          [userId]: (state.ingredientsByUser[userId] || []).map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }
      }));
      return;
    }
    assertLiveAdminMutation(this.getMode());
    await firebaseStorageService.updateCollectedIngredient(itemId, { quantity }, userId);
  }

  async deleteIngredient(userId: string, itemId: string) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        ingredientsByUser: {
          ...state.ingredientsByUser,
          [userId]: (state.ingredientsByUser[userId] || []).filter((item) => item.id !== itemId)
        }
      }));
      return;
    }
    assertLiveAdminMutation(this.getMode());
    await firebaseStorageService.removeCollectedIngredient(itemId, userId);
  }

  async updatePotionQuantity(userId: string, potionId: string, current: number, change: number) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        potionsByUser: {
          ...state.potionsByUser,
          [userId]: (state.potionsByUser[userId] || [])
            .map((potion) =>
              potion.id === potionId ? { ...potion, quantity: current + change } : potion
            )
            .filter((potion) => potion.quantity > 0)
        }
      }));
      return;
    }
    assertLiveAdminMutation(this.getMode());
    if (current + change <= 0) {
      await firebaseCreatedPotionService.removePotion(potionId, userId);
      return;
    }
    await firebaseCreatedPotionService.updatePotionQuantity(potionId, change, userId);
  }

  async deletePotion(userId: string, potionId: string) {
    if (this.getMode() === 'demo') {
      setDevState((state) => ({
        ...state,
        potionsByUser: {
          ...state.potionsByUser,
          [userId]: (state.potionsByUser[userId] || []).filter((potion) => potion.id !== potionId)
        }
      }));
      return;
    }
    assertLiveAdminMutation(this.getMode());
    await firebaseCreatedPotionService.removePotion(potionId, userId);
  }

  resetDevData() {
    resetDevData();
    return { success: true, id: createDevId('reset') };
  }
}

export const adminService = new AdminService();
