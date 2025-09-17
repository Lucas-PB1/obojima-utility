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

  // Carregar configurações padrão ao montar o componente
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

    // Atualizar tentativas restantes
    setRemainingAttempts(getRemainingAttemptsToday());
  }, []);

  const handleForage = async () => {
    // Verificar limite diário
    if (isDailyLimitReached()) {
      alert(`Você já atingiu o limite de ${GAME_CONFIG.DAILY_FORAGE_LIMIT} tentativas hoje! Volte amanhã para continuar forrageando.`);
      return;
    }

    setIsLoading(true);
    
    try {
      // Converter modificador para número (0 se vazio)
      const modifierValue = modifier === '' ? 0 : modifier;
      
      // Determinar raridade baseada no modificador e região
      const rarity = modifierValue >= 5 ? 'incomum' : 'comum';
      const isNative = true; // Assumindo que sempre é nativo da região
      
      // Calcular DC
      const dcResult = ingredientsService.calculateDC(rarity, isNative);
      
      // Fazer rolagem
      const { roll } = diceService.rollWithAdvantage(advantage);
      const totalRoll = diceService.calculateTotalRoll(roll, modifierValue, bonusDice || undefined);
      
      // Verificar se a rolagem está dentro da faixa de DC
      const success = totalRoll >= parseInt(dcResult.range.split('-')[0]);
      
      // Tentar obter ingrediente se sucesso
      let ingredient: Ingredient | null = null;
      if (success) {
        ingredient = await ingredientsService.getRandomIngredientFromRegion(region, rarity);
      }
      
      // Criar tentativa
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
      
      // Salvar tentativa
      // Incrementar contador diário
      incrementDailyCounter();
      
      addAttempt(attempt);
      
      // Se coletou ingrediente, adicionar à coleção
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
      
      // Atualizar tentativas restantes
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
            {/* Indicador de tentativas restantes */}
            <div className={`px-4 py-3 rounded-xl flex items-center space-x-3 shadow-md border transition-all duration-300 ${
              remainingAttempts > 0 
                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200/50 hover:shadow-lg' 
                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200/50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                remainingAttempts > 0 ? 'bg-emerald-200' : 'bg-red-200'
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
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl hover:from-emerald-200 hover:to-teal-200 transition-all duration-300 flex items-center space-x-2 shadow-md border border-emerald-200/50 hover:shadow-lg"
            >
              <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-sm">⚙️</span>
              </div>
              <span className="font-medium">Configurações</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Configuration */}
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

        {/* Right Column - Results */}
        <div className="space-y-6">
          <ForageResult result={lastResult} />
        </div>
      </div>

      {/* Collected Ingredients Summary */}
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

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={() => {
          // Recarregar configurações padrão
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
