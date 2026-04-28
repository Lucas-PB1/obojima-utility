import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Column, SortConfig } from './types';
import { ChevronDown, ChevronUp, PackageSearch } from 'lucide-react';

interface DataTableContentProps<T> {
  columns: Column<T>[];
  data: T[];
  paginatedData: T[];
  sortConfig: SortConfig<T> | null;
  onSort: (key: keyof T) => void;
  startIndex: number;
  itemsPerPage: number;
  onRowClick?: (item: T) => void;
  mobileRenderer?: (item: T) => React.ReactNode;
}

export function DataTableContent<T>({
  columns,
  data,
  paginatedData,
  sortConfig,
  onSort,
  onRowClick,
  mobileRenderer
}: DataTableContentProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      {/* Mobile View */}
      {mobileRenderer && (
        <div className="md:hidden flex flex-col">
          {paginatedData.map((item, index) => (
            <div key={index} className={index > 0 ? 'subtle-divider-top' : ''}>
              {mobileRenderer(item)}
            </div>
          ))}
          {paginatedData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-foreground/60">
              <PackageSearch className="mb-2 h-7 w-7" />
              <span>{t('ui.datatable.noItems')}</span>
            </div>
          )}
        </div>
      )}

      {/* Desktop View */}
      <table className={`w-full ${mobileRenderer ? 'hidden md:table' : ''}`}>
        <thead className="bg-muted/20 shadow-[inset_0_-1px_0_var(--hairline)]">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-4 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-primary/10' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>
                    {column.label.startsWith('constants.') ? t(column.label) : column.label}
                  </span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <span
                        className={`${
                          sortConfig?.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-totoro-green'
                            : 'text-totoro-gray/30'
                        }`}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </span>
                      <span
                        className={`${
                          sortConfig?.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-totoro-green'
                            : 'text-totoro-gray/30'
                        }`}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-muted/5">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-foreground/60">
                <div className="flex flex-col items-center space-y-2">
                  <PackageSearch className="h-7 w-7" />
                  <span>{t('ui.datatable.noItems')}</span>
                  <span className="text-xs">{t('ui.datatable.totalData', data.length)}</span>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((item, index) => (
              <tr
                key={index}
                className={`transition-colors shadow-[inset_0_-1px_0_var(--hairline)] last:shadow-none ${onRowClick ? 'cursor-pointer hover:bg-muted/10' : 'hover:bg-muted/5'}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
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
  );
}
