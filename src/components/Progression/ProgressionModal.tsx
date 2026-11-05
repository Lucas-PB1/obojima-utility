'use client';
import React from 'react';
import { CheckCircle2, Flame, Lock, Sparkles, Trophy } from 'lucide-react';
import { Modal } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import {
  AchievementCategory,
  ProgressionSnapshot,
  XP_REWARDS
} from '@/features/progression/domain/progression';
import { ACHIEVEMENT_ICONS, QUEST_ICONS } from './achievementIcons';
import { XpBar } from './XpBar';

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ProgressionSnapshot;
}

const CATEGORY_ORDER: AchievementCategory[] = [
  'forage',
  'collection',
  'alchemy',
  'social',
  'dedication'
];

export function ProgressionModal({ isOpen, onClose, snapshot }: ProgressionModalProps) {
  const { t } = useTranslation();
  const { level, stats, achievements, dailyQuests, unlockedAchievements } = snapshot;

  const statTiles = [
    { label: t('progression.stats.forage'), value: stats.forageAttempts },
    { label: t('progression.stats.ingredients'), value: stats.ingredientsCollected },
    { label: t('progression.stats.potions'), value: stats.potionsBrewed },
    { label: t('progression.stats.recipes'), value: stats.recipesDiscovered },
    { label: t('progression.stats.friends'), value: stats.friends },
    { label: t('progression.stats.bestStreak'), value: stats.bestStreakDays }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-totoro-yellow" />
          {t('progression.title')}
        </span>
      }
    >
      <div className="max-h-[calc(96vh-6rem)] space-y-6 overflow-y-auto pr-1">
        <section className="rounded-lg bg-gradient-to-br from-totoro-green/15 to-totoro-blue/15 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-totoro-green to-totoro-blue text-white shadow-[var(--shadow-raised)]">
              <span className="text-[10px] font-bold uppercase opacity-80">
                {t('progression.level')}
              </span>
              <span className="text-2xl font-black leading-none">{level.level}</span>
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-serif text-lg font-bold text-totoro-gray">
                  {t(level.titleKey)}
                </h4>
                {stats.streakDays > 0 && (
                  <span className="flex items-center gap-1 text-sm font-bold text-totoro-orange">
                    <Flame className="h-4 w-4" />
                    {t('progression.streak', stats.streakDays)}
                  </span>
                )}
              </div>
              <XpBar progress={level.progress} className="h-3" label={t('progression.xp')} />
              <p className="text-xs text-totoro-gray/70">
                {t(
                  'progression.xpToNext',
                  level.xpIntoLevel,
                  level.xpForNextLevel,
                  level.level + 1
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-totoro-blue/70">
            <Sparkles className="h-4 w-4" />
            {t('progression.daily.title')}
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dailyQuests.map((quest) => {
              const Icon = QUEST_ICONS[quest.id];
              return (
                <div
                  key={quest.id}
                  className={`flex items-center gap-3 rounded-lg p-3 shadow-[inset_0_0_0_1px_var(--hairline)] ${
                    quest.completed ? 'bg-totoro-green/10' : 'bg-white/5'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      quest.completed
                        ? 'bg-totoro-green text-white'
                        : 'bg-totoro-blue/10 text-totoro-blue'
                    }`}
                  >
                    {quest.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-totoro-gray">
                        {t(`progression.daily.${quest.id}`, quest.target)}
                      </p>
                      <span className="shrink-0 text-xs font-bold text-totoro-gray/60">
                        {quest.current}/{quest.target}
                      </span>
                    </div>
                    <XpBar progress={quest.current / quest.target} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="flex items-center justify-between gap-2 text-sm font-black uppercase tracking-[0.16em] text-totoro-blue/70">
            <span className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {t('progression.achievements')}
            </span>
            <span className="tracking-normal text-totoro-gray/60">
              {unlockedAchievements}/{achievements.length}
            </span>
          </h4>
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-bold text-totoro-gray/50">
                {t(`progression.category.${category}`)}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {achievements
                  .filter((achievement) => achievement.category === category)
                  .map((achievement) => {
                    const Icon = ACHIEVEMENT_ICONS[achievement.id] || Trophy;
                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 rounded-lg p-3 shadow-[inset_0_0_0_1px_var(--hairline)] ${
                          achievement.unlocked ? 'bg-totoro-yellow/10' : 'bg-white/5'
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-totoro-yellow to-totoro-orange text-white shadow-[var(--shadow-soft)]'
                              : 'bg-totoro-gray/10 text-totoro-gray/40'
                          }`}
                        >
                          {achievement.unlocked ? (
                            <Icon className="h-5 w-5" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-totoro-gray">
                              {t(`progression.achievement.${achievement.id}.name`)}
                            </p>
                            <span className="shrink-0 text-[10px] font-black text-totoro-orange">
                              +{achievement.xpReward} XP
                            </span>
                          </div>
                          <p className="text-xs text-totoro-gray/60">
                            {t(
                              `progression.achievement.${achievement.id}.desc`,
                              achievement.target
                            )}
                          </p>
                          {!achievement.unlocked && (
                            <div className="flex items-center gap-2">
                              <XpBar progress={achievement.progress} className="h-1" />
                              <span className="shrink-0 text-[10px] font-bold text-totoro-gray/50">
                                {achievement.current}/{achievement.target}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-totoro-blue/70">
            {t('progression.stats.title')}
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-lg bg-white/5 p-3 text-center shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <p className="text-xl font-black text-totoro-gray">{tile.value}</p>
                <p className="text-[11px] font-bold text-totoro-gray/50">{tile.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-totoro-gray/50">
            {t(
              'progression.howXp',
              XP_REWARDS.forageSuccess,
              XP_REWARDS.ingredient.rare,
              XP_REWARDS.potion,
              XP_REWARDS.recipe,
              XP_REWARDS.friend
            )}
          </p>
        </section>
      </div>
    </Modal>
  );
}
