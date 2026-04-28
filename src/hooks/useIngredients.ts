'use client';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { e2eAttempts, e2eIngredients, isE2EMode } from '@/lib/e2e/mockData';

export function useIngredients() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>(
    isE2EMode() ? e2eIngredients : []
  );
  const [attempts, setAttempts] = useState<ForageAttempt[]>(isE2EMode() ? e2eAttempts : []);
  const [loading, setLoading] = useState(!isE2EMode());

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setIngredients([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    if (isE2EMode()) {
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
      logger.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    if (isE2EMode()) {
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setIngredients([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    const unsubscribeIngredients = firebaseStorageService.subscribeToCollectedIngredients(
      (ingredients) => {
        setIngredients(ingredients);
        setLoading(false);
      }
    );

    const unsubscribeAttempts = firebaseStorageService.subscribeToForageAttempts((attempts) => {
      setAttempts(attempts);
    });

    return () => {
      unsubscribeIngredients();
      unsubscribeAttempts();
    };
  }, [isAuthenticated, authLoading]);

  const markAsUsed = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      if (isE2EMode()) {
        setIngredients((prev) =>
          prev.map((ingredient) =>
            ingredient.id === id
              ? {
                  ...ingredient,
                  quantity: Math.max(0, ingredient.quantity - 1),
                  used: ingredient.quantity <= 1,
                  usedAt: ingredient.quantity <= 1 ? new Date() : ingredient.usedAt
                }
              : ingredient
          )
        );
        return;
      }
      try {
        await firebaseStorageService.markIngredientAsUsed(id);
      } catch (error) {
        logger.error('Erro ao marcar ingrediente como usado:', error);
      }
    },
    [isAuthenticated]
  );

  const removeIngredient = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      if (isE2EMode()) {
        setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
        return;
      }
      try {
        await firebaseStorageService.removeCollectedIngredient(id);
      } catch (error) {
        logger.error('Erro ao remover ingrediente:', error);
      }
    },
    [isAuthenticated]
  );

  const addIngredient = useCallback(
    async (ingredient: CollectedIngredient) => {
      if (!isAuthenticated) return;
      if (isE2EMode()) {
        setIngredients((prev) => [ingredient, ...prev]);
        return;
      }
      try {
        await firebaseStorageService.addCollectedIngredient(ingredient);
      } catch (error) {
        logger.error('Erro ao adicionar ingrediente:', error);
      }
    },
    [isAuthenticated]
  );

  const addAttempt = useCallback(
    async (attempt: ForageAttempt) => {
      if (!isAuthenticated) return;
      if (isE2EMode()) {
        setAttempts((prev) => [attempt, ...prev]);
        return;
      }
      try {
        await firebaseStorageService.addForageAttempt(attempt);
      } catch (error) {
        logger.error('Erro ao adicionar tentativa:', error);
      }
    },
    [isAuthenticated]
  );

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
