import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { PotionRecipe } from '@/types/ingredients';

class FirebaseRecipeService {
  private recipesUnsubscribe: Unsubscribe | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getRecipesPath(): string {
    const userId = this.getUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    return `users/${userId}/recipes`;
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

  async saveRecipe(recipe: PotionRecipe): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;
    
    try {
      const recipesRef = collection(db, this.getRecipesPath());
      await addDoc(recipesRef, {
        ...recipe,
        createdAt: this.convertDateToTimestamp(recipe.createdAt)
      });
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      throw error;
    }
  }

  async getAllRecipes(): Promise<PotionRecipe[]> {
    if (!this.isClient() || !this.getUserId()) return [];
    
    try {
      const recipesRef = collection(db, this.getRecipesPath());
      const snapshot = await getDocs(recipesRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertTimestampToDate(data.createdAt)
        } as PotionRecipe;
      });
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      return [];
    }
  }

  subscribeToRecipes(callback: (recipes: PotionRecipe[]) => void): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback([]);
      return () => {};
    }

    try {
      const recipesRef = collection(db, this.getRecipesPath());
      const q = query(recipesRef, orderBy('createdAt', 'desc'));
      
      this.recipesUnsubscribe = onSnapshot(q, (snapshot) => {
        const recipes = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: this.convertTimestampToDate(data.createdAt)
          } as PotionRecipe;
        });
        callback(recipes);
      }, (error) => {
        console.error('Erro ao observar receitas:', error);
        callback([]);
      });

      return () => {
        if (this.recipesUnsubscribe) {
          this.recipesUnsubscribe();
          this.recipesUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('Erro ao criar subscription de receitas:', error);
      callback([]);
      return () => {};
    }
  }

  async removeRecipe(recipeId: string): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;
    
    try {
      const recipeRef = doc(db, this.getRecipesPath(), recipeId);
      await deleteDoc(recipeRef);
    } catch (error) {
      console.error('Erro ao remover receita:', error);
      throw error;
    }
  }

  async getRecipeById(recipeId: string): Promise<PotionRecipe | null> {
    if (!this.isClient() || !this.getUserId()) return null;
    
    try {
      const recipeRef = doc(db, this.getRecipesPath(), recipeId);
      const snapshot = await getDoc(recipeRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          ...data,
          id: snapshot.id,
          createdAt: this.convertTimestampToDate(data.createdAt)
        } as PotionRecipe;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      return null;
    }
  }

  async getRecipesByCategory(category: 'combat' | 'utility' | 'whimsy'): Promise<PotionRecipe[]> {
    if (!this.isClient() || !this.getUserId()) return [];
    
    try {
      const recipesRef = collection(db, this.getRecipesPath());
      const q = query(recipesRef, where('winningAttribute', '==', category), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertTimestampToDate(data.createdAt)
        } as PotionRecipe;
      });
    } catch (error) {
      console.error('Erro ao buscar receitas por categoria:', error);
      return [];
    }
  }

  async getRecipeStats(): Promise<{
    total: number;
    byCategory: {
      combat: number;
      utility: number;
      whimsy: number;
    };
    recent: number;
  }> {
    const recipes = await this.getAllRecipes();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: recipes.length,
      byCategory: {
        combat: recipes.filter(r => r.winningAttribute === 'combat').length,
        utility: recipes.filter(r => r.winningAttribute === 'utility').length,
        whimsy: recipes.filter(r => r.winningAttribute === 'whimsy').length,
      },
      recent: recipes.filter(r => r.createdAt >= sevenDaysAgo).length
    };
  }

  cleanup(): void {
    if (this.recipesUnsubscribe) {
      this.recipesUnsubscribe();
      this.recipesUnsubscribe = null;
    }
  }
}

export const firebaseRecipeService = new FirebaseRecipeService();

