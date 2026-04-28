export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export class DataTableService {
  private static getNestedValue<T>(
    item: T,
    key: string
  ): string | number | boolean | object | null | undefined {
    return key.includes('.')
      ? (key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], item) as
          | string
          | number
          | boolean
          | object
          | null
          | undefined)
      : (item[key as keyof T] as string | number | boolean | object | null | undefined);
  }

  private static matchesSearch(
    value: string | number | boolean | object | null | undefined,
    searchTerm: string
  ): boolean {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    const val = String(value ?? '').toLowerCase();
    return val.includes(term);
  }

  private static matchesFilter(
    value: string | number | boolean | object | null | undefined,
    filterValue: string
  ): boolean {
    return String(value ?? '').toLowerCase() === filterValue.toLowerCase();
  }

  static filterData<T>(
    data: T[],
    searchTerm: string,
    searchKeys: string[] | undefined,
    activeFilters: Record<string, string>
  ): T[] {
    let filtered = data;

    if (searchTerm && searchKeys && searchKeys.length > 0) {
      filtered = filtered.filter((item) => {
        return searchKeys.some((key) => {
          const value = this.getNestedValue(item, key);
          return this.matchesSearch(value, searchTerm);
        });
      });
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = this.getNestedValue(item, key);
          return this.matchesFilter(itemValue, value);
        });
      }
    });

    return filtered;
  }

  static sortData<T>(data: T[], sortConfig: SortConfig<T> | null): T[] {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
  ): { paginatedData: T[]; totalPages: number; startIndex: number } {
    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedData, totalPages, startIndex };
  }

  static getSortDirection<T>(
    currentSort: SortConfig<T> | null,
    columnKey: keyof T
  ): 'asc' | 'desc' | null {
    if (currentSort?.key === columnKey) {
      return currentSort.direction === 'asc' ? 'desc' : null;
    }
    return 'asc';
  }
}
