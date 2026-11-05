/**
 * Player progression rules.
 *
 * Everything here is derived from data the player already has (forage history,
 * brewed potions, discovered recipes and friends), so the system needs no extra
 * persistence and stays consistent across devices. Collection stats come from the
 * forage history rather than the inventory, so trading items away never costs XP.
 * Daily quests are goals only: they add no permanent XP, otherwise the level would
 * drop when the day rolls over.
 */

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'unique';

export interface ProgressionInput {
  /** Forage history. A successful attempt with `found` set yielded an ingredient of `rarity`. */
  attempts: Array<{ timestamp: Date; success: boolean; found?: boolean; rarity?: string | null }>;
  potions: Array<{ quantity: number; createdAt: Date }>;
  recipes: Array<{ id: string; createdAt: Date }>;
  friendsCount: number;
  messagesSentToday?: number;
  now?: Date;
}

export interface ProgressionStats {
  forageAttempts: number;
  forageSuccesses: number;
  ingredientsCollected: number;
  uncommonCollected: number;
  rareCollected: number;
  potionsBrewed: number;
  recipesDiscovered: number;
  friends: number;
  streakDays: number;
  bestStreakDays: number;
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
  titleKey: string;
}

export type AchievementCategory = 'forage' | 'collection' | 'alchemy' | 'social' | 'dedication';

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  stat: keyof ProgressionStats;
  target: number;
  xpReward: number;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  unlocked: boolean;
  progress: number;
}

export interface DailyQuest {
  id: 'forage' | 'collect' | 'brew' | 'social';
  current: number;
  target: number;
  completed: boolean;
}

export interface ProgressionSnapshot {
  stats: ProgressionStats;
  level: LevelInfo;
  achievements: AchievementProgress[];
  unlockedAchievements: number;
  dailyQuests: DailyQuest[];
  completedDailyQuests: number;
}

export const XP_REWARDS = {
  forageAttempt: 5,
  forageSuccess: 10,
  ingredient: { common: 10, uncommon: 25, rare: 60, unique: 120 } as Record<RarityTier, number>,
  potion: 30,
  recipe: 50,
  friend: 25
} as const;

export const LEVEL_TITLES = [
  { minLevel: 1, key: 'progression.title.sprout' },
  { minLevel: 3, key: 'progression.title.wanderer' },
  { minLevel: 6, key: 'progression.title.forager' },
  { minLevel: 10, key: 'progression.title.alchemist' },
  { minLevel: 15, key: 'progression.title.spiritfriend' },
  { minLevel: 20, key: 'progression.title.legend' }
] as const;

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-steps', category: 'forage', stat: 'forageAttempts', target: 1, xpReward: 25 },
  { id: 'trailblazer', category: 'forage', stat: 'forageAttempts', target: 25, xpReward: 100 },
  { id: 'lucky-hands', category: 'forage', stat: 'forageSuccesses', target: 10, xpReward: 75 },
  {
    id: 'gatherer',
    category: 'collection',
    stat: 'ingredientsCollected',
    target: 20,
    xpReward: 75
  },
  {
    id: 'hoarder',
    category: 'collection',
    stat: 'ingredientsCollected',
    target: 100,
    xpReward: 200
  },
  { id: 'keen-eye', category: 'collection', stat: 'uncommonCollected', target: 5, xpReward: 100 },
  { id: 'rare-find', category: 'collection', stat: 'rareCollected', target: 1, xpReward: 150 },
  { id: 'first-brew', category: 'alchemy', stat: 'potionsBrewed', target: 1, xpReward: 50 },
  { id: 'brewmaster', category: 'alchemy', stat: 'potionsBrewed', target: 25, xpReward: 200 },
  { id: 'scholar', category: 'alchemy', stat: 'recipesDiscovered', target: 10, xpReward: 150 },
  { id: 'new-friend', category: 'social', stat: 'friends', target: 1, xpReward: 50 },
  { id: 'party', category: 'social', stat: 'friends', target: 4, xpReward: 120 },
  { id: 'regular', category: 'dedication', stat: 'bestStreakDays', target: 3, xpReward: 75 },
  { id: 'devoted', category: 'dedication', stat: 'bestStreakDays', target: 7, xpReward: 200 }
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeRarity(rarity?: string | null): RarityTier {
  const value = (rarity || '').toLowerCase();
  if (value.startsWith('incom') || value.startsWith('uncom') || value.startsWith('poco'))
    return 'uncommon';
  if (value.startsWith('rar')) return 'rare';
  if (value.startsWith('uni') || value.startsWith('úni')) return 'unique';
  return 'common';
}

