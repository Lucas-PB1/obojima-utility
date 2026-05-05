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

  it('sorts nested values and date strings', () => {
    const datedRows = [
      { profile: { name: 'Beta' }, createdAt: '2024-01-01T00:00:00.000Z' },
      { profile: { name: 'Alpha' }, createdAt: '2025-01-01T00:00:00.000Z' }
    ];

    expect(
      DataTableService.sortData(datedRows, { key: 'profile.name' as never, direction: 'asc' })[0]
        .profile.name
    ).toBe('Alpha');
    expect(
      DataTableService.sortData(datedRows, { key: 'createdAt', direction: 'desc' })[0].createdAt
    ).toBe('2025-01-01T00:00:00.000Z');
  });
});
