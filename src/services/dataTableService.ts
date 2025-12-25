export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export class DataTableService {
  private static getNestedValue<T>(item: T, key: string): unknown {
    return key.includes('.')
      ? key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], item)
      : item[key as keyof T];
  }

  private static matchesSearch(value: unknown, searchTerm: string): boolean {
    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
  }

  static filterData<T extends Record<string, unknown>>(
    data: T[],
    searchTerm: string,
    searchKey: string | undefined,
    activeFilters: Record<string, string>
  ): T[] {
    let filtered = data;

    if (searchTerm && searchKey) {
      filtered = filtered.filter((item) => {
        const value = this.getNestedValue(item, searchKey);
        return this.matchesSearch(value, searchTerm);
      });
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = this.getNestedValue(item, key);
          return this.matchesSearch(itemValue, value);
        });
      }
    });

    return filtered;
  }

  static sortData<T extends Record<string, unknown>>(
    data: T[],
    sortConfig: SortConfig<T> | null
  ): T[] {
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
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
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
