import {
  Ingredient,
  Potion,
  PotionCategory,
  PotionRecipe,
  PotionBrewingResult
} from '@/types/ingredients';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';

import { BaseDataService } from './baseDataService';

class PotionService extends BaseDataService {
  private combatPotions: Record<string, PotionCategory> = {};
  private utilityPotions: Record<string, PotionCategory> = {};
  private whimsicalPotions: Record<string, PotionCategory> = {};

  constructor() {
    super();
  }

  private async loadPotionData(language: string = 'pt'): Promise<void> {
    if (
      this.combatPotions[language] &&
      this.utilityPotions[language] &&
      this.whimsicalPotions[language]
    ) {
      return;
    }

    try {
      const [combatResponse, utilityResponse, whimsicalResponse] = await Promise.all([
        this.loadData(
          `/data/${language}/potions/combat/combat-potions.json`,
          this.combatPotions,
          language
        ),
        this.loadData(
          `/data/${language}/potions/utility/utility-potions.json`,
          this.utilityPotions,
          language
        ),
        this.loadData(
          `/data/${language}/potions/whimsical/whimsical-potions.json`,
          this.whimsicalPotions,
          language
        )
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados das poções:', error);
    }
  }

  public calculateAvailableScores(
    ingredients: Ingredient[],
    potionBrewerTalent: boolean = false
  ): {
    scores: Array<{ attribute: 'combat' | 'utility' | 'whimsy'; value: number; label: string }>;
    canChoose: boolean;
  } {
    if (ingredients.length !== 3) {
      return { scores: [], canChoose: false };
    }

    const combatScore = ingredients.reduce((sum, ing) => sum + ing.combat, 0);
    const utilityScore = ingredients.reduce((sum, ing) => sum + ing.utility, 0);
    const whimsyScore = ingredients.reduce((sum, ing) => sum + ing.whimsy, 0);

    const scores = [
      { attribute: 'combat' as const, value: combatScore, label: 'Combate' },
      { attribute: 'utility' as const, value: utilityScore, label: 'Utilidade' },
      { attribute: 'whimsy' as const, value: whimsyScore, label: 'Caprichoso' }
    ];

    scores.sort((a, b) => b.value - a.value);

    const canChoose = potionBrewerTalent && scores.length >= 2;
    const topTwoScores = scores.slice(0, 2);

    return { scores: topTwoScores, canChoose };
  }

  public async brewPotion(
    ingredients: Ingredient[],
    chosenAttribute?: 'combat' | 'utility' | 'whimsy',
    language: string = 'pt'
  ): Promise<PotionBrewingResult> {
    if (ingredients.length !== 3) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Uma receita deve conter exatamente 3 ingredientes.'
      };
    }

    const ingredientIds = ingredients.map((ing) => ing.id);
    const uniqueIds = new Set(ingredientIds);
    if (uniqueIds.size !== 3) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Todos os ingredientes em uma receita devem ser únicos.'
      };
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

    const potionBrewerTalent = await firebaseSettingsService.getPotionBrewerTalent();
    let winningAttribute: 'combat' | 'utility' | 'whimsy';
    let winningScore: number;

    if (chosenAttribute) {
      const chosenScore = scores.find((s) => s.attribute === chosenAttribute);
      if (chosenScore) {
        winningAttribute = chosenAttribute;
        winningScore = chosenScore.value;
      } else {
        winningAttribute = scores[0].attribute;
        winningScore = scores[0].value;
      }
    } else {
      winningAttribute = scores[0].attribute;
      winningScore = scores[0].value;
    }

    await this.loadPotionData(language);

    const resultingPotion = this.selectPotion(winningAttribute, winningScore, language);

