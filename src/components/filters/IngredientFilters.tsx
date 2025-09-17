import React from 'react';
import { useIngredientFilters } from '@/hooks/useFilters';
import { CollectedIngredient } from '@/types/ingredients';
import FilterSection from '../ui/FilterSection';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface IngredientFiltersProps {
  ingredients: CollectedIngredient[];
  onFilteredIngredients: (ingredients: CollectedIngredient[]) => void;
}

export default function IngredientFilters({ ingredients, onFilteredIngredients }: IngredientFiltersProps) {
  const {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    filteredIngredients,
    clearFilters
  } = useIngredientFilters(ingredients);

  React.useEffect(() => {
    onFilteredIngredients(filteredIngredients);
  }, [filteredIngredients, onFilteredIngredients]);

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponíveis' },
    { value: 'used', label: 'Usados' }
  ];

  const sortOptions = [
    { value: 'date', label: '📅 Data' },
    { value: 'name', label: '🔤 Nome' },
    { value: 'rarity', label: '⭐ Raridade' }
  ];

  return (
    <FilterSection className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="🔍 Buscar ingredientes..."
            className="w-full"
          />
        </div>

        {/* Filter */}
        <div className="flex space-x-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              variant={filter === option.value ? 'primary' : 'secondary'}
              size="sm"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Sort */}
        <Select
          value={sortBy}
          onChange={setSortBy}
          options={sortOptions}
          className="w-auto"
        />
      </div>
    </FilterSection>
  );
}
