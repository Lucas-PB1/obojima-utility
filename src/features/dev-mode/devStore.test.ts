import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDevState, resetDevData, setDevState, subscribeDevState } from './devStore';
import { DEV_STATE_VERSION } from './devSeed';

describe('devStore', () => {
  beforeEach(() => {
    const localStorageMock = {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] || null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      }
    };
    vi.stubGlobal('localStorage', {
      getItem: localStorageMock.getItem.bind(localStorageMock),
      setItem: localStorageMock.setItem.bind(localStorageMock),
      removeItem: localStorageMock.removeItem.bind(localStorageMock)
    });
    resetDevData();
  });

  it('returns seeded data with version', () => {
    const state = getDevState();
    expect(state.version).toBe(DEV_STATE_VERSION);
    expect(state.users.length).toBeGreaterThan(1);
    expect(state.ingredientsByUser[state.activeUserId]).toHaveLength(3);
  });

  it('updates state immutably and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDevState(listener);

    setDevState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.uid === state.activeUserId ? { ...user, displayName: 'Changed' } : user
      )
    }));

    expect(
      getDevState().users.find((user) => user.uid === getDevState().activeUserId)?.displayName
    ).toBe('Changed');
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('resets back to seed', () => {
    setDevState((state) => ({ ...state, users: [] }));
    expect(getDevState().users).toHaveLength(0);
    expect(resetDevData().users.length).toBeGreaterThan(1);
  });
});
