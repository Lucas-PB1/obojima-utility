import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { storageService } from '@/services/storageService';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);

  const refreshData = useCallback(() => {
    const collectedIngredients = storageService.getCollectedIngredients();
    const forageAttempts = storageService.getForageAttempts();
    setIngredients(collectedIngredients);
    setAttempts(forageAttempts);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const markAsUsed = useCallback((id: string) => {
    storageService.markIngredientAsUsed(id);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  const removeIngredient = useCallback((id: string) => {
    storageService.removeCollectedIngredient(id);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  const addIngredient = useCallback((ingredient: CollectedIngredient) => {
    storageService.addCollectedIngredient(ingredient);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  const addAttempt = useCallback((attempt: ForageAttempt) => {
    storageService.addForageAttempt(attempt);
    setAttempts(storageService.getForageAttempts());
  }, []);

  const getStats = useCallback(() => storageService.getStats(), []);

  return {
    ingredients,
    attempts,
    markAsUsed,
    removeIngredient,
    addIngredient,
    addAttempt,
    getStats,
    refreshData
  };
}
