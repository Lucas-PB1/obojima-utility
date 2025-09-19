import { 
  Ingredient, 
  Potion, 
  PotionCategory, 
  PotionRecipe, 
  PotionBrewingResult 
} from '../types/ingredients';

class PotionService {
  private combatPotions: PotionCategory | null = null;
  private utilityPotions: PotionCategory | null = null;
  private whimsicalPotions: PotionCategory | null = null;

  constructor() {
    this.loadPotionData();
  }

  private async loadPotionData(): Promise<void> {
    try {
      const [combatResponse, utilityResponse, whimsicalResponse] = await Promise.all([
        fetch('/poções/combate/combat-potions.json'),
        fetch('/poções/utilidade/utility-potions.json'),
        fetch('/poções/caprichosas/whimsical-potions.json')
      ]);

      this.combatPotions = await combatResponse.json();
      this.utilityPotions = await utilityResponse.json();
      this.whimsicalPotions = await whimsicalResponse.json();
    } catch (error) {
      console.error('Erro ao carregar dados das poções:', error);
    }
  }

  /**
   * Cria uma poção baseada em três ingredientes únicos
   */
  public async brewPotion(ingredients: Ingredient[]): Promise<PotionBrewingResult> {
    // Validação: deve ter exatamente 3 ingredientes únicos
    if (ingredients.length !== 3) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Uma receita deve conter exatamente 3 ingredientes.'
      };
    }

    // Verificar se os ingredientes são únicos
    const ingredientIds = ingredients.map(ing => ing.id);
    const uniqueIds = new Set(ingredientIds);
    if (uniqueIds.size !== 3) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Todos os ingredientes em uma receita devem ser únicos.'
      };
    }

    // Calcular scores de cada atributo
    const combatScore = ingredients.reduce((sum, ing) => sum + ing.combat, 0);
    const utilityScore = ingredients.reduce((sum, ing) => sum + ing.utility, 0);
    const whimsyScore = ingredients.reduce((sum, ing) => sum + ing.whimsy, 0);

    // Determinar qual atributo tem o maior score
    const scores = [
      { attribute: 'combat' as const, value: combatScore },
      { attribute: 'utility' as const, value: utilityScore },
      { attribute: 'whimsy' as const, value: whimsyScore }
    ];

    // Ordenar por valor (maior primeiro)
    scores.sort((a, b) => b.value - a.value);

    // Se há empate, o primeiro da lista vence (combat > utility > whimsy)
    const winningAttribute = scores[0].attribute;
    const winningScore = scores[0].value;

    // Aguardar carregamento dos dados se necessário
    if (!this.combatPotions || !this.utilityPotions || !this.whimsicalPotions) {
      await this.loadPotionData();
    }

    // Selecionar a poção baseada no atributo vencedor e score
    const resultingPotion = this.selectPotion(winningAttribute, winningScore);

    if (!resultingPotion) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Erro ao determinar a poção resultante.'
      };
    }

    // Criar a receita
    const recipe: PotionRecipe = {
      id: this.generateRecipeId(),
      ingredients: [...ingredients],
      combatScore,
      utilityScore,
      whimsyScore,
      winningAttribute,
      resultingPotion,
      createdAt: new Date()
    };

    return {
      recipe,
      success: true,
      message: `Poção criada com sucesso! ${resultingPotion.nome_portugues} (${resultingPotion.raridade})`
    };
  }

  /**
   * Seleciona uma poção baseada no atributo vencedor e score
   */
  private selectPotion(attribute: 'combat' | 'utility' | 'whimsy', score: number): Potion | null {
    let potionCategory: PotionCategory | null = null;

    switch (attribute) {
      case 'combat':
        potionCategory = this.combatPotions;
        break;
      case 'utility':
        potionCategory = this.utilityPotions;
        break;
      case 'whimsy':
        potionCategory = this.whimsicalPotions;
        break;
    }

    if (!potionCategory || !potionCategory.pocoes.length) {
      return null;
    }

    // O score determina qual poção da lista será selecionada
    // Usar módulo para garantir que o índice esteja dentro dos limites
    const potionIndex = (score - 1) % potionCategory.pocoes.length;
    return potionCategory.pocoes[potionIndex];
  }

  /**
   * Gera um ID único para a receita
   */
  private generateRecipeId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cria uma receita vazia para casos de erro
   */
  private createEmptyRecipe(): PotionRecipe {
    return {
      id: '',
      ingredients: [],
      combatScore: 0,
      utilityScore: 0,
      whimsyScore: 0,
      winningAttribute: 'combat',
      resultingPotion: {
        id: 0,
        nome_ingles: '',
        nome_portugues: '',
        raridade: '',
        descricao: ''
      },
      createdAt: new Date()
    };
  }

  /**
   * Obtém todas as poções de uma categoria específica
   */
  public async getPotionsByCategory(category: 'combat' | 'utility' | 'whimsy'): Promise<Potion[]> {
    if (!this.combatPotions || !this.utilityPotions || !this.whimsicalPotions) {
      await this.loadPotionData();
    }

    switch (category) {
      case 'combat':
        return this.combatPotions?.pocoes || [];
      case 'utility':
        return this.utilityPotions?.pocoes || [];
      case 'whimsy':
        return this.whimsicalPotions?.pocoes || [];
      default:
        return [];
    }
  }

  /**
   * Obtém uma poção específica por ID e categoria
   */
  public async getPotionById(category: 'combat' | 'utility' | 'whimsy', id: number): Promise<Potion | null> {
    const potions = await this.getPotionsByCategory(category);
    return potions.find(potion => potion.id === id) || null;
  }

  /**
   * Calcula os scores de uma combinação de ingredientes sem criar a poção
   */
  public calculateScores(ingredients: Ingredient[]): {
    combatScore: number;
    utilityScore: number;
    whimsyScore: number;
    winningAttribute: 'combat' | 'utility' | 'whimsy';
  } {
    if (ingredients.length !== 3) {
      throw new Error('Deve fornecer exatamente 3 ingredientes');
    }

    const combatScore = ingredients.reduce((sum, ing) => sum + ing.combat, 0);
    const utilityScore = ingredients.reduce((sum, ing) => sum + ing.utility, 0);
    const whimsyScore = ingredients.reduce((sum, ing) => sum + ing.whimsy, 0);

    const scores = [
      { attribute: 'combat' as const, value: combatScore },
      { attribute: 'utility' as const, value: utilityScore },
      { attribute: 'whimsy' as const, value: whimsyScore }
    ];

    scores.sort((a, b) => b.value - a.value);

    return {
      combatScore,
      utilityScore,
      whimsyScore,
      winningAttribute: scores[0].attribute
    };
  }
}

export const potionService = new PotionService();
