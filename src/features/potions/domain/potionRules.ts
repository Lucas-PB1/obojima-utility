import { Ingredient, PotionScores } from '@/types/ingredients';

export type PotionAttribute = 'combat' | 'utility' | 'whimsy';

export interface RankedPotionScore {
  attribute: PotionAttribute;
  value: number;
  label: string;
}

export function assertValidPotionIngredients(ingredients: Ingredient[]): string | null {
  if (ingredients.length !== 3) return 'Uma receita deve conter exatamente 3 ingredientes.';

  const uniqueIds = new Set(ingredients.map((ingredient) => ingredient.id));
  if (uniqueIds.size !== 3) return 'Todos os ingredientes em uma receita devem ser únicos.';

  return null;
}

export function calculatePotionScores(ingredients: Ingredient[]): PotionScores {
  const validationError = assertValidPotionIngredients(ingredients);
  if (validationError) throw new Error(validationError);

  const combatScore = ingredients.reduce((sum, ingredient) => sum + ingredient.combat, 0);
  const utilityScore = ingredients.reduce((sum, ingredient) => sum + ingredient.utility, 0);
  const whimsyScore = ingredients.reduce((sum, ingredient) => sum + ingredient.whimsy, 0);
  const winningAttribute = rankPotionScores(ingredients)[0].attribute;

  return {
    combatScore,
    utilityScore,
    whimsyScore,
    winningAttribute
  };
}

export function rankPotionScores(ingredients: Ingredient[]): RankedPotionScore[] {
  const combatScore = ingredients.reduce((sum, ingredient) => sum + ingredient.combat, 0);
  const utilityScore = ingredients.reduce((sum, ingredient) => sum + ingredient.utility, 0);
  const whimsyScore = ingredients.reduce((sum, ingredient) => sum + ingredient.whimsy, 0);

  const scores: RankedPotionScore[] = [
    { attribute: 'combat', value: combatScore, label: 'Combate' },
    { attribute: 'utility', value: utilityScore, label: 'Utilidade' },
    { attribute: 'whimsy', value: whimsyScore, label: 'Caprichoso' }
  ];

  return scores.sort((a, b) => b.value - a.value);
}

export function getAvailablePotionScores(
  ingredients: Ingredient[],
  potionBrewerTalent = false
): {
  scores: RankedPotionScore[];
  canChoose: boolean;
} {
  if (ingredients.length !== 3) {
    return { scores: [], canChoose: false };
  }

  return {
    scores: rankPotionScores(ingredients).slice(0, 2),
    canChoose: potionBrewerTalent
  };
}

export function resolveWinningPotionAttribute(
  ingredients: Ingredient[],
  chosenAttribute?: PotionAttribute
): { attribute: PotionAttribute; score: number } {
  const scores = rankPotionScores(ingredients);
  const chosenScore = chosenAttribute
    ? scores.find((score) => score.attribute === chosenAttribute)
    : undefined;
  const winner = chosenScore || scores[0];

  return {
    attribute: winner.attribute,
    score: winner.value
  };
}
