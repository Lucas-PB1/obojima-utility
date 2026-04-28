'use client';
import { createElement, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CollectedIngredient } from '@/types/ingredients';
import { APP_SHELL_TAB_ICONS } from '@/features/app-shell/types';

export type TabType =
  | 'forage'
  | 'collection'
  | 'potions'
  | 'created-potions'
  | 'recipes'
  | 'social'
  | 'log';

export interface Tab {
  id: TabType;
  label: string;
  icon: ReactNode;
}

const TABS_CONFIG: Pick<Tab, 'id'>[] = [
  { id: 'forage' },
  { id: 'collection' },
  { id: 'potions' },
  { id: 'created-potions' },
  { id: 'recipes' },
  { id: 'social' },
  { id: 'log' }
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

  const tabs: Tab[] = TABS_CONFIG.map((tab) => {
    let label = '';
    switch (tab.id) {
      case 'forage':
        label = t('menu.forage');
        break;
      case 'collection':
        label = t('menu.collection');
        break;
      case 'potions':
        label = t('menu.potions');
        break;
      case 'created-potions':
        label = t('menu.inventory');
        break;
      case 'recipes':
        label = t('menu.recipes');
        break;
      case 'log':
        label = t('menu.log');
        break;
      case 'social':
        label = t('menu.social');
        break;
    }
    const Icon = APP_SHELL_TAB_ICONS[tab.id];
    return { ...tab, label, icon: createElement(Icon, { size: 18, strokeWidth: 2.4 }) };
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
