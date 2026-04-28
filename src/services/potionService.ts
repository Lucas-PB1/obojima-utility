import {
  Ingredient,
  Potion,
  PotionCategory,
  PotionRecipe,
  PotionBrewingResult
} from '@/types/ingredients';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import {
  assertValidPotionIngredients,
  calculatePotionScores,
  getAvailablePotionScores,
  resolveWinningPotionAttribute
} from '@/features/potions/domain/potionRules';

import { BaseDataService } from './baseDataService';
import { logger } from '@/utils/logger';

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
      await Promise.all([
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
      logger.error('Erro ao carregar dados das poções:', error);
    }
  }

  public calculateAvailableScores(
    ingredients: Ingredient[],
    potionBrewerTalent: boolean = false
  ): {
    scores: Array<{ attribute: 'combat' | 'utility' | 'whimsy'; value: number; label: string }>;
    canChoose: boolean;
  } {
    return getAvailablePotionScores(ingredients, potionBrewerTalent);
  }

  public async brewPotion(
    ingredients: Ingredient[],
    chosenAttribute?: 'combat' | 'utility' | 'whimsy',
    language: string = 'pt'
  ): Promise<PotionBrewingResult> {
    const validationError = assertValidPotionIngredients(ingredients);
    if (validationError) {
      return {
        recipe: this.createEmptyRecipe(),
        success: false,
        message: validationError
      };
    }

    const { combatScore, utilityScore, whimsyScore } = calculatePotionScores(ingredients);
    const winner = resolveWinningPotionAttribute(ingredients, chosenAttribute);

    const potionBrewerTalent = await firebaseSettingsService.getPotionBrewerTalent();
    const winningAttribute = winner.attribute;
    const winningScore = winner.score;

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
        logger.error('Erro ao gerar poção dos restos:', error);
      }
    }

    if (potionBrewerTalent) {
      const potionBrewerLevel = await firebaseSettingsService.getPotionBrewerLevel();
      const percentageRoll = Math.floor(Math.random() * 100) + 1;

      if (percentageRoll <= potionBrewerLevel) {
        const defaultWinner = resolveWinningPotionAttribute(ingredients);
        const secondPotion = this.selectPotion(
          defaultWinner.attribute,
          defaultWinner.score,
          language
        );
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

  public async getTotalPotionsCount(language: string = 'pt'): Promise<{
    combat: number;
    utility: number;
    whimsy: number;
    total: number;
  }> {
    await this.loadPotionData(language);

    const combatCount = this.combatPotions[language]?.total || 0;
    const utilityCount = this.utilityPotions[language]?.total || 0;
    const whimsyCount = this.whimsicalPotions[language]?.total || 0;

    return {
      combat: combatCount,
      utility: utilityCount,
      whimsy: whimsyCount,
      total: combatCount + utilityCount + whimsyCount
    };
  }

  public calculateScores(ingredients: Ingredient[]): {
    combatScore: number;
    utilityScore: number;
    whimsyScore: number;
    winningAttribute: 'combat' | 'utility' | 'whimsy';
  } {
    return calculatePotionScores(ingredients);
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