    if (!resultingPotion) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: 'Erro ao determinar a poção resultante.'
      };
    }

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

    const cauldronBonus = await firebaseSettingsService.getCauldronBonus();
    const isUncommonOrRare =
      resultingPotion.raridade === 'Incomum' || resultingPotion.raridade === 'Rara';

    let message = `Poção criada com sucesso! ${resultingPotion.nome} (${resultingPotion.raridade})`;

    if (cauldronBonus && isUncommonOrRare) {
      message += `\n\n✨ Caldeirão Especial ativado! Você também gerou uma poção comum do mesmo tipo com os restos!`;
    }

    const result: PotionBrewingResult = {
      recipe,
      success: true,
      message,
      cauldronBonus: cauldronBonus && isUncommonOrRare
    };

    if (cauldronBonus && isUncommonOrRare) {
      try {
        const commonPotion = await this.generateCommonPotionFromRemains(
          recipe.winningAttribute,
          language
        );
        if (commonPotion) {
          result.remainsPotion = commonPotion;
        }
      } catch (error) {
        console.error('Erro ao gerar poção dos restos:', error);
      }
    }

    if (potionBrewerTalent) {
      const potionBrewerLevel = await firebaseSettingsService.getPotionBrewerLevel();
      const percentageRoll = Math.floor(Math.random() * 100) + 1;

      if (percentageRoll <= potionBrewerLevel) {
        const secondPotion = this.selectPotion(scores[0].attribute, scores[0].value, language);
        if (secondPotion) {
          result.secondPotion = secondPotion;
          result.potionBrewerSuccess = true;
          result.percentageRoll = percentageRoll;
        }
      } else {
        result.potionBrewerSuccess = false;
        result.percentageRoll = percentageRoll;
      }
    }

    return result;
  }

  private selectPotion(
    attribute: 'combat' | 'utility' | 'whimsy',
    score: number,
    language: string
  ): Potion | null {
    let potionCategory: PotionCategory | null = null;

    if (!this.combatPotions[language]) return null;

    switch (attribute) {
      case 'combat':
        potionCategory = this.combatPotions[language];
        break;
      case 'utility':
        potionCategory = this.utilityPotions[language];
        break;
      case 'whimsy':
        potionCategory = this.whimsicalPotions[language];
        break;
    }

    if (!potionCategory || !potionCategory.pocoes.length) {
      return null;
    }

    const potionIndex = (score - 1) % potionCategory.pocoes.length;
    return potionCategory.pocoes[potionIndex];
  }

  private generateRecipeId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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
        nome: '',
        raridade: '',
        descricao: ''
      },
      createdAt: new Date()
    };
  }

  public async getPotionsByCategory(
    category: 'combat' | 'utility' | 'whimsy',
    language: string = 'pt'
  ): Promise<Potion[]> {
    await this.loadPotionData(language);

    switch (category) {
      case 'combat':
        return this.combatPotions[language]?.pocoes || [];
      case 'utility':
        return this.utilityPotions[language]?.pocoes || [];
      case 'whimsy':
        return this.whimsicalPotions[language]?.pocoes || [];
      default:
        return [];
    }
  }

  public async getPotionById(
    category: 'combat' | 'utility' | 'whimsy',
    id: number,
    language: string = 'pt'
  ): Promise<Potion | null> {
    const potions = await this.getPotionsByCategory(category, language);
    return potions.find((potion) => potion.id === id) || null;
  }

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

  public async generateCommonPotionFromRemains(
    winningAttribute: 'combat' | 'utility' | 'whimsy',
    language: string = 'pt'
  ): Promise<Potion | null> {
    await this.loadPotionData(language);

    let potionCategory: PotionCategory | null = null;

    if (!this.combatPotions[language]) return null;

    switch (winningAttribute) {
      case 'combat':
        potionCategory = this.combatPotions[language];
        break;
      case 'utility':
        potionCategory = this.utilityPotions[language];
        break;
      case 'whimsy':
        potionCategory = this.whimsicalPotions[language];
        break;
    }

    if (!potionCategory || !potionCategory.pocoes.length) {
      return null;
    }

    const commonPotions = potionCategory.pocoes.filter((potion) => potion.raridade === 'Comum');

    if (commonPotions.length > 0) {
      const randomIndex = Math.floor(Math.random() * commonPotions.length);
      return commonPotions[randomIndex];
    }

    return null;
  }
}

export const potionService = new PotionService();
