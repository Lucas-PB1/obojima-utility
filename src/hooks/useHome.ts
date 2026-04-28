'use client';
import { useApp } from '@/hooks/useApp';
import { useIngredients } from '@/hooks/useIngredients';
import { useProtectedApp } from '@/hooks/useProtectedApp';

export function useHome() {
  const { user, userProfile, authLoading, isAuthenticated, logout, isClient, isInitialized } =
    useProtectedApp();
  const {
    activeTab,
    recentlyCollected,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection
  } = useApp();

  const { ingredients, markAsUsed } = useIngredients();

  const availableIngredients = ingredients
    .filter((ing) => !ing.used && ing.quantity > 0)
    .map((ing) => ing.ingredient);

  const handleIngredientsUsed = (ingredientIds: number[]) => {
    ingredients
      .filter((ing) => ingredientIds.includes(ing.ingredient.id) && !ing.used)
      .forEach((ing) => markAsUsed(ing.id));
  };

  return {
    user,
    userProfile,
    authLoading,
    isAuthenticated,
    logout,
    isInitialized,
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
