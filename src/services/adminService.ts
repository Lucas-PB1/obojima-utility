import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from '@/types/auth';

class AdminService {
  async getUserCount(): Promise<number> {
    const coll = collection(db, 'users');
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  }

  async syncUsers() {
    const res = await fetch('/api/admin/sync-users', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao sincronizar');
    return data;
  }

  async updateUser(uid: string, updates: Partial<UserProfile>) {
    const res = await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao atualizar usuário');
    return data;
  }

  async deleteUser(uid: string) {
    const res = await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro ao excluir usuário');
    return data;
  }
}

export const adminService = new AdminService();
