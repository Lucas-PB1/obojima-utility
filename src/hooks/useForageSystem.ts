'use client';

import { useState, useCallback } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { useForageLogic } from '@/hooks/useForageLogic';
import { CollectedIngredient } from '@/types/ingredients';

export function useForageSystem(onIngredientCollected?: (ingredient: CollectedIngredient) => void) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { ingredients, addIngredient, addAttempt } = useIngredients();
  const forageLogic = useForageLogic();

  const handleForage = useCallback(async () => {
    await forageLogic.executeForage(onIngredientCollected, addIngredient, addAttempt);
  }, [forageLogic, onIngredientCollected, addIngredient, addAttempt]);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return {
    ...forageLogic,
    ingredients,
    isSettingsOpen,
    openSettings,
    closeSettings,
    handleForage
  };
}
