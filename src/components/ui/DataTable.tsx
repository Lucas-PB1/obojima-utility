import React from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useTranslation } from '@/hooks/useTranslation';
import { Column, Filter } from './DataTable/types';
import { DataTableFilters } from './DataTable/DataTableFilters';
import { DataTableActiveFilters } from './DataTable/DataTableActiveFilters';
import { DataTableContent } from './DataTable/DataTableContent';
import { DataTablePagination } from './DataTable/DataTablePagination';

export type { Column, Filter };

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  className?: string;
}

export default function DataTable<T>({
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
    effectiveSearchPlaceholder,
    handleSort,
    handleFilterChange,
    removeFilter,
    getFilterLabel,
    clearFilters,
    setPage,
    setSearch
  } = useDataTable({
    data,
    searchKeys,
    itemsPerPage,
    filters,
    searchPlaceholder
  });

  return (
    <div
      className={`glass-panel rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-border/40 overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-border/20">
        <DataTableFilters
          searchKeys={searchKeys}
          searchTerm={searchTerm}
          onSearchChange={setSearch}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
          searchPlaceholder={effectiveSearchPlaceholder}
        />

        <DataTableActiveFilters
          activeFilters={activeFilters}
          filters={filters}
          getFilterLabel={getFilterLabel}
          onRemoveFilter={removeFilter}
        />

        <div className="mt-4 text-sm text-foreground/60">
          {t(
            'ui.datatable.showing',
            startIndex + 1,
            Math.min(startIndex + itemsPerPage, paginatedData.length),
            paginatedData.length
          )}
        </div>
      </div>

      <DataTableContent
        columns={columns}
        data={data}
        paginatedData={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
