import { DiceType } from '@/types/ingredients';

export const DICE_OPTIONS: { value: DiceType; label: string }[] = [
  { value: 'd4', label: 'D4' },
  { value: 'd6', label: 'D6' },
  { value: 'd8', label: 'D8' },
  { value: 'd10', label: 'D10' },
  { value: 'd12', label: 'D12' }
];

export const TEST_TYPE_OPTIONS = [
  { value: 'natureza', label: 'Natureza', icon: '🌱' },
  { value: 'sobrevivencia', label: 'Sobrevivência', icon: '🏕️' }
];

export const ADVANTAGE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'vantagem', label: 'Vantagem', icon: '✨' },
  { value: 'desvantagem', label: 'Desvantagem', icon: '⚠️' }
];
