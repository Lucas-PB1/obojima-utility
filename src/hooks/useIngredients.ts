import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { storageService } from '@/services/storageService';

/**
 * Hook para gerenciar ingredientes coletados e tentativas de forrageamento
 * 
 * @description
 * Este hook encapsula toda a lógica de gerenciamento de ingredientes e tentativas,
 * incluindo:
 * - Carregamento de dados do localStorage
 * - Adição e remoção de ingredientes
 * - Marcação de ingredientes como usados
 * - Gerenciamento de tentativas de forrageamento
 * - Operações de limpeza de dados
 * 
 */
export function useIngredients() {
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);

  /**
   * Recarrega todos os dados do localStorage
   */
  const refreshData = useCallback(() => {
    const collectedIngredients = storageService.getCollectedIngredients();
    const forageAttempts = storageService.getForageAttempts();
    setIngredients(collectedIngredients);
    setAttempts(forageAttempts);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /**
   * Marca um ingrediente como usado
   * 
   * @param id - ID do ingrediente a ser marcado como usado
   */
  const markAsUsed = useCallback((id: string) => {
    storageService.markIngredientAsUsed(id);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  /**
   * Remove um ingrediente da coleção
   * 
   * @param id - ID do ingrediente a ser removido
   */
  const removeIngredient = useCallback((id: string) => {
    storageService.removeCollectedIngredient(id);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  /**
   * Adiciona um novo ingrediente à coleção
   * 
   * @param ingredient - Ingrediente a ser adicionado
   */
  const addIngredient = useCallback((ingredient: CollectedIngredient) => {
    storageService.addCollectedIngredient(ingredient);
    setIngredients(storageService.getCollectedIngredients());
  }, []);

  /**
   * Adiciona uma nova tentativa de forrageamento
   * 
   * @param attempt - Tentativa de forrageamento a ser adicionada
   */
  const addAttempt = useCallback((attempt: ForageAttempt) => {
    storageService.addForageAttempt(attempt);
    setAttempts(storageService.getForageAttempts());
  }, []);

  /**
   * Retorna as estatísticas do sistema
   * 
   * @returns Estatísticas calculadas
   */
  const getStats = useCallback(() => storageService.getStats(), []);

  /**
   * Limpa todos os ingredientes coletados
   */
  const clearIngredients = useCallback(() => {
    storageService.clearIngredients();
    setIngredients([]);
  }, []);

  /**
   * Limpa todas as tentativas de forrageamento
   */
  const clearAttempts = useCallback(() => {
    storageService.clearAttempts();
    setAttempts([]);
  }, []);

  return {
    ingredients,
    attempts,
    markAsUsed,
    removeIngredient,
    addIngredient,
    addAttempt,
    getStats,
    refreshData,
    clearIngredients,
    clearAttempts
  };
}
