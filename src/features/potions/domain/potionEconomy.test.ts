import { describe, expect, it } from 'vitest';
import {
  applyPotionGoldCost,
  canAffordPotion,
  getPotionGoldCost,
  normalizePotionRarity
} from './potionEconomy';

describe('potionEconomy', () => {
  it('normalizes Portuguese and English rarities', () => {
    expect(normalizePotionRarity('Comum')).toBe('common');
    expect(normalizePotionRarity('common')).toBe('common');
    expect(normalizePotionRarity('Incomum')).toBe('uncommon');
    expect(normalizePotionRarity('Uncommon')).toBe('uncommon');
    expect(normalizePotionRarity('Rara')).toBe('rare');
    expect(normalizePotionRarity('raro')).toBe('rare');
    expect(normalizePotionRarity('Rare')).toBe('rare');
  });

  it('returns gold costs by rarity', () => {
    expect(getPotionGoldCost('Comum')).toBe(25);
    expect(getPotionGoldCost('Incomum')).toBe(75);
    expect(getPotionGoldCost('Rara')).toBe(300);
    expect(getPotionGoldCost({ raridade: 'Rare' })).toBe(300);
  });

  it('blocks and applies costs without negative gold', () => {
    expect(canAffordPotion(74, 'Incomum')).toBe(false);
    expect(canAffordPotion(75, 'Incomum')).toBe(true);
    expect(applyPotionGoldCost(75, 'Incomum')).toBe(0);
    expect(applyPotionGoldCost(10, 'Comum')).toBe(0);
  });
});
