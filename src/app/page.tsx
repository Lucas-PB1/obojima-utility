'use client';

import React, { useState } from 'react';
import ForageSystem from '@/components/ForageSystem';
import IngredientCollection from '@/components/IngredientCollection';
import ActivityLog from '@/components/ActivityLog';
import { TabNavigation } from '@/components/ui';
import { CollectedIngredient } from '@/types/ingredients';
import HydrationBoundary from '@/components/HydrationBoundary';

type TabType = 'forage' | 'collection' | 'log';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('forage');
  const [recentlyCollected, setRecentlyCollected] = useState<CollectedIngredient[]>([]);

  const handleIngredientCollected = (ingredient: CollectedIngredient) => {
    setRecentlyCollected(prev => [ingredient, ...prev.slice(0, 4)]); // Keep last 5
  };

  const tabs = [
    { id: 'forage' as TabType, label: 'Forragear', icon: '🌿' },
    { id: 'collection' as TabType, label: 'Coleção', icon: '🎒' },
    { id: 'log' as TabType, label: 'Log', icon: '📋' }
  ];

  return (
    <HydrationBoundary>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">
                  🌿 Obojima Utilities
                </h1>
                <p className="text-emerald-600 text-sm">
                  Sistema de Forrageamento e Alquimia
                </p>
              </div>
              
              {/* Recently Collected Notification */}
              {recentlyCollected.length > 0 && (
                <div className="hidden md:flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-lg">
                  <span className="text-emerald-700 text-sm font-medium">
                    🎁 {recentlyCollected.length} novo(s) ingrediente(s)!
                  </span>
                  <button
                    onClick={() => setActiveTab('collection')}
                    className="text-emerald-600 hover:text-emerald-800 text-sm underline"
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
            <ForageSystem onIngredientCollected={handleIngredientCollected} />
          )}
          {activeTab === 'collection' && <IngredientCollection />}
          {activeTab === 'log' && <ActivityLog />}
        </div>

        {/* Footer */}
        <footer className="bg-white/90 backdrop-blur-sm border-t border-emerald-200 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                🌿 Sistema de Forrageamento de Obojima
              </p>
              <p className="text-sm">
                Explore as terras mágicas e colete ingredientes únicos para suas poções
              </p>
            </div>
          </div>
        </footer>
      </div>
    </HydrationBoundary>
  );
}
