import { useState, useMemo, useCallback } from 'react';
import { DataTableService, SortConfig } from '@/services/dataTableService';

interface UseDataTableProps<T> {
  data: T[];
  searchKey?: string;
  itemsPerPage?: number;
}

export function useDataTable<T extends Record<string, unknown>>({
  data,
  searchKey,
  itemsPerPage = 10
}: UseDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const processedData = useMemo(() => {
    const filtered = DataTableService.filterData(data, searchTerm, searchKey, activeFilters);
    const sorted = DataTableService.sortData(filtered, sortConfig);
    return DataTableService.paginateData(sorted, currentPage, itemsPerPage);
  }, [data, searchTerm, searchKey, activeFilters, sortConfig, currentPage, itemsPerPage]);

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
    handleSort,
    handleFilterChange,
    clearFilters,
    setPage,
    setSearch
  };
}
