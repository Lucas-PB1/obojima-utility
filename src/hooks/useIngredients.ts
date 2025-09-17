import { useState, useEffect } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { storageService } from '@/services/storageService';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);

  useEffect(() => {
    setIngredients(storageService.getCollectedIngredients());
    setAttempts(storageService.getForageAttempts());
  }, []);

  const refreshIngredients = () => {
    setIngredients(storageService.getCollectedIngredients());
  };

  const refreshAttempts = () => {
    setAttempts(storageService.getForageAttempts());
  };

  const markAsUsed = (id: string) => {
    storageService.markIngredientAsUsed(id);
    refreshIngredients();
  };

  const removeIngredient = (id: string) => {
    storageService.removeCollectedIngredient(id);
    refreshIngredients();
  };

  const addIngredient = (ingredient: CollectedIngredient) => {
    storageService.addCollectedIngredient(ingredient);
    refreshIngredients();
  };

  const addAttempt = (attempt: ForageAttempt) => {
    storageService.addForageAttempt(attempt);
    refreshAttempts();
  };

  const getStats = () => storageService.getStats();

  return {
    ingredients,
    attempts,
    refreshIngredients,
    refreshAttempts,
    markAsUsed,
    removeIngredient,
    addIngredient,
    addAttempt,
    getStats
  };
}
