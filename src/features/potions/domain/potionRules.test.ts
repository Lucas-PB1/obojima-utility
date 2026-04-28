import { describe, expect, it } from 'vitest';
import {
  assertValidPotionIngredients,
  calculatePotionScores,
  getAvailablePotionScores,
  resolveWinningPotionAttribute
} from './potionRules';
import { Ingredient } from '@/types/ingredients';

const ingredients: Ingredient[] = [
  { id: 1, nome: 'A', combat: 4, utility: 1, whimsy: 2, descricao: '' },
  { id: 2, nome: 'B', combat: 3, utility: 2, whimsy: 1, descricao: '' },
  { id: 3, nome: 'C', combat: 1, utility: 2, whimsy: 5, descricao: '' }
];

describe('potion rules', () => {
  it('validates exactly three unique ingredients', () => {
    expect(assertValidPotionIngredients(ingredients)).toBeNull();
    expect(assertValidPotionIngredients(ingredients.slice(0, 2))).toMatch(/exatamente 3/);
    expect(assertValidPotionIngredients([ingredients[0], ingredients[0], ingredients[2]])).toMatch(
      /únicos/
    );
  });

  it('calculates scores and stable tie priority', () => {
    expect(calculatePotionScores(ingredients)).toEqual({
      combatScore: 8,
      utilityScore: 5,
      whimsyScore: 8,
      winningAttribute: 'combat'
    });
  });

  it('supports potion brewer choice from ranked scores', () => {
    expect(getAvailablePotionScores(ingredients, true).canChoose).toBe(true);
    expect(resolveWinningPotionAttribute(ingredients, 'whimsy')).toEqual({
      attribute: 'whimsy',
      score: 8
    });
  });
});
