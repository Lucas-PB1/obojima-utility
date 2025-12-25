import { Filter } from '@/components/ui/DataTable';

export const ATTRIBUTE_NUMERIC_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' }
];

export const STATUS_OPTIONS = [
  { value: 'false', label: 'Disponível' },
  { value: 'true', label: 'Usado' }
];

export const INGREDIENT_COLLECTION_FILTERS: Filter[] = [
  {
    key: 'used',
    label: 'Status',
    type: 'select',
    options: STATUS_OPTIONS,
    placeholder: 'Todos os status'
  },
  {
    key: 'ingredient.combat',
    label: 'Combat',
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'Todos os valores'
  },
  {
    key: 'ingredient.utility',
    label: 'Utility',
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'Todos os valores'
  },
  {
    key: 'ingredient.whimsy',
    label: 'Whimsy',
    type: 'select',
    options: ATTRIBUTE_NUMERIC_OPTIONS,
    placeholder: 'Todos os valores'
  }
];
