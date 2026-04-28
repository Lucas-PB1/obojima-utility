import { describe, expect, it } from 'vitest';
import {
  buildSocialNotificationCopy,
  getBlockId,
  getChatId,
  getFriendRequestId,
  getFriendshipId,
  getSortedPair,
  hasSocialBlock,
  normalizeSocialMessage,
  validateSocialMessage
} from './socialRules';

describe('social rules helpers', () => {
  it('builds deterministic pair ids regardless of order', () => {
    expect(getSortedPair('z-user', 'a-user')).toEqual(['a-user', 'z-user']);
    expect(getFriendshipId('z-user', 'a-user')).toBe('a-user_z-user');
    expect(getChatId('a-user', 'z-user')).toBe('a-user_z-user');
  });

  it('keeps directional ids for requests and blocks', () => {
    expect(getFriendRequestId('alice', 'bob')).toBe('alice_bob');
    expect(getBlockId('alice', 'bob')).toBe('alice_bob');
    expect(getBlockId('bob', 'alice')).toBe('bob_alice');
  });

  it('normalizes and validates messages', () => {
    expect(normalizeSocialMessage('  hello   social  ')).toBe('hello social');
    expect(validateSocialMessage('')).toBe('Message cannot be empty');
    expect(validateSocialMessage('ok')).toBeNull();
    expect(validateSocialMessage('x'.repeat(2001))).toContain('2000');
  });

  it('detects blocks in either direction', () => {
    expect(hasSocialBlock(['alice_bob'], 'alice', 'bob')).toBe(true);
    expect(hasSocialBlock(['alice_bob'], 'bob', 'alice')).toBe(true);
    expect(hasSocialBlock([], 'alice', 'bob')).toBe(false);
  });

  it('builds notification copy by type', () => {
    expect(buildSocialNotificationCopy('friend_request', 'Alice').title).toContain('amizade');
    expect(buildSocialNotificationCopy('message', 'Alice', 'Oi').body).toBe('Oi');
    expect(buildSocialNotificationCopy('trade', 'Alice').body).toContain('Alice');
  });
});
