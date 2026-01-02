'use client';
import { useState, useMemo, useCallback } from 'react';
import { StatsService } from '@/services/statsService';
import { useIngredients } from '@/hooks/useIngredients';
import { CollectedIngredient } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';

export function useIngredientCollection() {
  const { ingredients, attempts, markAsUsed } = useIngredients();

  const [selectedIngredient, setSelectedIngredient] = useState<
    CollectedIngredient['ingredient'] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayIngredients = useMemo(
    () => ingredients.filter((ing) => ing.quantity > 0),
    [ingredients]
  );

  const collectionStats = useMemo(
    () => StatsService.calculateCollectionStats(displayIngredients, attempts),
    [displayIngredients, attempts]
  );

  const { t } = useTranslation();

  const statsData = useMemo(
    () => [
      {
        value: collectionStats.totalCollected,
        label: t('activity.stats.ingredientsCollected'),
        color: 'totoro-green' as const
      },
      {
        value: collectionStats.totalUsed,
        label: t('ingredients.table.used'),
        color: 'totoro-blue' as const
      },
      {
        value: collectionStats.totalAttempts,
        label: t('activity.stats.totalAttempts'),
        color: 'totoro-yellow' as const
      },
      {
        value: `${collectionStats.successRate.toFixed(1)}%`,
        label: t('activity.stats.successRate'),
        color: 'totoro-orange' as const
      }
    ],
    [collectionStats, t]
  );

  const handleMarkAsUsed = useCallback(
    (id: string) => {
      markAsUsed(id);
    },
    [markAsUsed]
  );

  const handleIngredientClick = useCallback((ingredient: CollectedIngredient['ingredient']) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIngredient(null);
  }, []);

  return {
    displayIngredients,
    selectedIngredient,
    isModalOpen,
    statsData,
    handleMarkAsUsed,
    handleIngredientClick,
    handleCloseModal
  };
}
