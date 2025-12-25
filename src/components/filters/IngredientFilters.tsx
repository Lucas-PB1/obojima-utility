import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useIngredientFilters } from '@/hooks/useFilters';
import FilterSection from '@/components/ui/FilterSection';
import { CollectedIngredient } from '@/types/ingredients';
import { FILTER_OPTIONS, RARITY_OPTIONS, SORT_OPTIONS } from '@/constants/filters/ingredients';

interface IngredientFiltersProps {
  ingredients: CollectedIngredient[];
  onFilteredIngredients: (ingredients: CollectedIngredient[]) => void;
}

export default function IngredientFilters({
  ingredients,
  onFilteredIngredients
}: IngredientFiltersProps) {
  const {
    filter,
    setFilter,
    rarityFilter,
    setRarityFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    filteredIngredients
  } = useIngredientFilters(ingredients);

  React.useEffect(() => {
    onFilteredIngredients(filteredIngredients);
  }, [filteredIngredients, onFilteredIngredients]);

  return (
    <FilterSection className="mb-8">
      <div className="space-y-4">
        <div className="flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(value) => setSearchTerm(String(value))}
            placeholder="🔍 Buscar ingredientes..."
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value as 'all' | 'available' | 'used')}
                variant={filter === option.value ? 'primary' : 'secondary'}
                size="sm"
                effect={filter === option.value ? 'pulse-glow' : 'shimmer'}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Select
              value={rarityFilter}
              onChange={(value) =>
                setRarityFilter(value as 'all' | 'comum' | 'incomum' | 'raro' | 'unico')
              }
              options={RARITY_OPTIONS}
              className="w-auto"
            />

            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'date' | 'name' | 'rarity')}
              options={SORT_OPTIONS}
              className="w-auto"
            />
          </div>
        </div>
      </div>
    </FilterSection>
  );
}
