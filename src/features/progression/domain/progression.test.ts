import { describe, expect, it } from 'vitest';
import {
  buildProgression,
  calculateStreaks,
  getLevelInfo,
  normalizeRarity,
  xpForLevel
} from './progression';

const day = (offset: number, hour = 12) => {
  const date = new Date(2026, 10, 5, hour);
  date.setDate(date.getDate() + offset);
  return date;
};

describe('progression rules', () => {
  it('normalizes rarities in every supported language', () => {
    expect(normalizeRarity('Comum')).toBe('common');
    expect(normalizeRarity('incomum')).toBe('uncommon');
    expect(normalizeRarity('Uncommon')).toBe('uncommon');
    expect(normalizeRarity('Poco común')).toBe('uncommon');
    expect(normalizeRarity('raro')).toBe('rare');
    expect(normalizeRarity('Rare')).toBe('rare');
    expect(normalizeRarity('unico')).toBe('unique');
    expect(normalizeRarity(undefined)).toBe('common');
  });

  it('computes level boundaries from total XP', () => {
    expect(getLevelInfo(0)).toMatchObject({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 });
    expect(getLevelInfo(99).level).toBe(1);
    expect(getLevelInfo(100)).toMatchObject({ level: 2, xpIntoLevel: 0 });
    expect(getLevelInfo(100 + xpForLevel(2))).toMatchObject({ level: 3, xpIntoLevel: 0 });
    expect(getLevelInfo(-50).level).toBe(1);
  });

  it('counts the current streak ending today or yesterday', () => {
    const now = day(0);
    expect(calculateStreaks([day(-2), day(-1), day(0)], now)).toEqual({ current: 3, best: 3 });
    expect(calculateStreaks([day(-2), day(-1)], now)).toEqual({ current: 2, best: 2 });
    expect(calculateStreaks([day(-5), day(-4), day(-3), day(-1, 8)], now)).toEqual({
      current: 1,
      best: 3
    });
    expect(calculateStreaks([day(-3)], now)).toEqual({ current: 0, best: 1 });
    expect(calculateStreaks([], now)).toEqual({ current: 0, best: 0 });
  });

  it('builds stats, achievements and daily quests from player data', () => {
    const now = day(0);
    const snapshot = buildProgression({
      now,
      attempts: [
        { timestamp: day(0, 9), success: true, found: true, rarity: 'comum' },
        { timestamp: day(0, 10), success: true, found: true, rarity: 'raro' },
        { timestamp: day(-1), success: false }
      ],
      potions: [{ quantity: 2, createdAt: day(0) }],
      recipes: [
        { id: 'a', createdAt: day(0) },
        { id: 'a', createdAt: day(0) }
      ],
      friendsCount: 1,
      messagesSentToday: 0
    });

    expect(snapshot.stats).toMatchObject({
      forageAttempts: 3,
      forageSuccesses: 2,
      ingredientsCollected: 2,
      rareCollected: 1,
      potionsBrewed: 2,
      recipesDiscovered: 1,
      friends: 1,
      streakDays: 2
    });

    const unlocked = snapshot.achievements.filter((a) => a.unlocked).map((a) => a.id);
    expect(unlocked).toEqual(
      expect.arrayContaining(['first-steps', 'rare-find', 'first-brew', 'new-friend'])
    );
    expect(unlocked).not.toContain('hoarder');

    const quests = Object.fromEntries(snapshot.dailyQuests.map((q) => [q.id, q]));
    expect(quests.forage).toMatchObject({ current: 2, completed: false });
    expect(quests.collect).toMatchObject({ current: 2, completed: true });
    expect(quests.brew.completed).toBe(true);
    expect(quests.social.completed).toBe(false);

    // 3*5 + 2*10 + (10+60) + 2*30 + 50 + 25 = 240 base, + 25 + 150 + 50 + 50 achievements
    expect(snapshot.level.totalXp).toBe(515);
    expect(snapshot.level.level).toBe(4);
  });

  it('does not let daily quests change permanent XP', () => {
    const base = {
      attempts: [{ timestamp: day(0), success: true, found: true, rarity: 'comum' }],
      potions: [],
      recipes: [],
      friendsCount: 0
    };
    const today = buildProgression({ ...base, now: day(0) });
    const nextWeek = buildProgression({ ...base, now: day(7) });
    expect(today.level.totalXp).toBe(nextWeek.level.totalXp);
  });
});
