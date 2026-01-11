'use client';
import { logger } from '@/utils/logger';
import { useSettings } from '@/hooks/useSettings';
import { GAME_CONFIG } from '@/config/gameConfig';
import { diceService } from '@/services/diceService';
import { useState, useEffect, useCallback } from 'react';
import { ingredientsService } from '@/services/ingredientsService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';

import {
  RegionKey,
  TestType,
  DiceType,
  AdvantageType,
  ForageAttempt,
  CollectedIngredient
} from '@/types/ingredients';
import Swal from 'sweetalert2';
import { useTranslation } from '@/hooks/useTranslation';

export function useForageLogic() {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [region, setRegion] = useState<RegionKey | ''>((settings.defaultRegion as RegionKey) || '');
  const [testType, setTestType] = useState<TestType | ''>(settings.defaultTestType || '');
  const [modifier, setModifier] = useState<number | ''>('');
  const [bonusDice, setBonusDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageType>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ForageAttempt | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(
    GAME_CONFIG.DAILY_FORAGE_LIMIT
  );

  useEffect(() => {
    if (settings.defaultRegion) {
      setRegion(settings.defaultRegion as RegionKey);
    }
    if (settings.defaultTestType) {
      setTestType(settings.defaultTestType);
    }

    if (settings.defaultModifier !== '') {
      setModifier(settings.defaultModifier);
    }

    if (settings.defaultBonusType && settings.defaultBonusValue > 0) {
      setBonusDice({
        type: settings.defaultBonusType as DiceType,
        value: settings.defaultBonusValue
      });
    }
  }, [
    settings.defaultRegion,
    settings.defaultTestType,
    settings.defaultModifier,
    settings.defaultBonusType,
    settings.defaultBonusValue
  ]);

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
      const language = settings.language || 'pt';
      const ingredientGetters = {
        raro: () => ingredientsService.getRandomRareIngredient(language),
        unico: () => ingredientsService.getRandomUniqueIngredient(language),
        incomum:
          totalRoll >= 21
            ? () => ingredientsService.getRandomUncommonIngredientFromAnyRegion(language)
            : () =>
                ingredientsService.getRandomIngredientFromRegion(
                  region as RegionKey,
                  rarity,
                  language
                ),
        comum: () =>
          ingredientsService.getRandomIngredientFromRegion(region as RegionKey, rarity, language)
      };

      return (await ingredientGetters[rarity]?.()) || null;
    },
    [region, settings.language]
  );

  const executeForage = useCallback(
    async (
      onIngredientCollected?: (ingredient: CollectedIngredient) => void,
      addIngredient?: (ingredient: CollectedIngredient) => void,
      addAttempt?: (attempt: ForageAttempt) => void
    ) => {
      const currentRemaining = await firebaseStorageService.getRemainingAttemptsToday();
      if (currentRemaining <= 0) {
        Swal.fire({
          title: t('alerts.forage.limit.title'),
          text: t('alerts.forage.limit.text', GAME_CONFIG.DAILY_FORAGE_LIMIT),
          icon: 'warning',
          confirmButtonText: t('common.confirm')
        });
        setRemainingAttempts(0);
        return;
      }

      if (!region || !testType) {
        Swal.fire({
          title: t('alerts.forage.validation.title'),
          text: t('alerts.forage.validation.text'),
          icon: 'warning',
          confirmButtonText: t('common.confirm')
        });
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
          region: region as RegionKey,
          testType: testType as TestType,
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
        logger.error('Erro no forrageamento:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [region, testType, modifier, bonusDice, advantage, getIngredientByRarity, t]
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
