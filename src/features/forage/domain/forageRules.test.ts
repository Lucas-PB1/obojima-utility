import { describe, expect, it } from 'vitest';
import {
  canForage,
  determineForageRarity,
  normalizeModifier,
  shouldShowDoubleForage
} from './forageRules';

describe('forage rules', () => {
  it('normalizes empty modifiers', () => {
    expect(normalizeModifier('')).toBe(0);
    expect(normalizeModifier(3)).toBe(3);
  });

  it('maps total rolls to success ranges', () => {
    expect(determineForageRarity(9).success).toBe(false);
    expect(determineForageRarity(10).rarity).toBe('comum');
    expect(determineForageRarity(21).rarity).toBe('incomum');
  });

  it('keeps rare and unique chances deterministic when random is injected', () => {
    expect(determineForageRarity(26, () => 0.1).rarity).toBe('raro');
    expect(determineForageRarity(26, () => 0.9).rarity).toBe('incomum');
    expect(determineForageRarity(31, () => 0.05).rarity).toBe('unico');
  });

  it('validates foraging prerequisites and double forage visibility', () => {
    expect(canForage(1, 'Coastal Highlands', 'natureza')).toBe(true);
    expect(canForage(0, 'Coastal Highlands', 'natureza')).toBe(false);
    expect(shouldShowDoubleForage(true, true, 'comum')).toBe(true);
    expect(shouldShowDoubleForage(true, true, 'raro')).toBe(false);
  });
});
