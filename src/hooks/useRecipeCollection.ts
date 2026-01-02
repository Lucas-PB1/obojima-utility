'use client';
import { PotionRecipe } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { potionService } from '@/services/potionService';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';

export function useRecipeCollection() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<PotionRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'combat' | 'utility' | 'whimsy'>('all');
  const [stats, setStats] = useState({
    total: 0,
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
    const unsubscribe = firebaseRecipeService.subscribeToRecipes((recipesData) => {
      setRecipes(recipesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await firebaseRecipeService.getRecipeStats();

      // Calculate progress stats
      const totalPotionsData = await potionService.getTotalPotionsCount();

      // Count unique potions collected by ID
      const uniquePotions = new Set<string>();
      const uniqueCombat = new Set<string>();
      const uniqueUtility = new Set<string>();
      const uniqueWhimsy = new Set<string>();

      recipes.forEach((recipe) => {
        const potionId = `${recipe.resultingPotion.id}-${recipe.winningAttribute}`;
        uniquePotions.add(potionId);

        if (recipe.winningAttribute === 'combat') uniqueCombat.add(potionId);
        if (recipe.winningAttribute === 'utility') uniqueUtility.add(potionId);
        if (recipe.winningAttribute === 'whimsy') uniqueWhimsy.add(potionId);
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
  }, [recipes]);

  const loadRecipes = useCallback(async () => {
    const allRecipes = await firebaseRecipeService.getAllRecipes();
    setRecipes(allRecipes);
  }, []);

  const filteredRecipes = useMemo(() => {
    const result = recipes.filter((recipe) => {
      if (filter === 'all') return true;
      return recipe.winningAttribute === filter;
    });

    return result.sort((a, b) => {
      // Sort by Category Order
      const categoryOrder = { combat: 1, utility: 2, whimsy: 3 };
      const catA = categoryOrder[a.winningAttribute as keyof typeof categoryOrder] || 99;
      const catB = categoryOrder[b.winningAttribute as keyof typeof categoryOrder] || 99;

      if (catA !== catB) return catA - catB;

      // Sort by ID (Number)
      return a.resultingPotion.id - b.resultingPotion.id;
    });
  }, [recipes, filter]);

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

  const handleRecipeClick = useCallback((recipe: PotionRecipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  }, []);

  const handleDeleteRecipe = useCallback(
    async (recipeId: string) => {
      if (confirm('Tem certeza que deseja excluir esta receita?')) {
        await firebaseRecipeService.removeRecipe(recipeId);
        loadRecipes();
      }
    },
    [loadRecipes]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    recipes,
    filteredRecipes,
    selectedRecipe,
    showModal,
    setShowModal,
    closeModal,
    filter,
    setFilter,
    stats,
    statsData,
    handleRecipeClick,
    handleDeleteRecipe,
    loadRecipes
  };
}
