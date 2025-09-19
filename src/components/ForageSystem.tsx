'use client';

import React, { useState, useEffect } from 'react';
import { 
  RegionKey, 
  TestType, 
  DiceType, 
  AdvantageType, 
  ForageAttempt,
  CollectedIngredient,
  Ingredient
} from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';
import { diceService } from '@/services/diceService';
import { settingsService } from '@/services/settingsService';
import { useIngredients } from '@/hooks/useIngredients';
import { isDailyLimitReached, incrementDailyCounter, getRemainingAttemptsToday, GAME_CONFIG } from '@/config/gameConfig';
import PageLayout from './ui/PageLayout';
import PageHeader from './ui/PageHeader';
import ForageForm from './forage/ForageForm';
import ForageResult from './forage/ForageResult';
import IngredientCard from './ui/IngredientCard';
import SettingsModal from './SettingsModal';
import ContentCard from './ui/ContentCard';
import Button from './ui/Button';

interface ForageSystemProps {
  onIngredientCollected?: (ingredient: CollectedIngredient) => void;
}

export default function ForageSystem({ onIngredientCollected }: ForageSystemProps) {
  const [region, setRegion] = useState<RegionKey>('Gale Fields');
  const [testType, setTestType] = useState<TestType>('natureza');
  const [modifier, setModifier] = useState<number | ''>('');
  const [bonusDice, setBonusDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageType>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ForageAttempt | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(GAME_CONFIG.DAILY_FORAGE_LIMIT);
  
  const { ingredients, addIngredient, addAttempt } = useIngredients();

  useEffect(() => {
    const defaultModifier = settingsService.getDefaultModifier();
    const defaultBonusDice = settingsService.getDefaultBonusDice();
    
    if (defaultModifier !== '') {
      setModifier(defaultModifier);
    }
    
    if (defaultBonusDice) {
      setBonusDice({
        type: defaultBonusDice.type as DiceType,
        value: defaultBonusDice.value
      });
    }

    setRemainingAttempts(getRemainingAttemptsToday());
  }, []);

  const handleForage = async () => {
    if (isDailyLimitReached()) {
      alert(`Você já atingiu o limite de ${GAME_CONFIG.DAILY_FORAGE_LIMIT} tentativas hoje! Volte amanhã para continuar forrageando.`);
      return;
    }

    setIsLoading(true);
    
    try {
      const modifierValue = modifier === '' ? 0 : modifier;
      const isNative = true;
      
      const { roll } = diceService.rollWithAdvantage(advantage);
      const totalRoll = diceService.calculateTotalRoll(roll, modifierValue, bonusDice || undefined);
      
      // Determinar a raridade baseada no resultado da rolagem
      let rarity: 'comum' | 'incomum' | 'raro' | 'unico' = 'comum';
      let dcResult = ingredientsService.calculateDC('comum', isNative);
      let success = false;
      
      // Lógica de sucesso baseada na faixa da rolagem
      if (totalRoll >= 10 && totalRoll <= 15) {
        // Faixa 10-15: Ingrediente comum da região
        rarity = 'comum';
        dcResult = ingredientsService.calculateDC('comum', isNative);
        success = true;
      } else if (totalRoll >= 16 && totalRoll <= 20) {
        // Faixa 16-20: Ingrediente incomum da região
        rarity = 'incomum';
        dcResult = ingredientsService.calculateDC('incomum', isNative);
        success = true;
      } else if (totalRoll >= 21 && totalRoll <= 25) {
        // Faixa 21-25: Ingrediente incomum de qualquer região (sorte)
        rarity = 'incomum';
        dcResult = ingredientsService.calculateDC('incomum', false); // Não nativo
        success = true;
      } else if (totalRoll >= 26 && totalRoll <= 30) {
        // Faixa 26-30: Chance de ingrediente raro (evento especial)
        const rareChance = Math.random();
        if (rareChance <= 0.3) { // 30% de chance
          rarity = 'raro';
          dcResult = { dc: 26, range: '26-30' };
          success = true;
        } else {
          // 70% de chance de fallback para incomum de qualquer região
          rarity = 'incomum';
          dcResult = { dc: 21, range: '21-25' };
          success = true;
        }
      } else if (totalRoll >= 31) {
        // Faixa 31+: Chance de ingrediente único (evento raríssimo)
        const uniqueChance = Math.random();
        if (uniqueChance <= 0.1) { // 10% de chance
          rarity = 'unico';
          dcResult = { dc: 31, range: '31+' };
          success = true;
        } else {
          // 90% de chance de fallback para raro
          const rareChance = Math.random();
          if (rareChance <= 0.3) { // 30% de chance de raro
            rarity = 'raro';
            dcResult = { dc: 26, range: '26-30' };
            success = true;
          } else {
            // 70% de chance de fallback para incomum de qualquer região
            rarity = 'incomum';
            dcResult = { dc: 21, range: '21-25' };
            success = true;
          }
        }
      } else {
        // Abaixo de 10: Falha
        dcResult = { dc: 10, range: '10-15' };
        success = false;
      }
      
      let ingredient: Ingredient | null = null;
      if (success) {
        if (rarity === 'raro') {
          // Ingrediente raro (evento especial)
          ingredient = await ingredientsService.getRandomRareIngredient();
        } else if (rarity === 'unico') {
          // Ingrediente único (evento raríssimo)
          ingredient = await ingredientsService.getRandomUniqueIngredient();
        } else if (rarity === 'incomum' && (totalRoll >= 21)) {
          // Ingrediente incomum de qualquer região (sorte ou fallback)
          ingredient = await ingredientsService.getRandomUncommonIngredientFromAnyRegion();
        } else {
          // Ingrediente da região específica (comum ou incomum da região)
          ingredient = await ingredientsService.getRandomIngredientFromRegion(region, rarity);
        }
      }
      
      const attempt: ForageAttempt = {
        id: Date.now().toString(),
        timestamp: new Date(),
        region,
        testType,
        modifier: modifierValue,
        bonusDice: bonusDice || undefined,
        advantage,
        dc: dcResult.dc,
        dcRange: dcResult.range,
        roll: totalRoll,
        success,
        ingredient: ingredient || undefined,
        rarity
      };
      
      incrementDailyCounter();
      
      addAttempt(attempt);
      
      if (success && ingredient) {
        const collectedIngredient: CollectedIngredient = {
          id: Date.now().toString() + '_ingredient',
          ingredient,
          quantity: 1,
          collectedAt: new Date(),
          used: false,
          forageAttemptId: attempt.id
        };
        
        addIngredient(collectedIngredient);
        onIngredientCollected?.(collectedIngredient);
      }
      
      setLastResult(attempt);
      
      setRemainingAttempts(getRemainingAttemptsToday());
      
    } catch (error) {
      console.error('Erro no forrageamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Sistema de Forrageamento de Obojima"
        subtitle="Explore as terras mágicas e colete ingredientes únicos"
        icon="🌿"
        action={
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-3 rounded-xl flex items-center space-x-3 shadow-md border transition-all duration-300 ${
              remainingAttempts > 0 
                ? 'bg-totoro-green/20 text-totoro-green border-totoro-green/30 hover:shadow-lg' 
                : 'bg-gradient-to-r from-totoro-orange/20 to-totoro-orange/30 text-totoro-orange border-totoro-orange/30'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                remainingAttempts > 0 ? 'bg-totoro-green/30' : 'bg-totoro-orange/30'
              }`}>
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <div className="text-lg font-bold">{remainingAttempts}</div>
                <div className="text-xs opacity-80">
                  tentativa{remainingAttempts !== 1 ? 's' : ''} restante{remainingAttempts !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <span className="text-sm">⚙️</span>
              <span>Configurações</span>
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
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={() => {
          const defaultModifier = settingsService.getDefaultModifier();
          const defaultBonusDice = settingsService.getDefaultBonusDice();
          
          if (defaultModifier !== '') {
            setModifier(defaultModifier);
          } else {
            setModifier('');
          }
          
          if (defaultBonusDice) {
            setBonusDice({
              type: defaultBonusDice.type as DiceType,
              value: defaultBonusDice.value
            });
          } else {
            setBonusDice(null);
          }
        }}
      />
    </PageLayout>
  );
}