/** XP needed to go from `level` to `level + 1`. Grows gently so early levels feel quick. */
export function xpForLevel(level: number): number {
  return 100 + (Math.max(1, level) - 1) * 60;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }

  const xpForNextLevel = xpForLevel(level);
  const title = [...LEVEL_TITLES].reverse().find((item) => level >= item.minLevel);

  return {
    level,
    totalXp: Math.max(0, Math.floor(totalXp)),
    xpIntoLevel: remaining,
    xpForNextLevel,
    progress: remaining / xpForNextLevel,
    titleKey: title?.key || LEVEL_TITLES[0].key
  };
}

function dayKey(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

function isSameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/**
 * Current streak counts consecutive active days ending today, or ending
 * yesterday (so the streak isn't shown as broken before the player plays today).
 */
export function calculateStreaks(activityDates: Date[], now = new Date()) {
  const days = Array.from(new Set(activityDates.map(dayKey))).sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = dayKey(now);
  const last = days[days.length - 1];
  const current = last === today || last === today - 1 ? run : 0;

  return { current, best };
}

function foundIngredients(input: ProgressionInput) {
  return input.attempts.filter((attempt) => attempt.success && attempt.found);
}

export function calculateStats(input: ProgressionInput): ProgressionStats {
  const now = input.now || new Date();
  let ingredientsCollected = 0;
  let uncommonCollected = 0;
  let rareCollected = 0;

  foundIngredients(input).forEach((attempt) => {
    const tier = normalizeRarity(attempt.rarity);
    ingredientsCollected += 1;
    if (tier === 'uncommon') uncommonCollected += 1;
    if (tier === 'rare' || tier === 'unique') rareCollected += 1;
  });

  const activityDates = [
    ...input.attempts.map((attempt) => attempt.timestamp),
    ...input.potions.map((potion) => potion.createdAt)
  ];
  const streaks = calculateStreaks(activityDates, now);

  return {
    forageAttempts: input.attempts.length,
    forageSuccesses: input.attempts.filter((attempt) => attempt.success).length,
    ingredientsCollected,
    uncommonCollected,
    rareCollected,
    potionsBrewed: input.potions.reduce(
      (sum, potion) => sum + Math.max(1, potion.quantity || 1),
      0
    ),
    recipesDiscovered: new Set(input.recipes.map((recipe) => recipe.id)).size,
    friends: input.friendsCount,
    streakDays: streaks.current,
    bestStreakDays: streaks.best
  };
}

function calculateBaseXp(input: ProgressionInput, stats: ProgressionStats): number {
  const ingredientXp = foundIngredients(input).reduce(
    (sum, attempt) => sum + XP_REWARDS.ingredient[normalizeRarity(attempt.rarity)],
    0
  );

  return (
    stats.forageAttempts * XP_REWARDS.forageAttempt +
    stats.forageSuccesses * XP_REWARDS.forageSuccess +
    ingredientXp +
    stats.potionsBrewed * XP_REWARDS.potion +
    stats.recipesDiscovered * XP_REWARDS.recipe +
    stats.friends * XP_REWARDS.friend
  );
}

export function getAchievementProgress(stats: ProgressionStats): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => {
    const current = Number(stats[achievement.stat]) || 0;
    return {
      ...achievement,
      current: Math.min(current, achievement.target),
      unlocked: current >= achievement.target,
      progress: Math.min(1, current / achievement.target)
    };
  });
}

export function getDailyQuests(input: ProgressionInput): DailyQuest[] {
  const now = input.now || new Date();
  const forageToday = input.attempts.filter((attempt) => isSameDay(attempt.timestamp, now)).length;
  const collectedToday = foundIngredients(input).filter((attempt) =>
    isSameDay(attempt.timestamp, now)
  ).length;
  const brewedToday = input.potions.filter((potion) => isSameDay(potion.createdAt, now)).length;
  const messagesToday = input.messagesSentToday || 0;

  const quests: Array<Omit<DailyQuest, 'completed'>> = [
    { id: 'forage', current: forageToday, target: 3 },
    { id: 'collect', current: collectedToday, target: 2 },
    { id: 'brew', current: brewedToday, target: 1 },
    { id: 'social', current: messagesToday, target: 1 }
  ];

  return quests.map((quest) => ({
    ...quest,
    current: Math.min(quest.current, quest.target),
    completed: quest.current >= quest.target
  }));
}

export function buildProgression(input: ProgressionInput): ProgressionSnapshot {
  const stats = calculateStats(input);
  const achievements = getAchievementProgress(stats);
  const dailyQuests = getDailyQuests(input);
  const achievementXp = achievements
    .filter((achievement) => achievement.unlocked)
    .reduce((sum, achievement) => sum + achievement.xpReward, 0);

  return {
    stats,
    level: getLevelInfo(calculateBaseXp(input, stats) + achievementXp),
    achievements,
    unlockedAchievements: achievements.filter((achievement) => achievement.unlocked).length,
    dailyQuests,
    completedDailyQuests: dailyQuests.filter((quest) => quest.completed).length
  };
}
