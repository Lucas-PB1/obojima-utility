import React from 'react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ForageAttempt } from '@/types/ingredients';
import FilterSection from '@/components/ui/FilterSection';
import { RESULT_OPTIONS, DATE_OPTIONS } from '@/constants/filters/activity';
import { useActivityFilters, ResultFilterType, DateFilterType } from '@/hooks/useFilters';

interface ActivityFiltersProps {
  attempts: ForageAttempt[];
  onFilteredAttempts: (attempts: ForageAttempt[]) => void;
}

export default function ActivityFilters({ attempts, onFilteredAttempts }: ActivityFiltersProps) {
  const {
    filter,
    setFilter,
    regionFilter,
    setRegionFilter,
    dateFilter,
    setDateFilter,
    filteredAttempts,
    getRegionOptions,
    clearFilters
  } = useActivityFilters(attempts);

  React.useEffect(() => {
    onFilteredAttempts(filteredAttempts);
  }, [filteredAttempts, onFilteredAttempts]);



  return (
    <FilterSection className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filter}
          onChange={(value) => setFilter(value as ResultFilterType)}
          options={RESULT_OPTIONS}
          label="Resultado"
        />

        <Select
          value={regionFilter}
          onChange={setRegionFilter}
          options={getRegionOptions()}
          label="Região"
        />

        <Select
          value={dateFilter}
          onChange={(value) => setDateFilter(value as DateFilterType)}
          options={DATE_OPTIONS}
          label="Período"
        />

        <div className="flex items-end">
          <Button
            onClick={clearFilters}
            variant="secondary"
            fullWidth
          >
            Limpar Filtros
          </Button>
        </div>
      </div>
    </FilterSection>
  );
}
