import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { GAME_CONFIG } from '@/config/gameConfig';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';

class FirebaseStorageService {
  private collectedIngredientsUnsubscribe: Unsubscribe | null = null;
  private forageAttemptsUnsubscribe: Unsubscribe | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getCollectedIngredientsPath(uid?: string): string {
    const userId = uid || this.getUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    return `users/${userId}/collectedIngredients`;
  }

  private getForageAttemptsPath(uid?: string): string {
    const userId = uid || this.getUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    return `users/${userId}/forageAttempts`;
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

  private convertDateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  async getCollectedIngredients(uid?: string): Promise<CollectedIngredient[]> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return [];

    try {
      const ingredientsRef = collection(db, this.getCollectedIngredientsPath(uid));
      const snapshot = await getDocs(ingredientsRef);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          collectedAt: this.convertTimestampToDate(data.collectedAt),
          usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined
        } as CollectedIngredient;
      });
    } catch (error) {
      logger.error('Erro ao carregar ingredientes coletados:', error);
      return [];
    }
  }

  subscribeToCollectedIngredients(
    callback: (ingredients: CollectedIngredient[]) => void
  ): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback([]);
      return () => {};
    }

    try {
      const ingredientsRef = collection(db, this.getCollectedIngredientsPath());
      const q = query(ingredientsRef, orderBy('collectedAt', 'desc'));

      this.collectedIngredientsUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const ingredients = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              collectedAt: this.convertTimestampToDate(data.collectedAt),
              usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined
            } as CollectedIngredient;
          });
          callback(ingredients);
        },
        (error) => {
          logger.error('Erro ao observar ingredientes:', error);
          callback([]);
        }
      );

      return () => {
        if (this.collectedIngredientsUnsubscribe) {
          this.collectedIngredientsUnsubscribe();
          this.collectedIngredientsUnsubscribe = null;
        }
      };
    } catch (error) {
      logger.error('Erro ao criar subscription de ingredientes:', error);
      callback([]);
      return () => {};
    }
  }

  async addCollectedIngredient(ingredient: CollectedIngredient, uid?: string): Promise<void> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return;

    try {
      const current = await this.getCollectedIngredients(uid);
      const existing = current.find((ing) => ing.ingredient.id === ingredient.ingredient.id);

      if (existing) {
        const existingRef = doc(db, this.getCollectedIngredientsPath(uid), existing.id);
        await updateDoc(existingRef, {
          quantity: existing.quantity + ingredient.quantity,
          collectedAt: this.convertDateToTimestamp(new Date()),
          used: false,
          usedAt: null
        });
      } else {
        const ingredientsRef = collection(db, this.getCollectedIngredientsPath(uid));
        await addDoc(ingredientsRef, {
          ...ingredient,
          collectedAt: this.convertDateToTimestamp(ingredient.collectedAt),
          usedAt: ingredient.usedAt ? this.convertDateToTimestamp(ingredient.usedAt) : null
        });
      }

      logger.info('Ingrediente adicionado à coleção:', ingredient.ingredient.nome);
    } catch (error) {
      logger.error('Erro ao adicionar ingrediente coletado:', error);
      throw error;
    }
  }

  async updateCollectedIngredient(
    id: string,
    updates: Partial<CollectedIngredient>,
    uid?: string
  ): Promise<void> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return;

    try {
      const ingredientRef = doc(db, this.getCollectedIngredientsPath(uid), id);
      const updateData: Record<string, unknown> = { ...updates };

      if (updates.collectedAt) {
        updateData.collectedAt = this.convertDateToTimestamp(updates.collectedAt);
      }
      if (updates.usedAt !== undefined) {
        updateData.usedAt = updates.usedAt ? this.convertDateToTimestamp(updates.usedAt) : null;
      }

      await updateDoc(ingredientRef, updateData);
    } catch (error) {
      logger.error('Erro ao atualizar ingrediente coletado:', error);
      throw error;
    }
  }

  async markIngredientAsUsed(id: string, uid?: string): Promise<void> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return;

    try {
      const ingredients = await this.getCollectedIngredients(uid);
      const ingredient = ingredients.find((ing) => ing.id === id);

      if (ingredient && ingredient.quantity > 0) {
        const newQuantity = ingredient.quantity - 1;
        const ingredientRef = doc(db, this.getCollectedIngredientsPath(uid), id);

        if (newQuantity === 0) {
          await updateDoc(ingredientRef, {
            quantity: 0,
            used: true,
            usedAt: this.convertDateToTimestamp(new Date())
          });
        } else {
          await updateDoc(ingredientRef, {
            quantity: newQuantity
          });
        }
      }
    } catch (error) {
      logger.error('Erro ao marcar ingrediente como usado:', error);
      throw error;
    }
  }

  async removeCollectedIngredient(id: string, uid?: string): Promise<void> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return;

    try {
      const ingredientRef = doc(db, this.getCollectedIngredientsPath(uid), id);
      await deleteDoc(ingredientRef);
    } catch (error) {
      logger.error('Erro ao remover ingrediente coletado:', error);
      throw error;
    }
  }

  async getForageAttempts(uid?: string): Promise<ForageAttempt[]> {
    if (!this.isClient() || (!this.getUserId() && !uid)) return [];

    try {
      const attemptsRef = collection(db, this.getForageAttemptsPath(uid));
      const snapshot = await getDocs(attemptsRef);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: this.convertTimestampToDate(data.timestamp)
        } as ForageAttempt;
      });
    } catch (error) {
      logger.error('Erro ao carregar tentativas de forrageamento:', error);
      return [];
    }
  }

  subscribeToForageAttempts(callback: (attempts: ForageAttempt[]) => void): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback([]);
      return () => {};
    }

    try {
      const attemptsRef = collection(db, this.getForageAttemptsPath());
      const q = query(attemptsRef, orderBy('timestamp', 'desc'));

      this.forageAttemptsUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const attempts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              timestamp: this.convertTimestampToDate(data.timestamp)
            } as ForageAttempt;
          });
          callback(attempts);
        },
        (error) => {
          logger.error('Erro ao observar tentativas:', error);
          callback([]);
        }
      );

      return () => {
        if (this.forageAttemptsUnsubscribe) {
          this.forageAttemptsUnsubscribe();
          this.forageAttemptsUnsubscribe = null;
        }
      };
    } catch (error) {
      logger.error('Erro ao criar subscription de tentativas:', error);
      callback([]);
      return () => {};
    }
  }

  async addForageAttempt(attempt: ForageAttempt): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;

    try {
      const attemptsRef = collection(db, this.getForageAttemptsPath());
      const dataToSave = {
        ...attempt,
        timestamp: this.convertDateToTimestamp(attempt.timestamp),
        bonusDice: attempt.bonusDice || null,
        ingredient: attempt.ingredient || null
      };

      await addDoc(attemptsRef, dataToSave);
    } catch (error) {
      logger.error('Erro ao adicionar tentativa de forrageamento:', error);
      throw error;
    }
  }

  async getRemainingAttemptsToday(): Promise<number> {
    if (!this.isClient() || !this.getUserId()) return GAME_CONFIG.DAILY_FORAGE_LIMIT;

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const attemptsRef = collection(db, this.getForageAttemptsPath());
      const q = query(
        attemptsRef,
        where('timestamp', '>=', this.convertDateToTimestamp(startOfDay))
      );

      const snapshot = await getDocs(q);
      const usedToday = snapshot.size;

      return Math.max(0, GAME_CONFIG.DAILY_FORAGE_LIMIT - usedToday);
    } catch (error) {
      logger.error('Erro ao verificar tentativas restantes:', error);
      return 0;
    }
  }

  async getStats() {
    const collected = await this.getCollectedIngredients();
    const attempts = await this.getForageAttempts();

    const totalCollected = collected.length;
    const totalUsed = collected.filter((ing) => ing.used).length;
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter((attempt) => attempt.success).length;

    const byRegion = this.groupByRegion(collected, attempts);
    const byRarity = this.groupByRarity(collected, attempts);

    return {
      totalCollected,
      totalUsed,
      totalAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0,
      byRegion,
      byRarity
    };
  }

  private groupByRegion(
    collected: CollectedIngredient[],
    attempts: ForageAttempt[]
  ): Record<string, number> {
    return collected.reduce(
      (acc, ing) => {
        const region = ing.forageAttemptId
          ? attempts.find((a) => a.id === ing.forageAttemptId)?.region || 'Desconhecida'
          : 'Desconhecida';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private groupByRarity(
    collected: CollectedIngredient[],
    attempts: ForageAttempt[]
  ): Record<string, number> {
    return collected.reduce(
      (acc, ing) => {
        const rarity = ing.forageAttemptId
          ? attempts.find((a) => a.id === ing.forageAttemptId)?.rarity || 'comum'
          : 'comum';
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  cleanup(): void {
    if (this.collectedIngredientsUnsubscribe) {
      this.collectedIngredientsUnsubscribe();
      this.collectedIngredientsUnsubscribe = null;
    }
    if (this.forageAttemptsUnsubscribe) {
      this.forageAttemptsUnsubscribe();
      this.forageAttemptsUnsubscribe = null;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
