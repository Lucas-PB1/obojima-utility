'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PotionRecipe } from '@/types/ingredients';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';

export function useRecipeCollection() {
  const [recipes, setRecipes] = useState<PotionRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'combat' | 'utility' | 'whimsy'>('all');
  const [stats, setStats] = useState({
    total: 0,
    byCategory: { combat: 0, utility: 0, whimsy: 0 },
    recent: 0
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
      setStats(statsData);
    };
    loadStats();
  }, [recipes]);

  const loadRecipes = useCallback(async () => {
    const allRecipes = await firebaseRecipeService.getAllRecipes();
    setRecipes(allRecipes);
  }, []);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (filter === 'all') return true;
      return recipe.winningAttribute === filter;
    });
  }, [recipes, filter]);

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
    handleRecipeClick,
    handleDeleteRecipe,
    loadRecipes
  };
}
