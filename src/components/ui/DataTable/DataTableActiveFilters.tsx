import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Filter } from './types';

interface DataTableActiveFiltersProps {
  activeFilters: Record<string, string>;
  filters: Filter[];
  getFilterLabel: (key: string, value: string) => string;
  onRemoveFilter: (key: string) => void;
}

export const DataTableActiveFilters: React.FC<DataTableActiveFiltersProps> = ({
  activeFilters,
  filters,
  getFilterLabel,
  onRemoveFilter
}) => {
  const { t } = useTranslation();

  if (Object.keys(activeFilters).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/10">
      {Object.entries(activeFilters).map(([key, value]) => {
        if (!value) return null;
        const filterDef = filters.find((f) => f.key === key);
        return (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
          >
            <span className="opacity-70">{filterDef ? t(filterDef.label) : key}:</span>
            <span className="font-bold">{getFilterLabel(key, value)}</span>
            <button
              onClick={() => onRemoveFilter(key)}
              className="ml-1 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
