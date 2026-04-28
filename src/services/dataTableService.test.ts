import { describe, expect, it } from 'vitest';
import { DataTableService } from './dataTableService';

const rows = [
  { name: 'Folha', rarity: 'comum', stats: { utility: 3 } },
  { name: 'Raiz', rarity: 'incomum', stats: { utility: 1 } },
  { name: 'Orvalho', rarity: 'comum', stats: { utility: 5 } }
];

describe('DataTableService', () => {
  it('filters nested values and active filters', () => {
    expect(DataTableService.filterData(rows, 'fol', ['name'], {})).toHaveLength(1);
    expect(DataTableService.filterData(rows, '', undefined, { rarity: 'comum' })).toHaveLength(2);
    expect(DataTableService.filterData(rows, '5', ['stats.utility'], {})).toHaveLength(1);
  });

  it('sorts and paginates safely', () => {
    const sorted = DataTableService.sortData(rows, { key: 'name', direction: 'desc' });
    expect(sorted[0].name).toBe('Raiz');

    expect(DataTableService.paginateData(rows, 10, 2)).toEqual({
      paginatedData: [rows[2]],
      totalPages: 2,
      startIndex: 2
    });
    expect(DataTableService.paginateData([], 1, 10).totalPages).toBe(1);
  });
});
