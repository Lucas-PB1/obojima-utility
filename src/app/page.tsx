'use client';

import React from 'react';
import ForageSystem from '@/components/ForageSystem';
import IngredientCollection from '@/components/IngredientCollection';
import { PotionBrewing } from '@/components/PotionBrewing';
import { CreatedPotionCollection } from '@/components/CreatedPotionCollection';
import { RecipeCollection } from '@/components/RecipeCollection';
import ActivityLog from '@/components/ActivityLog';

import PageLayout from '@/components/ui/PageLayout';
import Button from '@/components/ui/Button';
import { useHome } from '@/hooks/useHome';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
  const { t } = useTranslation();
  const {
    user,
    authLoading,
    isAuthenticated,
    logout,
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
    availableIngredients,
    handleIngredientsUsed
  } = useHome();
  const { isInitialized } = useSettings();

  if (!isClient || authLoading || !isAuthenticated || !isInitialized) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <main className="text-center">
          <div className="text-6xl mb-6 animate-float">🌿</div>
          {isInitialized ? (
            <>
              <h2 className="text-3xl font-serif font-bold text-totoro-gray mb-3 pb-2 border-b-2 border-totoro-blue/10 inline-block">
                {t('app.loading.title')}
              </h2>
              <p className="text-totoro-blue/70 font-semibold uppercase tracking-[0.2em] text-[10px] font-sans">
                {t('app.loading.subtitle')}
              </p>
            </>
          ) : (
            <div className="h-20 opacity-0"></div>
          )}
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-mesh bg-topo transition-all duration-500">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-totoro-gray tracking-tight transition-all duration-300">
                🌿 {t('app.header.title')}
              </h1>
              <p className="text-[10px] font-semibold text-totoro-blue/70 uppercase tracking-[0.2em] font-sans -mt-1">
                {t('app.header.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {recentlyCollected.length > 0 && (
                <div className="hidden lg:flex items-center bg-gradient-to-r from-totoro-yellow/20 to-totoro-orange/20 border border-totoro-yellow/30 px-4 py-2 rounded-2xl gap-3 animate-bounce-in shadow-sm shadow-totoro-yellow/10">
                  <div className="relative">
                    <span className="text-xl">🎁</span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-totoro-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {recentlyCollected.length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-totoro-orange uppercase tracking-wider leading-none mb-1">
                      {t('app.notification.newItems')}
                    </span>
                    <button
                      onClick={handleViewCollection}
                      className="text-[10px] text-totoro-gray/70 hover:text-totoro-blue font-bold text-left transition-colors"
                    >
                      {t('app.notification.viewCollection')}
                    </button>
                  </div>
                </div>
              )}

              {user && (
                <div className="flex items-center bg-totoro-blue/5 rounded-2xl border border-totoro-blue/10 pl-4 pr-2 py-1.5 gap-3 shadow-sm transition-all hover:bg-white hover:shadow-md hover:border-totoro-blue/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-totoro-blue/10 flex items-center justify-center text-xs text-totoro-blue shadow-inner ring-1 ring-white/50">
                      👤
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-totoro-gray max-w-[120px] sm:max-w-[180px] truncate font-sans">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="!px-3 !py-1.5 !rounded-xl !text-[10px] !font-black hover:!bg-totoro-orange/10 hover:!text-totoro-orange transition-all"
                  >
                    {t('app.user.logout')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <nav className="mt-6 flex items-center justify-center overflow-x-auto pb-1 no-scrollbar">
            <div className="flex p-1.5 bg-totoro-blue/10 rounded-2xl border border-totoro-blue/10 backdrop-blur-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 select-none font-sans
                    ${
                      activeTab === tab.id
                        ? 'text-white shadow-md'
                        : 'text-totoro-gray/50 hover:text-totoro-blue hover:bg-white/50'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-sm opacity-80">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-totoro-blue rounded-xl animate-bounce-in shadow-[0_4px_15px_rgba(74,144,226,0.3)] border-t border-white/20"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        <PageLayout variant="simple" className="!py-4">
          {activeTab === 'forage' && (
            <ForageSystem onIngredientCollected={handleIngredientCollected} />
          )}
          {activeTab === 'collection' && <IngredientCollection />}
          {activeTab === 'potions' && (
            <PotionBrewing
              availableIngredients={availableIngredients}
              onPotionCreated={(recipe) => {
                console.log('Poção criada:', recipe);
              }}
              onIngredientsUsed={handleIngredientsUsed}
            />
          )}
          {activeTab === 'created-potions' && <CreatedPotionCollection />}
          {activeTab === 'recipes' && <RecipeCollection />}
          {activeTab === 'log' && <ActivityLog />}
        </PageLayout>
      </div>

      <footer className="py-6 border-t border-totoro-blue/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-totoro-blue/20 uppercase tracking-[0.4em]">
            {t('app.footer.text')}
          </p>
        </div>
      </footer>
    </main>
  );
}
