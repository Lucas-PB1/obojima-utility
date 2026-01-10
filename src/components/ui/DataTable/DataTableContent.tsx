import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Column, SortConfig } from './types';

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
        <div className="md:hidden flex flex-col divide-y divide-totoro-blue/5">
          {paginatedData.map((item, index) => (
            <div key={index}>{mobileRenderer(item)}</div>
          ))}
          {paginatedData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-foreground/60">
              <span className="text-2xl mb-2">📦</span>
              <span>{t('ui.datatable.noItems')}</span>
            </div>
          )}
        </div>
      )}

      {/* Desktop View */}
      <table className={`w-full ${mobileRenderer ? 'hidden md:table' : ''}`}>
        <thead className="bg-muted/20">
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
              <tr
                key={index}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-muted/10' : 'hover:bg-muted/5'}`}
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
