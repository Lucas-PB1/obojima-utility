'use client';

import React, { useState, useEffect } from 'react';
import ForageSystem from '@/components/ForageSystem';
import IngredientCollection from '@/components/IngredientCollection';
import ActivityLog from '@/components/ActivityLog';
import { TabNavigation } from '@/components/ui';
import { CollectedIngredient } from '@/types/ingredients';

type TabType = 'forage' | 'collection' | 'log';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('forage');
  const [recentlyCollected, setRecentlyCollected] = useState<CollectedIngredient[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleIngredientCollected = (ingredient: CollectedIngredient) => {
    setRecentlyCollected(prev => [ingredient, ...prev.slice(0, 4)]); // Keep last 5
  };

  const tabs = [
    { id: 'forage' as TabType, label: 'Forragear', icon: '🌿' },
    { id: 'collection' as TabType, label: 'Coleção', icon: '🎒' },
    { id: 'log' as TabType, label: 'Log', icon: '📋' }
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <div className="text-rose-500 font-medium">Carregando Obojima...</div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-rose-50 transition-colors duration-300">
        {/* Header */}
        <div className="border-b border-rose-200 sticky top-0 z-50 bg-white backdrop-blur-md transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-rose-400 transition-colors duration-300">
                  🌿 Obojima Utilities
                </h1>
                <p className="text-sm text-rose-300 transition-colors duration-300">
                  Sistema de Forrageamento e Alquimia
                </p>
              </div>
              
              {/* Recently Collected Notification */}
              {recentlyCollected.length > 0 && (
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-100 transition-colors duration-300">
                  <span className="text-sm font-medium text-rose-400">
                    🎁 {recentlyCollected.length} novo(s) ingrediente(s)!
                  </span>
                  <button
                    onClick={() => setActiveTab('collection')}
                    className="text-sm underline hover:opacity-80 transition-opacity duration-200 text-rose-300"
                  >
                    Ver coleção
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
        />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'forage' && (
            <ForageSystem 
              onIngredientCollected={handleIngredientCollected}
            />
          )}
          {activeTab === 'collection' && <IngredientCollection />}
          {activeTab === 'log' && <ActivityLog />}
        </div>

        {/* Footer */}
        <footer className="border-t border-rose-200 mt-12 bg-white backdrop-blur-md transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center text-gray-900 transition-colors duration-300">
              <p className="mb-2">
                🌿 Sistema de Forrageamento de Obojima
              </p>
              <p className="text-sm opacity-80">
                Explore as terras mágicas e colete ingredientes únicos para suas poções
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}
