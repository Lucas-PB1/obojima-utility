import { describe, expect, it } from 'vitest';
import { UserProfile } from '@/types/auth';
import {
  buildAdminStats,
  buildUsersCsv,
  clampAdminQuantity,
  getAdminUserStatus,
  getSelfActionBlock,
  toCsvCell,
  validateGrantPayload
} from './adminRules';

const users: UserProfile[] = [
  {
    uid: 'admin',
    email: 'admin@test.dev',
    displayName: 'Admin',
    photoURL: null,
    role: 'admin',
    isAuthActive: true,
    disabled: false
  },
  {
    uid: 'disabled',
    email: 'disabled@test.dev',
    displayName: 'Disabled',
    photoURL: null,
    role: 'user',
    isAuthActive: true,
    disabled: true
  },
  {
    uid: 'orphan',
    email: 'orphan@test.dev',
    displayName: 'Orphan',
    photoURL: null,
    role: 'user',
    isAuthActive: false,
    disabled: false
  }
];

describe('adminRules', () => {
  it('normalizes account status consistently', () => {
    expect(getAdminUserStatus(users[0])).toBe('active');
    expect(getAdminUserStatus(users[1])).toBe('disabled');
    expect(getAdminUserStatus(users[2])).toBe('orphaned');
  });

  it('builds dashboard stats', () => {
    expect(buildAdminStats(users)).toMatchObject({
      totalUsers: 3,
      admins: 1,
      active: 1,
      disabled: 1,
      orphaned: 1
    });
  });

  it('clamps unsafe quantities', () => {
    expect(clampAdminQuantity('4')).toBe(4);
    expect(clampAdminQuantity(0)).toBe(1);
    expect(clampAdminQuantity(-10)).toBe(1);
    expect(clampAdminQuantity(Number.NaN, 2)).toBe(2);
  });
});

describe('admin safety rules', () => {
  it('blocks self-demotion, self-disable and self-delete only for the acting admin', () => {
    expect(getSelfActionBlock('a', 'a', { role: 'user' })).toMatch(/admin/);
    expect(getSelfActionBlock('a', 'a', { disabled: true })).toMatch(/desativar/);
    expect(getSelfActionBlock('a', 'a', { delete: true })).toMatch(/excluir/);
    expect(getSelfActionBlock('a', 'a', { role: 'admin', disabled: false })).toBeNull();
    expect(getSelfActionBlock('a', 'b', { role: 'user', disabled: true, delete: true })).toBeNull();
  });

  it('validates grant payloads', () => {
    const ingredient = { id: 1, nome: 'Folha' };
    expect(validateGrantPayload({ type: 'ingredient', item: ingredient, quantity: 2 })).toBeNull();
    expect(validateGrantPayload({ type: 'ingredient', item: ingredient, quantity: 0 })).toMatch(
      /Quantidade/
    );
    expect(validateGrantPayload({ type: 'ingredient', item: ingredient, quantity: 1.5 })).toMatch(
      /Quantidade/
    );
    expect(
      validateGrantPayload({ type: 'potion', item: ingredient, quantity: 1, category: 'combat' })
    ).toBeNull();
    expect(validateGrantPayload({ type: 'potion', item: ingredient, quantity: 1 })).toMatch(
      /Categoria/
    );
    expect(validateGrantPayload({ type: 'ingredient', quantity: 1 })).toMatch(/catálogo/);
  });

  it('counts open reports from an explicit total', () => {
    expect(buildAdminStats(users, undefined, 4).openReports).toBe(4);
  });

  it('exports users as safe CSV', () => {
    expect(toCsvCell('a,b')).toBe('"a,b"');
    expect(toCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(toCsvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(toCsvCell(null)).toBe('');
    const csv = buildUsersCsv(users).split('\n');
    expect(csv[0]).toBe('uid,nome,email,funcao,status,criado_em,ultimo_login');
    expect(csv).toHaveLength(users.length + 1);
  });
});
