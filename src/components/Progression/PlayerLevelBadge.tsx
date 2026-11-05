'use client';
import React from 'react';
import { Flame } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ProgressionSnapshot } from '@/features/progression/domain/progression';
import { XpBar } from './XpBar';

interface PlayerLevelBadgeProps {
  snapshot: ProgressionSnapshot;
  onClick: () => void;
}

export function PlayerLevelBadge({ snapshot, onClick }: PlayerLevelBadgeProps) {
  const { t } = useTranslation();
  const { level, stats, dailyQuests, completedDailyQuests } = snapshot;

  return (
    <button
      type="button"
      onClick={onClick}
      title={t('progression.open')}
      aria-label={`${t('progression.level')} ${level.level} · ${t('progression.open')}`}
      className="flex min-w-0 items-center gap-2.5 rounded-lg bg-totoro-green/10 px-2.5 py-1.5 text-left shadow-[inset_0_0_0_1px_rgba(var(--success-rgb),0.2),var(--shadow-soft)] transition hover:bg-totoro-green/15"
    >
      <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-totoro-green to-totoro-blue text-white shadow-[var(--shadow-soft)]">
        <span className="text-[8px] font-bold uppercase leading-none opacity-80">
          {t('progression.lvShort')}
        </span>
        <span className="text-sm font-black leading-none">{level.level}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-totoro-gray">
          <span className="truncate">{t(level.titleKey)}</span>
          {stats.streakDays > 0 && (
            <span
              className="flex items-center gap-0.5 text-totoro-orange"
              title={t('progression.streak', stats.streakDays)}
            >
              <Flame className="h-3.5 w-3.5" />
              {stats.streakDays}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <XpBar progress={level.progress} className="h-1.5 w-20 sm:w-24" />
          <span className="text-[10px] font-bold text-totoro-gray/60">
            {completedDailyQuests}/{dailyQuests.length}
          </span>
        </span>
      </span>
    </button>
  );
}
