'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { StatsService } from '@/services/statsService';
import { ingredientsService } from '@/services/ingredientsService';
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

  /* eslint-disable react-hooks/exhaustive-deps */
  const [totalIngredientsCount, setTotalIngredientsCount] = useState(0);

  useEffect(() => {
    ingredientsService.getTotalIngredientsCount().then(setTotalIngredientsCount);
  }, []);

  const collectionStats = useMemo(
    () => StatsService.calculateCollectionStats(displayIngredients, attempts),
    [displayIngredients, attempts]
  );

  const { t } = useTranslation();

  const uniqueCollectedCount = displayIngredients.length;
  const progressPercentage = totalIngredientsCount > 0 
    ? Math.round((uniqueCollectedCount / totalIngredientsCount) * 100) 
    : 0;

  const statsData = useMemo(
    () => [
      {
        value: totalIngredientsCount > 0 
          ? `${uniqueCollectedCount} / ${totalIngredientsCount} (${progressPercentage}%)`
          : collectionStats.totalCollected,
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
    [collectionStats, t, uniqueCollectedCount, totalIngredientsCount, progressPercentage]
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
