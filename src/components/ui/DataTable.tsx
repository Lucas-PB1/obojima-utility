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
  onRowClick?: (item: T) => void;
  title?: string;
  icon?: string;
  mobileRenderer?: (item: T) => React.ReactNode;
  action?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  filters = [],
  searchKeys,
  searchPlaceholder,
  itemsPerPage = 10,
  className = '',
  onRowClick,
  title,
  icon,
  mobileRenderer,
  action
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
      className={`glass-panel rounded-3xl shadow-xl border border-white/60 overflow-hidden bg-white/80 backdrop-blur-xl ${className}`}
    >
      <div className="p-6 border-b border-totoro-blue/5">
        {title && (
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-totoro-blue rounded-full"></div>
              {icon && <span className="text-2xl">{icon}</span>}
              <h2 className="text-xl font-black text-totoro-gray tracking-tight">{title}</h2>
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
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
        onRowClick={onRowClick}
        mobileRenderer={mobileRenderer}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
