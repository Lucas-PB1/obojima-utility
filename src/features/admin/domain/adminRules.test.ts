import { describe, expect, it } from 'vitest';
import { UserProfile } from '@/types/auth';
import { buildAdminStats, clampAdminQuantity, getAdminUserStatus } from './adminRules';

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
