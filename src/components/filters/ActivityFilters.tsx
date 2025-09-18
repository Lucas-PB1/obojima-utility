import React from 'react';
import { useActivityFilters, ResultFilterType, DateFilterType } from '@/hooks/useFilters';
import { ForageAttempt } from '@/types/ingredients';
import FilterSection from '../ui/FilterSection';
import Select from '../ui/Select';
import Button from '../ui/Button';

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

  const resultOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'success', label: 'Sucessos' },
    { value: 'failure', label: 'Falhas' }
  ];

  const dateOptions = [
    { value: 'all', label: 'Todo o Período' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mês' }
  ];

  return (
    <FilterSection className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filter}
          onChange={(value) => setFilter(value as ResultFilterType)}
          options={resultOptions}
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
          options={dateOptions}
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
