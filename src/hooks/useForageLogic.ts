'use client';
import { logger } from '@/utils/logger';
import { useSettings } from '@/hooks/useSettings';
import { GAME_CONFIG } from '@/config/gameConfig';
import { diceService } from '@/services/diceService';
import { TEST_TYPE_OPTIONS } from '@/constants/forage';
import { useState, useEffect, useCallback } from 'react';
import { ingredientsService } from '@/services/ingredientsService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import { determineForageRarity, normalizeModifier } from '@/features/forage/domain/forageRules';

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
  const [region, setRegion] = useState<RegionKey | ''>(() => {
    if (settings.defaultRegion) return settings.defaultRegion as RegionKey;
    const keys = ingredientsService.getRegionKeys();
    return keys.length > 0 ? (keys[0] as RegionKey) : '';
  });
  const [testType, setTestType] = useState<TestType | ''>(() => {
    if (settings.defaultTestType) return settings.defaultTestType;
    return TEST_TYPE_OPTIONS.length > 0 ? (TEST_TYPE_OPTIONS[0].value as TestType) : '';
  });
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
        const modifierValue = normalizeModifier(modifier);
        const { roll } = diceService.rollWithAdvantage(advantage);
        const totalRoll = diceService.calculateTotalRoll(
          roll,
          modifierValue,
          bonusDice || undefined
        );

        const { rarity, success, dcResult } = determineForageRarity(totalRoll);

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
