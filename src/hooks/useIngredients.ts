import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { firebaseStorageService } from '@/services/firebaseStorageService';

export function useIngredients() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setIngredients([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const collectedIngredients = await firebaseStorageService.getCollectedIngredients();
      const forageAttempts = await firebaseStorageService.getForageAttempts();
      setIngredients(collectedIngredients);
      setAttempts(forageAttempts);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIngredients([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    const unsubscribeIngredients = firebaseStorageService.subscribeToCollectedIngredients((ingredients) => {
      setIngredients(ingredients);
      setLoading(false);
    });

    const unsubscribeAttempts = firebaseStorageService.subscribeToForageAttempts((attempts) => {
      setAttempts(attempts);
    });

    return () => {
      unsubscribeIngredients();
      unsubscribeAttempts();
    };
  }, [isAuthenticated, authLoading]);

  const markAsUsed = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.markIngredientAsUsed(id);
    } catch (error) {
      console.error('Erro ao marcar ingrediente como usado:', error);
    }
  }, [isAuthenticated]);

  const removeIngredient = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.removeCollectedIngredient(id);
    } catch (error) {
      console.error('Erro ao remover ingrediente:', error);
    }
  }, [isAuthenticated]);

  const addIngredient = useCallback(async (ingredient: CollectedIngredient) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.addCollectedIngredient(ingredient);
    } catch (error) {
      console.error('Erro ao adicionar ingrediente:', error);
    }
  }, [isAuthenticated]);

  const addAttempt = useCallback(async (attempt: ForageAttempt) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.addForageAttempt(attempt);
    } catch (error) {
      console.error('Erro ao adicionar tentativa:', error);
    }
  }, [isAuthenticated]);

  const getStats = useCallback(async () => {
    if (!isAuthenticated) {
      return {
        totalCollected: 0,
        totalUsed: 0,
        totalAttempts: 0,
        successfulAttempts: 0,
        successRate: 0,
        byRegion: {},
        byRarity: {}
      };
    }
    return await firebaseStorageService.getStats();
  }, [isAuthenticated]);



  return {
    ingredients,
    attempts,
    loading: loading || authLoading,
    markAsUsed,
    removeIngredient,
    addIngredient,
    addAttempt,
    getStats,
    refreshData
  };
}
