import { Filter } from '@/components/ui/DataTable';

export const STATUS_OPTIONS = [
  { value: 'false', label: 'constants.ingredients.status.available' },
  { value: 'true', label: 'constants.ingredients.status.used' }
];

export const INGREDIENT_COLLECTION_FILTERS: Filter[] = [
  {
    key: 'used',
    label: 'constants.ingredients.filters.status',
    type: 'select',
    options: STATUS_OPTIONS,
    placeholder: 'constants.ingredients.filters.placeholder.status'
  },
  {
    key: 'ingredient.combat',
    label: 'constants.ingredients.filters.combat',
    type: 'number',
    placeholder: 'constants.ingredients.filters.placeholder.values'
  },
  {
    key: 'ingredient.utility',
    label: 'constants.ingredients.filters.utility',
    type: 'number',
    placeholder: 'constants.ingredients.filters.placeholder.values'
  },
  {
    key: 'ingredient.whimsy',
    label: 'constants.ingredients.filters.whimsy',
    type: 'number',
    placeholder: 'constants.ingredients.filters.placeholder.values'
  }
];
