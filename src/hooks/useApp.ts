'use client';
import { useState, useEffect, useCallback } from 'react';
import { CollectedIngredient } from '@/types/ingredients';

export type TabType = 'forage' | 'collection' | 'potions' | 'created-potions' | 'recipes' | 'log';

export interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

const TABS_CONFIG: Omit<Tab, 'label'>[] = [
  { id: 'forage', icon: '🌿' },
  { id: 'collection', icon: '🎒' },
  { id: 'potions', icon: '🧪' },
  { id: 'created-potions', icon: '⚗️' },
  { id: 'recipes', icon: '📜' },
  { id: 'log', icon: '📋' }
];

const MAX_RECENT_ITEMS = 5;

import { useTranslation } from '@/hooks/useTranslation';

export function useApp() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('forage');
  const [recentlyCollected, setRecentlyCollected] = useState<CollectedIngredient[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleIngredientCollected = useCallback((ingredient: CollectedIngredient) => {
    setRecentlyCollected((prev) => [ingredient, ...prev.slice(0, MAX_RECENT_ITEMS - 1)]);
  }, []);

  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  const handleViewCollection = useCallback(() => {
    setActiveTab('collection');
  }, []);

  const tabs: Tab[] = TABS_CONFIG.map(tab => {
    let label = '';
    switch(tab.id) {
        case 'forage': label = t('menu.forage'); break;
        case 'collection': label = t('menu.collection'); break;
        case 'potions': label = t('menu.potions'); break;
        case 'created-potions': label = t('menu.inventory'); break;
        case 'recipes': label = t('menu.recipes'); break;
        case 'log': label = t('menu.log'); break;
    }
    return { ...tab, label };
  });

  return {
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection
  };
}
