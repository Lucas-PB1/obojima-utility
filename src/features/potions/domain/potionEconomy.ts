import { Potion } from '@/types/ingredients';

export type PotionCostRarity = 'common' | 'uncommon' | 'rare';

export const POTION_GOLD_COSTS: Record<PotionCostRarity, number> = {
  common: 25,
  uncommon: 75,
  rare: 300
};

export function normalizePotionRarity(rarity?: string | null): PotionCostRarity | null {
  const normalized = (rarity || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'comum' || normalized === 'common') return 'common';
  if (normalized === 'incomum' || normalized === 'uncommon') return 'uncommon';
  if (normalized === 'raro' || normalized === 'rara' || normalized === 'rare') return 'rare';

  return null;
}

export function getPotionGoldCost(
  potionOrRarity?: Pick<Potion, 'raridade'> | string | null
): number {
  const rarity =
    typeof potionOrRarity === 'string'
      ? normalizePotionRarity(potionOrRarity)
      : normalizePotionRarity(potionOrRarity?.raridade);

  return rarity ? POTION_GOLD_COSTS[rarity] : 0;
}

export function normalizeGold(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.floor(numeric));
}

export function canAffordPotion(
  gold: number,
  potionOrRarity?: Pick<Potion, 'raridade'> | string | null
): boolean {
  return normalizeGold(gold) >= getPotionGoldCost(potionOrRarity);
}

export function applyPotionGoldCost(
  gold: number,
  potionOrRarity?: Pick<Potion, 'raridade'> | string | null
): number {
  return Math.max(0, normalizeGold(gold) - getPotionGoldCost(potionOrRarity));
}
