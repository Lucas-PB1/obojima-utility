import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useDataTable } from '@/hooks/useDataTable';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
}

export interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

import { useTranslation } from '@/hooks/useTranslation';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  filters = [],
  searchKeys,
  searchPlaceholder,
  itemsPerPage = 10,
  className = ''
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const {
    paginatedData,
    totalPages,
    currentPage,
    startIndex,
    searchTerm,
    sortConfig,
    activeFilters,
    handleSort,
    handleFilterChange,
    clearFilters,
    setPage,
    setSearch
  } = useDataTable({
    data,
    searchKeys,
    itemsPerPage
  });

  const effectiveSearchPlaceholder = searchPlaceholder || t('ui.datatable.searchPlaceholder');

  const removeFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  const getFilterLabel = (key: string, value: string) => {
    const filterDef = filters.find((f) => f.key === key);
    if (!filterDef) return value;
    
    if (filterDef.type === 'select' && filterDef.options) {
      const option = filterDef.options.find((opt) => opt.value === value);
      return option ? t(option.label) : value;
    }
    
    return value;
  };

  return (
    <div className={`glass-panel rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-border/40 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-border/20">
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
                  placeholder={effectiveSearchPlaceholder}
                  value={searchTerm}
                  onChange={(value) => setSearch(value as string)}
                />
              </div>
            </div>
          )}

          {filters.map((filter) => (
            <div 
              key={filter.key} 
              className={filter.type === 'number' ? "flex-1 min-w-[80px]" : "flex-1 min-w-[150px]"}
            >
              {filter.type === 'select' ? (
                <Select
                  label={t(filter.label)}
                  value={activeFilters[filter.key] || ''}
                  onChange={(value) => handleFilterChange(filter.key, value)}
                  options={
                    filter.options?.map((opt) => ({
                      ...opt,
                      label: t(opt.label)
                    })) || []
                  }
                  placeholder={
                    filter.placeholder ? t(filter.placeholder) : t(filter.label)
                  }
                />
              ) : (
                <Input
                  label={t(filter.label)}
                  type={filter.type === 'date' ? 'text' : filter.type}
                  placeholder={
                    filter.placeholder ? t(filter.placeholder) : t(filter.label)
                  }
                  value={activeFilters[filter.key] || ''}
                  onChange={(value) => handleFilterChange(filter.key, value as string)}
                />
              )}
            </div>
          ))}

          {(Object.keys(activeFilters).length > 0 || searchTerm) && (
            <div className="mb-[2px]">
              <Button onClick={clearFilters} variant="secondary" size="md">
                {t('ui.datatable.clear')}
              </Button>
            </div>
          )}
        </div>

        {Object.keys(activeFilters).length > 0 && (
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
                    onClick={() => removeFilter(key)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-sm text-foreground/60">
          {t(
            'ui.datatable.showing',
            startIndex + 1,
            Math.min(startIndex + itemsPerPage, paginatedData.length),
            paginatedData.length
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-4 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-primary/10' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label.startsWith('constants.') ? t(column.label) : column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span
                          className={`text-xs ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-totoro-green'
                              : 'text-totoro-gray/30'
                          }`}
                        >
                          ▲
                        </span>
                        <span
                          className={`text-xs ${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-totoro-green'
                              : 'text-totoro-gray/30'
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-muted/5 divide-y divide-border/10">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-foreground/60">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">📦</span>
                    <span>{t('ui.datatable.noItems')}</span>
                    <span className="text-xs">{t('ui.datatable.totalData', data.length)}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-muted/10 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-foreground/60">
              {t('ui.datatable.page', currentPage, totalPages)}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                {t('ui.datatable.previous')}
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => setPage(page)}
                    variant={currentPage === page ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                {t('ui.datatable.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
