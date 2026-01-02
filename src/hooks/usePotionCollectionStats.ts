'use client';
import { CreatedPotion } from '@/types/ingredients';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { potionService } from '@/services/potionService';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';

export function usePotionCollectionStats(potions: CreatedPotion[]) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    used: 0,
    byCategory: { combat: 0, utility: 0, whimsy: 0 },
    recent: 0,
    progress: {
      total: { collected: 0, total: 0, percentage: 0 },
      combat: { collected: 0, total: 0 },
      utility: { collected: 0, total: 0 },
      whimsy: { collected: 0, total: 0 }
    }
  });

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await firebaseCreatedPotionService.getPotionStats();
      const totalPotionsData = await potionService.getTotalPotionsCount();

      const uniquePotions = new Set<string>();
      const uniqueCombat = new Set<string>();
      const uniqueUtility = new Set<string>();
      const uniqueWhimsy = new Set<string>();

      potions.forEach((potion) => {
        const potionId = `${potion.recipe.resultingPotion.id}-${potion.recipe.winningAttribute}`;
        uniquePotions.add(potionId);

        if (potion.recipe.winningAttribute === 'combat') uniqueCombat.add(potionId);
        if (potion.recipe.winningAttribute === 'utility') uniqueUtility.add(potionId);
        if (potion.recipe.winningAttribute === 'whimsy') uniqueWhimsy.add(potionId);
      });

      setStats({
        ...statsData,
        progress: {
          total: {
            collected: uniquePotions.size,
            total: totalPotionsData.total,
            percentage: Math.round((uniquePotions.size / totalPotionsData.total) * 100)
          },
          combat: {
            collected: uniqueCombat.size,
            total: totalPotionsData.combat
          },
          utility: {
            collected: uniqueUtility.size,
            total: totalPotionsData.utility
          },
          whimsy: {
            collected: uniqueWhimsy.size,
            total: totalPotionsData.whimsy
          }
        }
      });
    };
    loadStats();
  }, [potions]);

  const statsData = useMemo(() => {
    return [
      {
        value:
          stats.progress?.total.total > 0
            ? `${stats.progress.total.collected} / ${stats.progress.total.total} (${stats.progress.total.percentage}%)`
            : stats.total,
        label: t('ui.labels.total'),
        color: 'totoro-gray' as const
      },
      { value: stats.available, label: t('ui.labels.available'), color: 'totoro-green' as const },
      { value: stats.used, label: t('ui.labels.used'), color: 'totoro-gray' as const },

      ...Object.entries(POTION_CATEGORY_CONFIG).map(([key, config]) => {
        const categoryKey = key as keyof typeof stats.byCategory;
        const categoryProgress = stats.progress?.[categoryKey as 'combat' | 'utility' | 'whimsy'];

        return {
          value:
            categoryProgress?.total > 0
              ? `${categoryProgress.collected} / ${categoryProgress.total}`
              : stats.byCategory[categoryKey],
          label: t(config.label),
          color: (key === 'combat'
            ? 'totoro-orange'
            : key === 'utility'
              ? 'totoro-blue'
              : 'totoro-yellow') as 'totoro-orange' | 'totoro-blue' | 'totoro-yellow'
        };
      })
    ];
  }, [stats, t]);

  return { stats, statsData };
}
