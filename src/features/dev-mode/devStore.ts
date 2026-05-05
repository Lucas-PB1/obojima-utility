import { isFirebaseConfigured } from '@/config/firebase';
import { createDevSeed, DEV_ADMIN_UID, DEV_STATE_VERSION } from './devSeed';
import { DevState } from './types';

const STORAGE_KEY = 'obojima:dev-mode:v1';

type Listener = (state: DevState) => void;
const listeners = new Set<Listener>();
let memoryState: DevState | null = null;

export function isDevMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
    process.env.NEXT_PUBLIC_E2E_MODE === 'true' ||
    !isFirebaseConfigured
  );
}

export function isDevPersistenceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE_PERSIST !== 'false';
}

function reviveDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveDates);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      if (
        typeof item === 'string' &&
        /(?:At|Seen|timestamp)$/.test(key) &&
        !Number.isNaN(Date.parse(item))
      ) {
        return [key, new Date(item)];
      }
      return [key, reviveDates(item)];
    })
  );
}

function cloneState(state: DevState): DevState {
  return reviveDates(JSON.parse(JSON.stringify(state))) as DevState;
}

function readStoredState(): DevState | null {
  if (typeof window === 'undefined' || !isDevPersistenceEnabled()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = reviveDates(JSON.parse(raw)) as DevState;
    return parsed.version === DEV_STATE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredState(state: DevState): void {
  if (typeof window === 'undefined' || !isDevPersistenceEnabled()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDevState(): DevState {
  if (!memoryState) {
    memoryState = readStoredState() || createDevSeed();
    writeStoredState(memoryState);
  }
  return cloneState(memoryState);
}

export function setDevState(updater: (state: DevState) => DevState): DevState {
  const next = updater(getDevState());
  memoryState = cloneState(next);
  writeStoredState(memoryState);
  listeners.forEach((listener) => listener(cloneState(memoryState as DevState)));
  return getDevState();
}

export function subscribeDevState(listener: Listener): () => void {
  listeners.add(listener);
  listener(getDevState());
  return () => listeners.delete(listener);
}

export function resetDevData(): DevState {
  memoryState = createDevSeed();
  writeStoredState(memoryState);
  listeners.forEach((listener) => listener(cloneState(memoryState as DevState)));
  return getDevState();
}

export function getDevUserId(uid?: string): string {
  return uid || getDevState().activeUserId || DEV_ADMIN_UID;
}

export function createDevId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
