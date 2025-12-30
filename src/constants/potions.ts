export const POTION_FILTER_OPTIONS = [
  { value: 'all', label: 'potions.filter.all' },
  { value: 'available', label: 'potions.filter.available' },
  { value: 'used', label: 'potions.filter.used' }
] as const;

export type PotionFilterType = (typeof POTION_FILTER_OPTIONS)[number]['value'];

export const POTION_CATEGORY_CONFIG = {
  combat: {
    label: 'potions.category.combat.label',
    classes: 'text-red-600 bg-red-50 border-red-200'
  },
  utility: {
    label: 'potions.category.utility.label',
    classes: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  whimsy: {
    label: 'potions.category.whimsy.label',
    classes: 'text-purple-600 bg-purple-50 border-purple-200'
  }
} as const;

export type PotionCategory = keyof typeof POTION_CATEGORY_CONFIG;

export const RECIPE_FILTER_OPTIONS = [
  { value: 'all', label: 'potions.filter.all' },
  { value: 'combat', label: 'potions.filter.combat' },
  { value: 'utility', label: 'potions.filter.utility' },
  { value: 'whimsy', label: 'potions.filter.whimsy' }
] as const;

export type RecipeFilterType = (typeof RECIPE_FILTER_OPTIONS)[number]['value'];
