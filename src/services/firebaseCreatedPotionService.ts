import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from './authService';
import { CreatedPotion, PotionRecipe, Potion } from '@/types/ingredients';

class FirebaseCreatedPotionService {
  private potionsUnsubscribe: Unsubscribe | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getPotionsPath(): string {
    const userId = this.getUserId();
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

  private convertDateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Adiciona uma nova poção criada
   */
  async addCreatedPotion(recipe: PotionRecipe): Promise<CreatedPotion> {
    if (!this.isClient() || !this.getUserId()) {
      throw new Error('Usuário não autenticado');
    }
    
    const createdPotion: Omit<CreatedPotion, 'id'> = {
      potion: recipe.resultingPotion,
      recipe: {
        ...recipe,
        createdAt: recipe.createdAt
      },
      quantity: 1, // Sempre começa com quantidade 1
      createdAt: new Date(),
      used: false
    };

    try {
      const potionsRef = collection(db, this.getPotionsPath());
      const docRef = await addDoc(potionsRef, {
        ...createdPotion,
        recipe: {
          ...createdPotion.recipe,
          createdAt: this.convertDateToTimestamp(createdPotion.recipe.createdAt)
        },
        createdAt: this.convertDateToTimestamp(createdPotion.createdAt)
      });

      return {
        ...createdPotion,
        id: docRef.id
      };
    } catch (error) {
      console.error('Erro ao adicionar poção criada:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as poções criadas
   */
  async getAllCreatedPotions(): Promise<CreatedPotion[]> {
    if (!this.isClient() || !this.getUserId()) return [];
    
    try {
      const potionsRef = collection(db, this.getPotionsPath());
      const snapshot = await getDocs(potionsRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertTimestampToDate(data.createdAt),
          usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined,
          recipe: {
            ...data.recipe,
            createdAt: this.convertTimestampToDate(data.recipe.createdAt)
          }
        } as CreatedPotion;
      });
    } catch (error) {
      console.error('Erro ao carregar poções criadas:', error);
      return [];
    }
  }

  /**
   * Observa mudanças nas poções criadas em tempo real
   */
  subscribeToCreatedPotions(callback: (potions: CreatedPotion[]) => void): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback([]);
      return () => {};
    }

    try {
      const potionsRef = collection(db, this.getPotionsPath());
      const q = query(potionsRef, orderBy('createdAt', 'desc'));
      
      this.potionsUnsubscribe = onSnapshot(q, (snapshot) => {
        const potions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: this.convertTimestampToDate(data.createdAt),
            usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined,
            recipe: {
              ...data.recipe,
              createdAt: this.convertTimestampToDate(data.recipe.createdAt)
            }
          } as CreatedPotion;
        });
        callback(potions);
      }, (error) => {
        console.error('Erro ao observar poções:', error);
        callback([]);
      });

      return () => {
        if (this.potionsUnsubscribe) {
          this.potionsUnsubscribe();
          this.potionsUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('Erro ao criar subscription de poções:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Obtém poções com quantidade > 0
   */
  async getAvailablePotions(): Promise<CreatedPotion[]> {
    const potions = await this.getAllCreatedPotions();
    return potions.filter(potion => potion.quantity > 0);
  }

  /**
   * Usa uma poção (diminui a quantidade)
   */
  async usePotion(potionId: string): Promise<boolean> {
    if (!this.isClient() || !this.getUserId()) return false;
    
    try {
      const potion = await this.getPotionById(potionId);
      
      if (!potion || potion.quantity <= 0) {
        return false;
      }

      const newQuantity = potion.quantity - 1;
      const potionRef = doc(db, this.getPotionsPath(), potionId);
      
      if (newQuantity === 0) {
        await updateDoc(potionRef, {
          quantity: 0,
          used: true,
          usedAt: this.convertDateToTimestamp(new Date())
        });
      } else {
        await updateDoc(potionRef, {
          quantity: newQuantity
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao usar poção:', error);
      return false;
    }
  }

  /**
   * Remove uma poção completamente
   */
  async removePotion(potionId: string): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;
    
    try {
      const potionRef = doc(db, this.getPotionsPath(), potionId);
      await deleteDoc(potionRef);
    } catch (error) {
      console.error('Erro ao remover poção:', error);
      throw error;
    }
  }

  /**
   * Obtém uma poção específica por ID
   */
  async getPotionById(potionId: string): Promise<CreatedPotion | null> {
    if (!this.isClient() || !this.getUserId()) return null;
    
    try {
      const potionRef = doc(db, this.getPotionsPath(), potionId);
      const snapshot = await getDoc(potionRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          ...data,
          id: snapshot.id,
          createdAt: this.convertTimestampToDate(data.createdAt),
          usedAt: data.usedAt ? this.convertTimestampToDate(data.usedAt) : undefined,
          recipe: {
            ...data.recipe,
            createdAt: this.convertTimestampToDate(data.recipe.createdAt)
          }
        } as CreatedPotion;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar poção:', error);
      return null;
    }
  }

  /**
   * Obtém poções por categoria
   */
  async getPotionsByCategory(category: 'combat' | 'utility' | 'whimsy'): Promise<CreatedPotion[]> {
    const potions = await this.getAllCreatedPotions();
    return potions.filter(potion => potion.recipe.winningAttribute === category);
  }

  /**
   * Obtém estatísticas das poções criadas
   */
  async getPotionStats(): Promise<{
    total: number;
    available: number;
    used: number;
    byCategory: {
      combat: number;
      utility: number;
      whimsy: number;
    };
    recent: number; // poções criadas nos últimos 7 dias
  }> {
    const potions = await this.getAllCreatedPotions();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: potions.length,
      available: potions.filter(p => p.quantity > 0).length,
      used: potions.filter(p => p.used).length,
      byCategory: {
        combat: potions.filter(p => p.recipe.winningAttribute === 'combat').length,
        utility: potions.filter(p => p.recipe.winningAttribute === 'utility').length,
        whimsy: potions.filter(p => p.recipe.winningAttribute === 'whimsy').length,
      },
      recent: potions.filter(p => p.createdAt >= sevenDaysAgo).length
    };
  }



  // Cleanup subscriptions
  cleanup(): void {
    if (this.potionsUnsubscribe) {
      this.potionsUnsubscribe();
      this.potionsUnsubscribe = null;
    }
  }
}

export const firebaseCreatedPotionService = new FirebaseCreatedPotionService();

