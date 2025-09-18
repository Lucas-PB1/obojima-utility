'use client';

import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient } from '@/types/ingredients';

export type TabType = 'forage' | 'collection' | 'log';

export interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'forage', label: 'Forragear', icon: '🌿' },
  { id: 'collection', label: 'Coleção', icon: '🎒' },
  { id: 'log', label: 'Log', icon: '📋' }
];

const MAX_RECENT_ITEMS = 5;

export function useApp() {
  const [activeTab, setActiveTab] = useState<TabType>('forage');
  const [recentlyCollected, setRecentlyCollected] = useState<CollectedIngredient[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleIngredientCollected = useCallback((ingredient: CollectedIngredient) => {
    setRecentlyCollected(prev => [ingredient, ...prev.slice(0, MAX_RECENT_ITEMS - 1)]);
  }, []);

  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

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
