'use client';
import { useMemo, useState } from 'react';
import { logger } from '@/utils/logger';
import { useHome } from '@/hooks/useHome';
import { useProgression } from '@/hooks/useProgression';
import { SocialProvider, useSocialData } from '@/contexts/SocialContext';
import { SocialHub } from '@/components/Social';
import { ActivityLog } from '@/components/System';
import { ForageSystem } from '@/components/Forage/ForageSystem';
import { PageLayout, MobileNav } from '@/components/ui';
import { IngredientCollection } from '@/components/Ingredients';
import { PotionBrewing, CreatedPotionCollection, RecipeCollection } from '@/components/Potions';
import { PlayerLevelBadge, ProgressionModal, ProgressionToasts } from '@/components/Progression';
import { AppLoadingScreen } from '@/components/AppShell/AppLoadingScreen';
import { AppShellFrame, RecentItemsHighlight } from '@/components/AppShell/AppShellFrame';
import { MainTabNav } from '@/components/AppShell/MainTabNav';

function HomeShell() {
  const {
    user,
    userProfile,
    authLoading,
    isAuthenticated,
    logout,
    isInitialized,
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
    availableIngredients,
    attempts,
    handleIngredientsUsed
  } = useHome();
  const { attentionCount } = useSocialData();
  const { snapshot, events, dismissEvent } = useProgression(attempts);
  const [progressionOpen, setProgressionOpen] = useState(false);

  const tabsWithBadges = useMemo(
    () =>
      tabs.map((tab) =>
        tab.id === 'social' && activeTab !== 'social' ? { ...tab, badge: attentionCount } : tab
      ),
    [tabs, activeTab, attentionCount]
  );

  if (!isClient || authLoading || !isAuthenticated || !isInitialized) {
    return <AppLoadingScreen isInitialized={isInitialized} />;
  }

  return (
    <AppShellFrame
      user={user}
      userProfile={userProfile}
      onLogout={logout}
      headerAside={
        <>
          <PlayerLevelBadge snapshot={snapshot} onClick={() => setProgressionOpen(true)} />
          <RecentItemsHighlight
            count={recentlyCollected.length}
            onViewCollection={handleViewCollection}
          />
        </>
      }
      navigation={
        <MainTabNav tabs={tabsWithBadges} activeTab={activeTab} onTabChange={handleTabChange} />
      }
      mobileNavigation={
        <MobileNav tabs={tabsWithBadges} activeTab={activeTab} onTabChange={handleTabChange} />
      }
    >
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

      <ProgressionModal
        isOpen={progressionOpen}
        onClose={() => setProgressionOpen(false)}
        snapshot={snapshot}
      />
      <ProgressionToasts
        events={events}
        onDismiss={dismissEvent}
        onOpen={() => setProgressionOpen(true)}
      />
    </AppShellFrame>
  );
}

export default function HomeContent() {
  return (
    <SocialProvider>
      <HomeShell />
    </SocialProvider>
  );
}
