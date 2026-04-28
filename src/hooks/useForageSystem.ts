'use client';
import { useCallback } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { useForageLogic } from '@/hooks/useForageLogic';
import { CollectedIngredient } from '@/types/ingredients';

export function useForageSystem(onIngredientCollected?: (ingredient: CollectedIngredient) => void) {
  const { ingredients, addIngredient, addAttempt } = useIngredients();
  const forageLogic = useForageLogic();

  const handleForage = useCallback(async () => {
    await forageLogic.executeForage(onIngredientCollected, addIngredient, addAttempt);
  }, [forageLogic, onIngredientCollected, addIngredient, addAttempt]);

  return {
    ...forageLogic,
    ingredients,
    handleForage
  };
}
