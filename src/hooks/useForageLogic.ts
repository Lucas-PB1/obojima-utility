import { useState, useEffect, useCallback } from 'react';
import {
  RegionKey,
  TestType,
  DiceType,
  AdvantageType,
  ForageAttempt,
  CollectedIngredient
} from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';
import { diceService } from '@/services/diceService';
import { useSettings } from '@/components/SettingsModal';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { GAME_CONFIG } from '@/config/gameConfig';

export function useForageLogic() {
  const [region, setRegion] = useState<RegionKey>('Gale Fields');
  const [testType, setTestType] = useState<TestType>('natureza');
  const [modifier, setModifier] = useState<number | ''>('');
  const [bonusDice, setBonusDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageType>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ForageAttempt | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(
    GAME_CONFIG.DAILY_FORAGE_LIMIT
  );

  const { settings } = useSettings();

  useEffect(() => {
    if (settings.defaultModifier !== '') {
      setModifier(settings.defaultModifier);
    }

    if (settings.defaultBonusType && settings.defaultBonusValue > 0) {
      setBonusDice({
        type: settings.defaultBonusType as DiceType,
        value: settings.defaultBonusValue
      });
    }
  }, [settings.defaultModifier, settings.defaultBonusType, settings.defaultBonusValue]);

  useEffect(() => {
    const loadRemainingAttempts = async () => {
      const remaining = await firebaseStorageService.getRemainingAttemptsToday();
      setRemainingAttempts(remaining);
    };

    loadRemainingAttempts();
  }, []);

  const determineRarityAndSuccess = (totalRoll: number) => {
    const rollRanges = [
      { min: 10, max: 15, rarity: 'comum' as const, isNative: true, dc: 10 },
      { min: 16, max: 20, rarity: 'incomum' as const, isNative: true, dc: 16 },
      { min: 21, max: 25, rarity: 'incomum' as const, isNative: false, dc: 21 },
      { min: 26, max: 30, rarity: 'raro' as const, isNative: false, dc: 26, rareChance: 0.3 },
      {
        min: 31,
        max: Infinity,
        rarity: 'unico' as const,
        isNative: false,
        dc: 31,
        uniqueChance: 0.1
      }
    ];

    for (const range of rollRanges) {
      if (totalRoll >= range.min && totalRoll <= range.max) {
        const isSuccess = totalRoll >= range.min;

        if (!isSuccess) {
          return { rarity: 'comum' as const, success: false, dcResult: { dc: 10, range: '10-15' } };
        }

        let finalRarity = range.rarity;

        if (range.rareChance && Math.random() > range.rareChance) {
          finalRarity = 'incomum';
        }

        if (range.uniqueChance && Math.random() > range.uniqueChance) {
          finalRarity = Math.random() <= 0.3 ? 'raro' : 'incomum';
        }

        return {
          rarity: finalRarity,
          success: true,
          dcResult: {
            dc: range.dc,
            range: `${range.min}-${range.max === Infinity ? '+' : range.max}`
          },
          isNative: range.isNative
        };
      }
    }

    return { rarity: 'comum' as const, success: false, dcResult: { dc: 10, range: '10-15' } };
  };

  const getIngredientByRarity = useCallback(
    async (rarity: 'comum' | 'incomum' | 'raro' | 'unico', totalRoll: number) => {
      const ingredientGetters = {
        raro: () => ingredientsService.getRandomRareIngredient(),
        unico: () => ingredientsService.getRandomUniqueIngredient(),
        incomum:
          totalRoll >= 21
            ? () => ingredientsService.getRandomUncommonIngredientFromAnyRegion()
            : () => ingredientsService.getRandomIngredientFromRegion(region, rarity),
        comum: () => ingredientsService.getRandomIngredientFromRegion(region, rarity)
      };

      return (await ingredientGetters[rarity]?.()) || null;
    },
    [region]
  );

  const executeForage = useCallback(
    async (
      onIngredientCollected?: (ingredient: CollectedIngredient) => void,
      addIngredient?: (ingredient: CollectedIngredient) => void,
      addAttempt?: (attempt: ForageAttempt) => void
    ) => {
      const currentRemaining = await firebaseStorageService.getRemainingAttemptsToday();
      if (currentRemaining <= 0) {
        alert(
          `Você já atingiu o limite de ${GAME_CONFIG.DAILY_FORAGE_LIMIT} tentativas hoje! Volte amanhã para continuar forrageando.`
        );
        setRemainingAttempts(0);
        return;
      }

      setIsLoading(true);

      try {
        const modifierValue = modifier === '' ? 0 : modifier;
        const { roll } = diceService.rollWithAdvantage(advantage);
        const totalRoll = diceService.calculateTotalRoll(
          roll,
          modifierValue,
          bonusDice || undefined
        );

        const { rarity, success, dcResult } = determineRarityAndSuccess(totalRoll);

        const ingredient = success ? await getIngredientByRarity(rarity, totalRoll) : null;

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

        addAttempt?.(attempt);

        if (success && ingredient) {
          const doubleForageTalent = await firebaseSettingsService.getDoubleForageTalent();
          const shouldDouble = doubleForageTalent && (rarity === 'comum' || rarity === 'incomum');
          const quantity = shouldDouble ? 2 : 1;

          const collectedIngredient: CollectedIngredient = {
            id: Date.now().toString() + '_ingredient',
            ingredient,
            quantity,
            collectedAt: new Date(),
            used: false,
            forageAttemptId: attempt.id
          };

          addIngredient?.(collectedIngredient);
          onIngredientCollected?.(collectedIngredient);
        }

        setLastResult(attempt);
        const remaining = await firebaseStorageService.getRemainingAttemptsToday();
        setRemainingAttempts(remaining);
      } catch (error) {
        console.error('Erro no forrageamento:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [region, testType, modifier, bonusDice, advantage, getIngredientByRarity]
  );

  return {
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
    executeForage
  };
}
