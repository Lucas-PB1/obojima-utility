import { useState, useMemo, useCallback } from 'react';
import { DataTableService, SortConfig } from '@/services/dataTableService';

/**
 * Props para o hook useDataTable
 */
interface UseDataTableProps<T> {
  data: T[];
  searchKey?: string;
  itemsPerPage?: number;
}

/**
 * Hook para gerenciar funcionalidades de tabela de dados
 * 
 * @description
 * Este hook encapsula toda a lógica de tabelas de dados, incluindo:
 * - Paginação de dados
 * - Busca e filtros
 * - Ordenação por colunas
 * - Gerenciamento de estado da tabela
 * 
 * @param data - Array de dados a ser exibido na tabela
 * @param searchKey - Chave para busca nos dados (opcional)
 * @param itemsPerPage - Número de itens por página (padrão: 10)
 */
export function useDataTable<T extends Record<string, unknown>>({
  data,
  searchKey,
  itemsPerPage = 10
}: UseDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const processedData = useMemo(() => {
    const filtered = DataTableService.filterData(data, searchTerm, searchKey, activeFilters);
    const sorted = DataTableService.sortData(filtered, sortConfig);
    return DataTableService.paginateData(sorted, currentPage, itemsPerPage);
  }, [data, searchTerm, searchKey, activeFilters, sortConfig, currentPage, itemsPerPage]);

  /**
   * Manipula a ordenação de uma coluna
   * 
   * @param key - Chave da coluna a ser ordenada
   */
  const handleSort = useCallback((key: keyof T) => {
    const newDirection = DataTableService.getSortDirection(sortConfig, key);
    setSortConfig(newDirection ? { key, direction: newDirection } : null);
  }, [sortConfig]);

  /**
   * Manipula mudanças em filtros
   * 
   * @param key - Chave do filtro
   * @param value - Valor do filtro
   */
  const handleFilterChange = useCallback((key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  /**
   * Limpa todos os filtros e busca aplicados
   */
  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  /**
   * Define a página atual
   * 
   * @param page - Número da página
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Define o termo de busca
   * 
   * @param term - Termo de busca
   */
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
    setSearch,
  };
}
