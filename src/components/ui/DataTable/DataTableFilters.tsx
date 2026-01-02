import React from 'react';
import { Input, Select, Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Filter } from './types';

interface DataTableFiltersProps {
  searchKeys?: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Filter[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({
  searchKeys,
  searchTerm,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClear,
  searchPlaceholder
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      {searchKeys && searchKeys.length > 0 && (
        <div className="w-full sm:w-[400px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 bottom-0 top-auto h-[48px]">
            <span className="text-foreground/40">🔍</span>
          </div>
          <div className="[&_input]:pl-10">
            <Input
              label={t('ui.datatable.search')}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(value) => onSearchChange(value as string)}
            />
          </div>
        </div>
      )}

      {filters.map((filter) => (
        <div
          key={filter.key}
          className={filter.type === 'number' ? 'flex-1 min-w-[80px]' : 'flex-1 min-w-[150px]'}
        >
          {filter.type === 'select' ? (
            <Select
              label={t(filter.label)}
              value={activeFilters[filter.key] || ''}
              onChange={(value) => onFilterChange(filter.key, value)}
              options={
                filter.options?.map((opt) => ({
                  ...opt,
                  label: t(opt.label)
                })) || []
              }
              placeholder={filter.placeholder ? t(filter.placeholder) : t(filter.label)}
            />
          ) : (
            <Input
              label={t(filter.label)}
              type={filter.type === 'date' ? 'text' : filter.type}
              placeholder={filter.placeholder ? t(filter.placeholder) : t(filter.label)}
              value={activeFilters[filter.key] || ''}
              onChange={(value) => onFilterChange(filter.key, value as string)}
            />
          )}
        </div>
      ))}

      {(Object.keys(activeFilters).length > 0 || searchTerm) && (
        <div className="mb-[2px]">
          <Button onClick={onClear} variant="secondary" size="md">
            {t('ui.datatable.clear')}
          </Button>
        </div>
      )}
    </div>
  );
};
