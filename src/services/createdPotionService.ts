import { CreatedPotion, PotionRecipe } from '../types/ingredients';

class CreatedPotionService {
  private readonly STORAGE_KEY = 'obojima_created_potions';

  /**
   * Adiciona uma nova poção criada
   */
  public addCreatedPotion(recipe: PotionRecipe): CreatedPotion {
    const createdPotion: CreatedPotion = {
      id: this.generatePotionId(),
      potion: recipe.resultingPotion,
      recipe: recipe,
      quantity: 1, // Sempre começa com quantidade 1
      createdAt: new Date(),
      used: false
    };

    const existingPotions = this.getAllCreatedPotions();
    existingPotions.push(createdPotion);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingPotions));

    return createdPotion;
  }

  /**
   * Obtém todas as poções criadas
   */
  public getAllCreatedPotions(): CreatedPotion[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const potions = JSON.parse(stored) as CreatedPotion[];
      // Converter as datas de string para Date
      return potions.map((potion) => ({
        ...potion,
        createdAt: new Date(potion.createdAt),
        usedAt: potion.usedAt ? new Date(potion.usedAt) : undefined
      }));
    } catch (error) {
      console.error('Erro ao carregar poções criadas:', error);
      return [];
    }
  }

  /**
   * Obtém poções com quantidade > 0
   */
  public getAvailablePotions(): CreatedPotion[] {
    return this.getAllCreatedPotions().filter(potion => potion.quantity > 0);
  }

  /**
   * Usa uma poção (diminui a quantidade)
   */
  public usePotion(potionId: string): boolean {
    const potions = this.getAllCreatedPotions();
    const potionIndex = potions.findIndex(p => p.id === potionId);
    
    if (potionIndex === -1 || potions[potionIndex].quantity <= 0) {
      return false;
    }

    potions[potionIndex].quantity -= 1;
    
    // Se a quantidade chegou a 0, marcar como usada
    if (potions[potionIndex].quantity === 0) {
      potions[potionIndex].used = true;
      potions[potionIndex].usedAt = new Date();
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(potions));
    return true;
  }

  /**
   * Remove uma poção completamente
   */
  public removePotion(potionId: string): void {
    const potions = this.getAllCreatedPotions();
    const filteredPotions = potions.filter(potion => potion.id !== potionId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPotions));
  }

  /**
   * Obtém uma poção específica por ID
   */
  public getPotionById(potionId: string): CreatedPotion | null {
    const potions = this.getAllCreatedPotions();
    return potions.find(potion => potion.id === potionId) || null;
  }

  /**
   * Obtém poções por categoria
   */
  public getPotionsByCategory(category: 'combat' | 'utility' | 'whimsy'): CreatedPotion[] {
    const potions = this.getAllCreatedPotions();
    return potions.filter(potion => potion.recipe.winningAttribute === category);
  }

  /**
   * Obtém estatísticas das poções criadas
   */
  public getPotionStats(): {
    total: number;
    available: number;
    used: number;
    byCategory: {
      combat: number;
      utility: number;
      whimsy: number;
    };
    recent: number; // poções criadas nos últimos 7 dias
  } {
    const potions = this.getAllCreatedPotions();
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

  /**
   * Limpa todas as poções criadas
   */
  public clearAllPotions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Gera um ID único para a poção
   */
  private generatePotionId(): string {
    return `potion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrupa poções por tipo (mesma poção, mesma receita)
   */
  public getGroupedPotions(): Array<{
    potion: Potion;
    recipe: PotionRecipe;
    instances: CreatedPotion[];
    totalQuantity: number;
  }> {
    const potions = this.getAllCreatedPotions();
    const grouped = new Map<string, CreatedPotion[]>();

    // Agrupar por ID da poção e receita
    potions.forEach(potion => {
      const key = `${potion.potion.id}_${potion.recipe.id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(potion);
    });

    // Converter para array com informações agregadas
    return Array.from(grouped.entries()).map(([key, instances]) => {
      const firstInstance = instances[0];
      const totalQuantity = instances.reduce((sum, instance) => sum + instance.quantity, 0);
      
      return {
        potion: firstInstance.potion,
        recipe: firstInstance.recipe,
        instances,
        totalQuantity
      };
    });
  }

  /**
   * Limpa todas as poções criadas
   */
  public clearAllCreatedPotions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const createdPotionService = new CreatedPotionService();
