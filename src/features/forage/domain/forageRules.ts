import { AdvantageType, DiceType } from '@/types/ingredients';

export type ForageRarity = 'comum' | 'incomum' | 'raro' | 'unico';

export interface ForageRarityResult {
  rarity: ForageRarity;
  success: boolean;
  dcResult: {
    dc: number;
    range: string;
  };
  isNative?: boolean;
}

export interface BonusDice {
  type: DiceType;
  value: number;
}

const ROLL_RANGES = [
  { min: 10, max: 15, rarity: 'comum' as const, isNative: true, dc: 10 },
  { min: 16, max: 20, rarity: 'incomum' as const, isNative: true, dc: 16 },
  { min: 21, max: 25, rarity: 'incomum' as const, isNative: false, dc: 21 },
  { min: 26, max: 30, rarity: 'raro' as const, isNative: false, dc: 26 },
  { min: 31, max: Infinity, rarity: 'unico' as const, isNative: false, dc: 31 }
];

export function determineForageRarity(totalRoll: number, random = Math.random): ForageRarityResult {
  const range = ROLL_RANGES.find(({ min, max }) => totalRoll >= min && totalRoll <= max);

  if (!range) {
    return {
      rarity: 'comum',
      success: false,
      dcResult: { dc: 10, range: '10-15' }
    };
  }

  let finalRarity: ForageRarity = range.rarity;

  if (range.rarity === 'raro' && random() > 0.3) {
    finalRarity = 'incomum';
  }

  if (range.rarity === 'unico' && random() > 0.1) {
    finalRarity = random() <= 0.3 ? 'raro' : 'incomum';
  }

  return {
    rarity: finalRarity,
    success: true,
    dcResult: {
      dc: range.dc,
      range: `${range.min}-${range.max === Infinity ? '+' : range.max}`
    },
    isNative: range.isNative
  };
}

export function normalizeModifier(value: number | ''): number {
  return value === '' ? 0 : value;
}

export function canForage(remainingAttempts: number, region?: string, testType?: string): boolean {
  return remainingAttempts > 0 && Boolean(region) && Boolean(testType);
}

export function shouldShowDoubleForage(
  enabled: boolean,
  success: boolean | undefined,
  rarity: ForageRarity | undefined
): boolean {
  return Boolean(enabled && success && (rarity === 'comum' || rarity === 'incomum'));
}

export function describeAdvantage(advantage: AdvantageType): AdvantageType {
  return advantage;
}
