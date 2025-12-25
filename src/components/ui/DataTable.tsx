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
  type: 'select' | 'text' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  searchKey?: string;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  filters = [],
  searchKey,
  searchPlaceholder = 'Buscar...',
  itemsPerPage = 10,
  className = ''
}: DataTableProps<T>) {
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
    searchKey,
    itemsPerPage
  });

  return (
    <div className={`glass-panel rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-border/40 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-border/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {searchKey && (
            <div className="flex-1">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(value) => setSearch(value as string)}
              />
            </div>
          )}

          {filters.map((filter) => (
            <div key={filter.key} className="min-w-48">
              {filter.type === 'select' ? (
                <Select
                  value={activeFilters[filter.key] || ''}
                  onChange={(value) => handleFilterChange(filter.key, value)}
                  options={filter.options || []}
                  placeholder={filter.placeholder || `Todos os ${filter.label}`}
                />
              ) : (
                <Input
                  type={filter.type === 'date' ? 'text' : filter.type}
                  placeholder={filter.placeholder || filter.label}
                  value={activeFilters[filter.key] || ''}
                  onChange={(value) => handleFilterChange(filter.key, value as string)}
                />
              )}
            </div>
          ))}

          {(Object.keys(activeFilters).length > 0 || searchTerm) && (
            <Button onClick={clearFilters} variant="secondary" size="md">
              Limpar
            </Button>
          )}
        </div>

        <div className="mt-4 text-sm text-foreground/60">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, paginatedData.length)} de{' '}
          {paginatedData.length} resultados
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
                    <span>{column.label}</span>
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
                    <span>Nenhum item encontrado</span>
                    <span className="text-xs">Total de dados: {data.length}</span>
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
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                Anterior
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
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
