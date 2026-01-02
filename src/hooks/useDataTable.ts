'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTableService, SortConfig } from '@/services/dataTableService';

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface UseDataTableProps<T> {
  data: T[];
  searchKeys?: string[];
  itemsPerPage?: number;
  filters?: Filter[];
  searchPlaceholder?: string;
}

export function useDataTable<T>({
  data,
  searchKeys,
  itemsPerPage = 10,
  filters = [],
  searchPlaceholder
}: UseDataTableProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const processedData = useMemo(() => {
    const filtered = DataTableService.filterData(data, searchTerm, searchKeys, activeFilters);
    const sorted = DataTableService.sortData(filtered, sortConfig);
    return DataTableService.paginateData(sorted, currentPage, itemsPerPage);
  }, [data, searchTerm, searchKeys, activeFilters, sortConfig, currentPage, itemsPerPage]);

  const handleSort = useCallback(
    (key: keyof T) => {
      const newDirection = DataTableService.getSortDirection(sortConfig, key);
      setSortConfig(newDirection ? { key, direction: newDirection } : null);
    },
    [sortConfig]
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const removeFilter = useCallback(
    (key: string) => {
      handleFilterChange(key, '');
    },
    [handleFilterChange]
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const getFilterLabel = useCallback(
    (key: string, value: string) => {
      const filterDef = filters.find((f) => f.key === key);
      if (!filterDef) return value;

      if (filterDef.type === 'select' && filterDef.options) {
        const option = filterDef.options.find((opt) => opt.value === value);
        return option ? t(option.label) : value;
      }

      return value;
    },
    [filters, t]
  );

  const effectiveSearchPlaceholder = useMemo(
    () => searchPlaceholder || t('ui.datatable.searchPlaceholder'),
    [searchPlaceholder, t]
  );

  return {
    paginatedData: processedData.paginatedData,
    filteredData: data,
    sortedData: data,
    totalPages: processedData.totalPages,
    currentPage,
    startIndex: processedData.startIndex,
    searchTerm,
    sortConfig,
    activeFilters,
    effectiveSearchPlaceholder,
    handleSort,
    handleFilterChange,
    removeFilter,
    getFilterLabel,
    clearFilters,
    setPage,
    setSearch
  };
}
