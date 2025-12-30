import { DiceType } from '@/types/ingredients';

export const DICE_OPTIONS: { value: DiceType; label: string }[] = [
  { value: 'd4', label: 'D4' },
  { value: 'd6', label: 'D6' },
  { value: 'd8', label: 'D8' },
  { value: 'd10', label: 'D10' },
  { value: 'd12', label: 'D12' }
];

export const TEST_TYPE_OPTIONS = [
  { value: 'natureza', label: 'constants.forage.testType.nature', icon: '🌱' },
  { value: 'sobrevivencia', label: 'constants.forage.testType.survival', icon: '🏕️' }
];

export const ADVANTAGE_OPTIONS = [
  { value: 'normal', label: 'constants.forage.advantage.normal' },
  { value: 'vantagem', label: 'constants.forage.advantage.advantage', icon: '✨' },
  { value: 'desvantagem', label: 'constants.forage.advantage.disadvantage', icon: '⚠️' }
];
