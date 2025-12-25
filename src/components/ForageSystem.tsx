'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import ContentCard from '@/components/ui/ContentCard';
import SettingsModal from '@/components/SettingsModal';
import ForageForm from '@/components/forage/ForageForm';
import { CollectedIngredient } from '@/types/ingredients';
import { useForageSystem } from '@/hooks/useForageSystem';
import ForageResult from '@/components/forage/ForageResult';
import IngredientCard from '@/components/ui/IngredientCard';

interface ForageSystemProps {
  onIngredientCollected?: (ingredient: CollectedIngredient) => void;
}

export default function ForageSystem({ onIngredientCollected }: ForageSystemProps) {
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
    ingredients,    isSettingsOpen,
    openSettings,
    closeSettings,
    handleForage
  } = useForageSystem(onIngredientCollected);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistema de Forrageamento de Obojima"
        subtitle="Explore as terras mágicas e colete ingredientes únicos"
        icon="🌿"
        action={
          <div className="flex items-center gap-3">
            <div className={`px-6 py-3 rounded-2xl flex items-center gap-4 transition-all duration-500 border ${
              remainingAttempts > 0 
                ? 'bg-totoro-green/5 text-totoro-green border-totoro-green/20' 
                : 'bg-totoro-orange/5 text-totoro-orange border-totoro-orange/20 animate-pulse'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                remainingAttempts > 0 ? 'bg-totoro-green/10' : 'bg-totoro-orange/10'
              }`}>
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <div className="text-2xl font-black leading-none mb-0.5">{remainingAttempts}</div>
                <div className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Tentativas
                </div>
              </div>
            </div>
            
            <Button
              onClick={openSettings}
              variant="ghost"
              size="md"
              className="!bg-white/60 !rounded-2xl !px-5 !border-white group"
            >
              <span className="text-lg group-hover:rotate-90 transition-transform duration-500">⚙️</span>
              <span className="text-[10px] font-black uppercase tracking-widest ml-1">Ajustes</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
        <ContentCard title={`🎒 Ingredientes Coletados (${ingredients.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.slice(-6).map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                showActions={false}
              />
            ))}
          </div>
        </ContentCard>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />
    </div>
  );
}

