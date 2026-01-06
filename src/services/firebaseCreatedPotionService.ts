import { collection, query, orderBy, onSnapshot, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { CreatedPotion, PotionRecipe } from '@/types/ingredients';
import { logger } from '@/utils/logger';

interface PotionData {
  potion?: {
    nome?: string;
    nome_portugues?: string;
    nome_ingles?: string;
    [key: string]: unknown;
  };
  createdAt?: Timestamp | Date | string;
  usedAt?: Timestamp | Date | string;
  recipe?: PotionRecipe & {
    createdAt?: Timestamp | Date | string;
    resultingPotion?: unknown;
  };
  [key: string]: unknown;
}

class FirebaseCreatedPotionService {
  private potionsUnsubscribe: Unsubscribe | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getPotionsPath(uid?: string): string {
    const userId = uid || this.getUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    return `users/${userId}/createdPotions`;
  }

  private convertTimestampToDate(timestamp: Timestamp | Date | string | undefined | null): Date {
    if (!timestamp) {
      return new Date();
    }
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  }

  async addCreatedPotion(
    recipe: PotionRecipe,
    uid?: string,
    quantity: number = 1
  ): Promise<CreatedPotion> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await fetch('/api/potions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId, recipe, quantity })
      });

      if (!response.ok) throw new Error('Failed to create potion');

      const result = await response.json();
      const data = result.data;

      return {
        ...data,
        createdAt: this.convertTimestampToDate(data.createdAt),
        recipe: {
          ...data.recipe,
          createdAt: this.convertTimestampToDate(data.recipe.createdAt)
        }
      };
    } catch (error) {
      logger.error('Erro ao adicionar poção criada:', error);
      throw error;
    }
  }

  private normalizePotionData(data: PotionData): CreatedPotion {
    const potionData = data.potion || {};
    const normalizedPotion = {
      ...potionData,
      nome:
        potionData.nome || potionData.nome_portugues || potionData.nome_ingles || 'Poção sem nome'
    };

    return {
      ...data,
      createdAt: this.convertTimestampToDate(data.createdAt),
      usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined,
      potion: normalizedPotion,
      recipe: {
        ...data.recipe,
        createdAt: this.convertTimestampToDate(data.recipe?.createdAt),
        resultingPotion: normalizedPotion
      }
    } as CreatedPotion;
  }

  async getAllCreatedPotions(uid?: string): Promise<CreatedPotion[]> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) return [];

    try {
      const response = await fetch(`/api/potions?uid=${userId}`);
      if (!response.ok) return [];

      const result = await response.json();
      return result.data.map((data: PotionData) => this.normalizePotionData(data));
    } catch (error) {
      logger.error('Erro ao carregar poções criadas:', error);
      return [];
    }
  }

  subscribeToCreatedPotions(callback: (potions: CreatedPotion[]) => void): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback([]);
      return () => {};
    }

    try {
      const potionsRef = collection(db, this.getPotionsPath());
      const q = query(potionsRef, orderBy('createdAt', 'desc'));

      this.potionsUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const potions = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...this.normalizePotionData(data),
              id: doc.id
            };
          });
          callback(potions);
        },
        (error) => {
          logger.error('Erro ao observar poções:', error);
          callback([]);
        }
      );

      return () => {
        if (this.potionsUnsubscribe) {
          this.potionsUnsubscribe();
          this.potionsUnsubscribe = null;
        }
      };
    } catch (error) {
      logger.error('Erro ao criar subscription de poções:', error);
      callback([]);
      return () => {};
    }
  }

  async getAvailablePotions(): Promise<CreatedPotion[]> {
    const potions = await this.getAllCreatedPotions();
    return potions.filter((potion) => potion.quantity > 0);
  }

  async usePotion(potionId: string, uid?: string): Promise<boolean> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) return false;

    try {
      const response = await fetch(`/api/potions/${potionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId, action: 'use' })
      });

      if (!response.ok) return false;
      return true;
    } catch (error) {
      logger.error('Erro ao usar poção:', error);
      return false;
    }
  }

  async updatePotionQuantity(potionId: string, change: number, uid?: string): Promise<void> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) return;

    try {
      const response = await fetch(`/api/potions/${potionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId, action: 'update_quantity', change })
      });

      if (!response.ok) throw new Error('Failed to update potion quantity');
    } catch (error) {
      logger.error('Erro ao atualizar quantidade da poção:', error);
      throw error;
    }
  }

  async removePotion(potionId: string, uid?: string): Promise<void> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) return;

    try {
      const response = await fetch(`/api/potions/${potionId}?uid=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete potion');
    } catch (error) {
      logger.error('Erro ao remover poção:', error);
      throw error;
    }
  }

  async getPotionById(potionId: string, uid?: string): Promise<CreatedPotion | null> {
    const userId = uid || this.getUserId();
    if (!this.isClient() || !userId) return null;

    try {
      const response = await fetch(`/api/potions/${potionId}?uid=${userId}`);
      if (!response.ok) return null;

      const result = await response.json();
      const data = result.data;

      return {
        ...data,
        createdAt: this.convertTimestampToDate(data.createdAt),
        usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined,
        recipe: {
          ...data.recipe,
          createdAt: this.convertTimestampToDate(data.recipe.createdAt)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar poção:', error);
      return null;
    }
  }

  async getPotionsByCategory(category: 'combat' | 'utility' | 'whimsy'): Promise<CreatedPotion[]> {
    const potions = await this.getAllCreatedPotions();
    return potions.filter((potion) => potion.recipe.winningAttribute === category);
  }

  async getPotionStats(): Promise<{
    total: number;
    available: number;
    used: number;
    byCategory: {
      combat: number;
      utility: number;
      whimsy: number;
    };
    recent: number;
  }> {
    const potions = await this.getAllCreatedPotions();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: potions.length,
      available: potions.filter((p) => p.quantity > 0).length,
      used: potions.filter((p) => p.used).length,
      byCategory: {
        combat: potions.filter((p) => p.recipe.winningAttribute === 'combat').length,
        utility: potions.filter((p) => p.recipe.winningAttribute === 'utility').length,
        whimsy: potions.filter((p) => p.recipe.winningAttribute === 'whimsy').length
      },
      recent: potions.filter((p) => p.createdAt >= sevenDaysAgo).length
    };
  }

  cleanup(): void {
    if (this.potionsUnsubscribe) {
      this.potionsUnsubscribe();
      this.potionsUnsubscribe = null;
    }
  }
}

export const firebaseCreatedPotionService = new FirebaseCreatedPotionService();
