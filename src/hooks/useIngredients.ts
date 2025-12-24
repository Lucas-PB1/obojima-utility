import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { useAuth } from './useAuth';

/**
 * Hook para gerenciar ingredientes coletados e tentativas de forrageamento
 * 
 * @description
 * Este hook encapsula toda a lógica de gerenciamento de ingredientes e tentativas,
 * incluindo:
 * - Carregamento de dados do Firestore
 * - Adição e remoção de ingredientes
 * - Marcação de ingredientes como usados
 * - Gerenciamento de tentativas de forrageamento
 * - Operações de limpeza de dados
 * - Sincronização em tempo real
 * 
 */
export function useIngredients() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega todos os dados do Firestore
   */
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

  /**
   * Marca um ingrediente como usado
   * 
   * @param id - ID do ingrediente a ser marcado como usado
   */
  const markAsUsed = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.markIngredientAsUsed(id);
    } catch (error) {
      console.error('Erro ao marcar ingrediente como usado:', error);
    }
  }, [isAuthenticated]);

  /**
   * Remove um ingrediente da coleção
   * 
   * @param id - ID do ingrediente a ser removido
   */
  const removeIngredient = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.removeCollectedIngredient(id);
    } catch (error) {
      console.error('Erro ao remover ingrediente:', error);
    }
  }, [isAuthenticated]);

  /**
   * Adiciona um novo ingrediente à coleção
   * 
   * @param ingredient - Ingrediente a ser adicionado
   */
  const addIngredient = useCallback(async (ingredient: CollectedIngredient) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.addCollectedIngredient(ingredient);
    } catch (error) {
      console.error('Erro ao adicionar ingrediente:', error);
    }
  }, [isAuthenticated]);

  /**
   * Adiciona uma nova tentativa de forrageamento
   * 
   * @param attempt - Tentativa de forrageamento a ser adicionada
   */
  const addAttempt = useCallback(async (attempt: ForageAttempt) => {
    if (!isAuthenticated) return;
    try {
      await firebaseStorageService.addForageAttempt(attempt);
    } catch (error) {
      console.error('Erro ao adicionar tentativa:', error);
    }
  }, [isAuthenticated]);

  /**
   * Retorna as estatísticas do sistema
   * 
   * @returns Estatísticas calculadas
   */
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
