'use client';

import React, { useState } from 'react';
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
import { useIngredients } from '@/hooks/useIngredients';
import PageLayout from './ui/PageLayout';
import PageHeader from './ui/PageHeader';
import ForageForm from './forage/ForageForm';
import ForageResult from './forage/ForageResult';
import IngredientCard from './ui/IngredientCard';
import ContentCard from './ui/ContentCard';

interface ForageSystemProps {
  onIngredientCollected?: (ingredient: CollectedIngredient) => void;
}

export default function ForageSystem({ onIngredientCollected }: ForageSystemProps) {
  const [region, setRegion] = useState<RegionKey>('Gale Fields');
  const [testType, setTestType] = useState<TestType>('natureza');
  const [modifier, setModifier] = useState<number>(0);
  const [bonusDice, setBonusDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageType>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ForageAttempt | null>(null);
  
  const { ingredients, addIngredient, addAttempt } = useIngredients();

  const handleForage = async () => {
    setIsLoading(true);
    
    try {
      // Determinar raridade baseada no modificador e região
      const rarity = modifier >= 5 ? 'incomum' : 'comum';
      const isNative = true; // Assumindo que sempre é nativo da região
      
      // Calcular DC
      const dc = ingredientsService.calculateDC(rarity, isNative);
      
      // Fazer rolagem
      const { roll } = diceService.rollWithAdvantage(advantage);
      const totalRoll = diceService.calculateTotalRoll(roll, modifier, bonusDice || undefined);
      
      const success = totalRoll >= dc;
      
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
        modifier,
        bonusDice: bonusDice || undefined,
        advantage,
        dc,
        roll: totalRoll,
        success,
        ingredient: ingredient || undefined,
        rarity
      };
      
      // Salvar tentativa
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
    </PageLayout>
  );
}
