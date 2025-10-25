'use client';

import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient } from '@/types/ingredients';

/**
 * Tipos de abas disponíveis na aplicação
 */
export type TabType = 'forage' | 'collection' | 'potions' | 'created-potions' | 'recipes' | 'log' | 'backup';

/**
 * Interface que define uma aba da aplicação
 */
export interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

/**
 * Configuração das abas da aplicação
 */
const TABS: Tab[] = [
  { id: 'forage', label: 'Forragear', icon: '🌿' },
  { id: 'collection', label: 'Coleção', icon: '🎒' },
  { id: 'potions', label: 'Poções', icon: '🧪' },
  { id: 'created-potions', label: 'Inventário', icon: '⚗️' },
  { id: 'recipes', label: 'Receitas', icon: '📜' },
  { id: 'log', label: 'Log', icon: '📋' },
  { id: 'backup', label: 'Backup', icon: '💾' }
];

const MAX_RECENT_ITEMS = 5;

/**
 * Hook principal da aplicação para gerenciar estado global
 * 
 * @description
 * Este hook gerencia o estado principal da aplicação, incluindo:
 * - Navegação entre abas
 * - Histórico de ingredientes coletados recentemente
 * - Detecção de renderização no cliente
 * - Handlers para eventos globais
 * 
 */
export function useApp() {
  const [activeTab, setActiveTab] = useState<TabType>('forage');
  const [recentlyCollected, setRecentlyCollected] = useState<CollectedIngredient[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Adiciona um ingrediente ao histórico de coletados recentemente
   * 
   * @param ingredient - Ingrediente coletado
   */
  const handleIngredientCollected = useCallback((ingredient: CollectedIngredient) => {
    setRecentlyCollected(prev => [ingredient, ...prev.slice(0, MAX_RECENT_ITEMS - 1)]);
  }, []);

  /**
   * Altera a aba ativa da aplicação
   * 
   * @param tabId - ID da aba para a qual navegar
   */
  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  /**
   * Navega para a aba de coleção
   */
  const handleViewCollection = useCallback(() => {
    setActiveTab('collection');
  }, []);

  return {
    activeTab,
    recentlyCollected,
    isClient,
    tabs: TABS,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
  };
}
