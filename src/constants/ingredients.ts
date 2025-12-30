import { Filter } from '@/components/ui/DataTable';

export const ATTRIBUTE_NUMERIC_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' }
];

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
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'constants.ingredients.filters.placeholder.values'
  },
  {
    key: 'ingredient.utility',
    label: 'constants.ingredients.filters.utility',
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'constants.ingredients.filters.placeholder.values'
  },
  {
    key: 'ingredient.whimsy',
    label: 'constants.ingredients.filters.whimsy',
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'constants.ingredients.filters.placeholder.values'
  }
];
