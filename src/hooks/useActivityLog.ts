'use client';
import { useState, useMemo } from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { StatsService } from '@/services/statsService';
import { useIngredients } from '@/hooks/useIngredients';
import { useTranslation } from '@/hooks/useTranslation';

export function useActivityLog() {
  const { t } = useTranslation();
  const { attempts, refreshData } = useIngredients();
  const [filteredAttempts, setFilteredAttempts] = useState<ForageAttempt[]>([]);

  const activityStats = useMemo(
    () => StatsService.calculateActivityStats(filteredAttempts),
    [filteredAttempts]
  );

  const statsData = useMemo(
    () => [
      {
        value: activityStats.totalAttempts,
        label: t('activity.stats.totalAttempts'),
        color: 'totoro-green' as const
      },
      {
        value: `${activityStats.successRate.toFixed(1)}%`,
        label: t('activity.stats.successRate'),
        color: 'totoro-blue' as const
      },
      {
        value: activityStats.averageRoll.toFixed(1),
        label: t('activity.stats.averageRoll'),
        color: 'totoro-yellow' as const
      },
      {
        value: activityStats.ingredientsCollected,
        label: t('activity.stats.ingredientsCollected'),
        color: 'totoro-gray' as const
      }
    ],
    [activityStats, t]
  );

  return {
    attempts,
    filteredAttempts,
    setFilteredAttempts,
    statsData,
    refreshData
  };
}
