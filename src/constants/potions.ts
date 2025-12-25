export const POTION_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'used', label: 'Usadas' }
] as const;

export type PotionFilterType = (typeof POTION_FILTER_OPTIONS)[number]['value'];

export const POTION_CATEGORY_CONFIG = {
  combat: {
    label: 'Combate',
    classes: 'text-red-600 bg-red-50 border-red-200'
  },
  utility: {
    label: 'Utilidade',
    classes: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  whimsy: {
    label: 'Caprichoso',
    classes: 'text-purple-600 bg-purple-50 border-purple-200'
  }
} as const;

export type PotionCategory = keyof typeof POTION_CATEGORY_CONFIG;

export const RECIPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'combat', label: 'Combate' },
  { value: 'utility', label: 'Utilidade' },
  { value: 'whimsy', label: 'Caprichoso' }
] as const;

export type RecipeFilterType = (typeof RECIPE_FILTER_OPTIONS)[number]['value'];
