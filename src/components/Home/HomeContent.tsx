'use client';
import { logger } from '@/utils/logger';
import { useHome } from '@/hooks/useHome';
import { SocialHub } from '@/components/Social';
import { ActivityLog } from '@/components/System';
import { useSettings } from '@/hooks/useSettings';
import { ForageSystem } from '@/components/Forage/ForageSystem';
import { PageLayout, Button, MobileNav } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { IngredientCollection } from '@/components/Ingredients';
import { PotionBrewing, CreatedPotionCollection, RecipeCollection } from '@/components/Potions';
import { motion } from 'motion/react';
import { Gift, Leaf, LogOut, User } from 'lucide-react';

export default function HomeContent() {
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
          <motion.div
            className="mb-6 flex justify-center text-totoro-blue"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Leaf size={56} strokeWidth={1.8} />
          </motion.div>
          {isInitialized ? (
            <>
              <h2 className="text-3xl font-serif font-bold text-totoro-gray mb-3 pb-2 shadow-[inset_0_-2px_0_rgba(var(--primary-rgb),0.1)] inline-block">
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
      <header className="sticky top-0 z-50 glass-panel subtle-divider-bottom shadow-[var(--shadow-soft)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold text-totoro-gray tracking-tight transition-all duration-300">
                <span className="inline-flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-totoro-blue" />
                  {t('app.header.title')}
                </span>
              </h1>
              <p className="text-[8px] md:text-[10px] font-semibold text-totoro-blue/70 uppercase tracking-[0.2em] font-sans -mt-1">
                {t('app.header.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {recentlyCollected.length > 0 && (
                <motion.div
                  className="hidden lg:flex items-center bg-linear-to-r from-totoro-yellow/20 to-totoro-orange/20 px-4 py-2 rounded-lg gap-3 shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.18),var(--shadow-soft)]"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                >
                  <div className="relative">
                    <Gift className="h-5 w-5 text-totoro-orange" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-totoro-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[color:var(--surface-raised)]">
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
                </motion.div>
              )}

              {user && (
                <div className="flex items-center bg-totoro-blue/5 rounded-lg border border-transparent pl-4 pr-2 py-1.5 gap-3 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12),var(--shadow-soft)] transition-all hover:bg-[var(--surface-hover)] hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.22),var(--shadow-soft)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-totoro-blue/10 flex items-center justify-center text-xs text-totoro-blue shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.16)]">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-totoro-gray max-w-[80px] sm:max-w-[180px] truncate font-sans">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="px-3! py-1.5! rounded-lg! text-[10px]! font-black hover:bg-totoro-orange/10 hover:text-totoro-orange transition-all"
                    title={t('app.user.logout')}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('app.user.logout')}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <nav className="mt-6 hidden md:flex items-center justify-center overflow-x-auto pb-1 no-scrollbar">
            <div className="flex p-1.5 bg-totoro-blue/10 rounded-lg backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 select-none font-sans whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? 'text-white shadow-md'
                        : 'text-totoro-gray/55 hover:text-totoro-blue hover:bg-[var(--surface-hover)]'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="opacity-80">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="desktop-nav-active"
                      className="absolute inset-0 bg-totoro-blue rounded-lg shadow-[0_14px_28px_-18px_rgba(var(--primary-rgb),0.85),inset_0_1px_0_rgba(255,255,255,0.24)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-0">
        <PageLayout variant="simple" className="py-4!">
          {activeTab === 'forage' && (
            <ForageSystem onIngredientCollected={handleIngredientCollected} />
          )}
          {activeTab === 'collection' && <IngredientCollection />}
          {activeTab === 'potions' && (
            <PotionBrewing
              availableIngredients={availableIngredients}
              onPotionCreated={(recipe) => {
                logger.info('Poção criada:', JSON.stringify(recipe));
              }}
              onIngredientsUsed={handleIngredientsUsed}
            />
          )}
          {activeTab === 'created-potions' && <CreatedPotionCollection />}
          {activeTab === 'recipes' && <RecipeCollection />}
          {activeTab === 'social' && <SocialHub />}
          {activeTab === 'log' && <ActivityLog />}
        </PageLayout>
      </div>

      <MobileNav tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <footer className="pt-6 pb-32 md:py-6 subtle-divider-top">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-totoro-blue/20 uppercase tracking-[0.4em]">
            {t('app.footer.text')}
          </p>
        </div>
      </footer>
    </main>
  );
}
