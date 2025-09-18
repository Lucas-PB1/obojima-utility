import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';

class StorageService {
  private readonly COLLECTED_KEY = 'obojima_collected_ingredients';
  private readonly ATTEMPTS_KEY = 'obojima_forage_attempts';

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private parseDates(items: (CollectedIngredient & { collectedAt: string; usedAt?: string })[]): CollectedIngredient[] {
    return items.map(item => ({
      ...item,
      collectedAt: new Date(item.collectedAt),
      usedAt: item.usedAt ? new Date(item.usedAt) : undefined
    }));
  }

  getCollectedIngredients(): CollectedIngredient[] {
    if (!this.isClient()) return [];
    
    try {
      const stored = localStorage.getItem(this.COLLECTED_KEY);
      if (!stored) return [];
      
      const ingredients = JSON.parse(stored);
      return this.parseDates(ingredients);
    } catch (error) {
      console.error('Erro ao carregar ingredientes coletados:', error);
      return [];
    }
  }

  addCollectedIngredient(ingredient: CollectedIngredient): void {
    if (!this.isClient()) return;
    
    try {
      const current = this.getCollectedIngredients();
      const existingIndex = current.findIndex(ing => ing.ingredient.id === ingredient.ingredient.id);
      
      if (existingIndex !== -1) {
        const existing = current[existingIndex];
        existing.quantity += ingredient.quantity;
        existing.collectedAt = new Date();
        if (existing.used) {
          existing.used = false;
          existing.usedAt = undefined;
        }
      } else {
        current.push(ingredient);
      }
      
      localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(current));
      console.log('Ingrediente adicionado à coleção:', ingredient.ingredient.nome_portugues);
    } catch (error) {
      console.error('Erro ao adicionar ingrediente coletado:', error);
    }
  }

  updateCollectedIngredient(id: string, updates: Partial<CollectedIngredient>): void {
    if (!this.isClient()) return;
    
    try {
      const current = this.getCollectedIngredients();
      const index = current.findIndex(ing => ing.id === id);
      if (index !== -1) {
        current[index] = { ...current[index], ...updates };
        localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(current));
      }
    } catch (error) {
      console.error('Erro ao atualizar ingrediente coletado:', error);
    }
  }

  markIngredientAsUsed(id: string): void {
    if (!this.isClient()) return;
    
    try {
      const current = this.getCollectedIngredients();
      const index = current.findIndex(ing => ing.id === id);
      if (index !== -1 && current[index].quantity > 0) {
        const ingredient = current[index];
        ingredient.quantity -= 1;
        
        if (ingredient.quantity === 0) {
          ingredient.used = true;
          ingredient.usedAt = new Date();
        }
        
        localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(current));
      }
    } catch (error) {
      console.error('Erro ao marcar ingrediente como usado:', error);
    }
  }

  removeCollectedIngredient(id: string): void {
    if (!this.isClient()) return;
    
    try {
      const current = this.getCollectedIngredients();
      const filtered = current.filter(ing => ing.id !== id);
      localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao remover ingrediente coletado:', error);
    }
  }

  getForageAttempts(): ForageAttempt[] {
    if (!this.isClient()) return [];
    
    try {
      const stored = localStorage.getItem(this.ATTEMPTS_KEY);
      if (!stored) return [];
      
      const attempts = JSON.parse(stored);
      return attempts.map((attempt: ForageAttempt & { timestamp: string }) => ({
        ...attempt,
        timestamp: new Date(attempt.timestamp)
      }));
    } catch (error) {
      console.error('Erro ao carregar tentativas de forrageamento:', error);
      return [];
    }
  }

  addForageAttempt(attempt: ForageAttempt): void {
    if (!this.isClient()) return;
    
    try {
      const current = this.getForageAttempts();
      current.push(attempt);
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Erro ao adicionar tentativa de forrageamento:', error);
    }
  }

  getStats() {
    const collected = this.getCollectedIngredients();
    const attempts = this.getForageAttempts();
    
    const totalCollected = collected.length;
    const totalUsed = collected.filter(ing => ing.used).length;
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(attempt => attempt.success).length;
    
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

  private groupByRegion(collected: CollectedIngredient[], attempts: ForageAttempt[]): Record<string, number> {
    return collected.reduce((acc, ing) => {
      const region = ing.forageAttemptId 
        ? attempts.find(a => a.id === ing.forageAttemptId)?.region || 'Desconhecida' 
        : 'Desconhecida';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByRarity(collected: CollectedIngredient[], attempts: ForageAttempt[]): Record<string, number> {
    return collected.reduce((acc, ing) => {
      const rarity = ing.forageAttemptId 
        ? attempts.find(a => a.id === ing.forageAttemptId)?.rarity || 'comum' 
        : 'comum';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  clearAllData(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(this.COLLECTED_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  exportData(): string {
    const data = {
      collectedIngredients: this.getCollectedIngredients(),
      forageAttempts: this.getForageAttempts(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.collectedIngredients) {
        localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(data.collectedIngredients));
      }
      
      if (data.forageAttempts) {
        localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(data.forageAttempts));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
