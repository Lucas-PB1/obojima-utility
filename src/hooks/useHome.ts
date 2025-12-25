'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { useIngredients } from '@/hooks/useIngredients';
import { useAuth } from '@/hooks/useAuth';

export function useHome() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const {
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
  } = useApp();

  const { ingredients, markAsUsed } = useIngredients();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const availableIngredients = ingredients
    .filter(ing => !ing.used && ing.quantity > 0)
    .map(ing => ing.ingredient);

  const handleIngredientsUsed = (ingredientIds: number[]) => {
    ingredients
      .filter(ing => ingredientIds.includes(ing.ingredient.id) && !ing.used)
      .forEach(ing => markAsUsed(ing.id));
  };

  return {
    user,
    authLoading,
    isAuthenticated,
    logout,
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
    availableIngredients,
    handleIngredientsUsed
  };
}
