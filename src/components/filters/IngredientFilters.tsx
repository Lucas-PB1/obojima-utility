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

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponíveis' },
    { value: 'used', label: 'Usados' }
  ];

  const rarityOptions = [
    { value: 'all', label: 'Todas as Raridades' },
    { value: 'comum', label: '🟢 Comum' },
    { value: 'incomum', label: '🔵 Incomum' },
    { value: 'raro', label: '🟣 Raro' },
    { value: 'unico', label: '🟡 Único' }
  ];

  const sortOptions = [
    { value: 'date', label: '📅 Data' },
    { value: 'name', label: '🔤 Nome' },
    { value: 'rarity', label: '⭐ Raridade' }
  ];

  return (
    <FilterSection className="mb-8">
      <div className="space-y-4">
        {/* Primeira linha: Busca */}
        <div className="flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(value) => setSearchTerm(String(value))}
            placeholder="🔍 Buscar ingredientes..."
            className="w-full"
          />
        </div>

        {/* Segunda linha: Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
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
              onChange={(value) => setRarityFilter(value as 'all' | 'comum' | 'incomum' | 'raro' | 'unico')}
              options={rarityOptions}
              className="w-auto"
            />
            
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'date' | 'name' | 'rarity')}
              options={sortOptions}
              className="w-auto"
            />
          </div>
        </div>
      </div>
    </FilterSection>
  );
}
