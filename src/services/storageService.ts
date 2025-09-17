import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';

class StorageService {
  private readonly COLLECTED_KEY = 'obojima_collected_ingredients';
  private readonly ATTEMPTS_KEY = 'obojima_forage_attempts';

  // Gerenciar ingredientes coletados
  getCollectedIngredients(): CollectedIngredient[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.COLLECTED_KEY);
      if (!stored) return [];
      
      const ingredients = JSON.parse(stored);
      // Converter strings de data de volta para objetos Date
      return ingredients.map((ing: CollectedIngredient & { collectedAt: string; usedAt?: string }) => ({
        ...ing,
        collectedAt: new Date(ing.collectedAt),
        usedAt: ing.usedAt ? new Date(ing.usedAt) : undefined
      }));
    } catch (error) {
      console.error('Erro ao carregar ingredientes coletados:', error);
      return [];
    }
  }

  addCollectedIngredient(ingredient: CollectedIngredient): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getCollectedIngredients();
      current.push(ingredient);
      localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Erro ao adicionar ingrediente coletado:', error);
    }
  }

  updateCollectedIngredient(id: string, updates: Partial<CollectedIngredient>): void {
    if (typeof window === 'undefined') return;
    
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
    this.updateCollectedIngredient(id, { 
      used: true, 
      usedAt: new Date() 
    });
  }

  removeCollectedIngredient(id: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getCollectedIngredients();
      const filtered = current.filter(ing => ing.id !== id);
      localStorage.setItem(this.COLLECTED_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao remover ingrediente coletado:', error);
    }
  }

  // Gerenciar tentativas de forrageamento
  getForageAttempts(): ForageAttempt[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.ATTEMPTS_KEY);
      if (!stored) return [];
      
      const attempts = JSON.parse(stored);
      // Converter strings de data de volta para objetos Date
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
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getForageAttempts();
      current.push(attempt);
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Erro ao adicionar tentativa de forrageamento:', error);
    }
  }

  // Estatísticas
  getStats() {
    const collected = this.getCollectedIngredients();
    const attempts = this.getForageAttempts();
    
    const totalCollected = collected.length;
    const totalUsed = collected.filter(ing => ing.used).length;
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(attempt => attempt.success).length;
    
    const byRegion = collected.reduce((acc, ing) => {
      const region = ing.forageAttemptId ? 
        attempts.find(a => a.id === ing.forageAttemptId)?.region || 'Desconhecida' : 'Desconhecida';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRarity = collected.reduce((acc, ing) => {
      const rarity = ing.forageAttemptId ? 
        attempts.find(a => a.id === ing.forageAttemptId)?.rarity || 'comum' : 'comum';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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

  // Limpar dados
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.COLLECTED_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  // Exportar dados
  exportData(): string {
    const data = {
      collectedIngredients: this.getCollectedIngredients(),
      forageAttempts: this.getForageAttempts(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Importar dados
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
