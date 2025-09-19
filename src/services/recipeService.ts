import { PotionRecipe } from '../types/ingredients';

class RecipeService {
  private readonly STORAGE_KEY = 'obojima_potion_recipes';

  /**
   * Salva uma receita no localStorage
   */
  public saveRecipe(recipe: PotionRecipe): void {
    const recipes = this.getAllRecipes();
    recipes.push(recipe);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recipes));
  }

  /**
   * Obtém todas as receitas salvas
   */
  public getAllRecipes(): PotionRecipe[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const recipes = JSON.parse(stored) as PotionRecipe[];
      // Converter as datas de string para Date
      return recipes.map((recipe) => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt)
      }));
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      return [];
    }
  }

  /**
   * Remove uma receita pelo ID
   */
  public removeRecipe(recipeId: string): void {
    const recipes = this.getAllRecipes();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecipes));
  }

  /**
   * Obtém uma receita específica pelo ID
   */
  public getRecipeById(recipeId: string): PotionRecipe | null {
    const recipes = this.getAllRecipes();
    return recipes.find(recipe => recipe.id === recipeId) || null;
  }

  /**
   * Obtém receitas por categoria de poção
   */
  public getRecipesByCategory(category: 'combat' | 'utility' | 'whimsy'): PotionRecipe[] {
    const recipes = this.getAllRecipes();
    return recipes.filter(recipe => recipe.winningAttribute === category);
  }

  /**
   * Obtém estatísticas das receitas
   */
  public getRecipeStats(): {
    total: number;
    byCategory: {
      combat: number;
      utility: number;
      whimsy: number;
    };
    recent: number; // receitas criadas nos últimos 7 dias
  } {
    const recipes = this.getAllRecipes();
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

  /**
   * Limpa todas as receitas
   */
  public clearAllRecipes(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const recipeService = new RecipeService();
