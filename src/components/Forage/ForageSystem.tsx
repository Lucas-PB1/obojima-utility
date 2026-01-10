'use client';
import React from 'react';
import { Button, PageHeader, ContentCard, IngredientCard } from '@/components/ui';
import { ForageForm } from './ForageForm';
import { ForageResult } from './ForageResult';
import { CollectedIngredient } from '@/types/ingredients';
import { useForageSystem } from '@/hooks/useForageSystem';
import { SettingsModal } from '@/components/System';

interface ForageSystemProps {
  onIngredientCollected?: (ingredient: CollectedIngredient) => void;
}

import { useTranslation } from '@/hooks/useTranslation';

export function ForageSystem({ onIngredientCollected }: ForageSystemProps) {
  const { t } = useTranslation();
  const {
    region,
    setRegion,
    testType,
    setTestType,
    modifier,
    setModifier,
    bonusDice,
    setBonusDice,
    advantage,
    setAdvantage,
    isLoading,
    lastResult,
    remainingAttempts,
    ingredients,
    isSettingsOpen,
    openSettings,
    closeSettings,
    handleForage
  } = useForageSystem(onIngredientCollected);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('forage.title')}
        subtitle={t('forage.subtitle')}
        icon="🌿"
        action={
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div
              className={`px-3 py-2 md:px-6 md:py-3 rounded-2xl flex items-center justify-center sm:justify-start gap-2 md:gap-4 transition-all duration-500 border ${
                remainingAttempts > 0
                  ? 'bg-totoro-green/5 text-totoro-green border-totoro-green/20'
                  : 'bg-totoro-orange/5 text-totoro-orange border-totoro-orange/20 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${
                    remainingAttempts > 0 ? 'bg-totoro-green/10' : 'bg-totoro-orange/10'
                  }`}
                >
                  <span className="text-lg md:text-xl">🎯</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xl md:text-2xl font-black leading-none mb-0.5">
                    {remainingAttempts}
                  </div>
                  <div className="text-[7px] md:text-[9px] font-black uppercase tracking-wider opacity-60 leading-none">
                    {t('forage.attempts.label')}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={openSettings}
              variant="secondary"
              size="md"
              className="!rounded-2xl !px-3 md:!px-5 w-full sm:w-auto hover:bg-white/50 h-full min-h-[50px] sm:min-h-0"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg group-hover:rotate-90 transition-transform duration-500 shrink-0">
                  ⚙️
                </span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                  {t('forage.settings.button')}
                </span>
              </div>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <ForageForm
          region={region}
          setRegion={setRegion}
          testType={testType}
          setTestType={setTestType}
          modifier={modifier}
          setModifier={setModifier}
          bonusDice={bonusDice}
          setBonusDice={setBonusDice}
          advantage={advantage}
          setAdvantage={setAdvantage}
          onForage={handleForage}
          isLoading={isLoading}
          remainingAttempts={remainingAttempts}
        />

        <div className="space-y-6">
          <ForageResult result={lastResult} />
        </div>
      </div>

      {ingredients.length > 0 && (
        <ContentCard title={t('forage.collected.title', ingredients.length)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.slice(-6).map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} showActions={false} />
            ))}
          </div>
        </ContentCard>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}
