'use client';
import { useAuth } from '@/hooks/useAuth';
import { DiceType } from '@/types/ingredients';
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, SettingsState } from '@/constants/settings';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';

export function useSettings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    try {
      setIsLoading(true);
      const defaultModifier = await firebaseSettingsService.getDefaultModifier();
      const defaultBonusDice = await firebaseSettingsService.getDefaultBonusDice();
      const doubleForageTalent = await firebaseSettingsService.getDoubleForageTalent();
      const cauldronBonus = await firebaseSettingsService.getCauldronBonus();
      const potionBrewerTalent = await firebaseSettingsService.getPotionBrewerTalent();
      const potionBrewerLevel = await firebaseSettingsService.getPotionBrewerLevel();

      setSettings({
        defaultModifier,
        defaultBonusType: defaultBonusDice?.type || '',
        defaultBonusValue: defaultBonusDice?.value || 0,
        doubleForageTalent,
        cauldronBonus,
        potionBrewerTalent,
        potionBrewerLevel
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const unsubscribe = firebaseSettingsService.subscribeToSettings((firestoreSettings) => {
      const defaultBonusDice = firestoreSettings.defaultBonusDice;
      setSettings({
        defaultModifier: firestoreSettings.defaultModifier,
        defaultBonusType: defaultBonusDice?.type || '',
        defaultBonusValue: defaultBonusDice?.value || 0,
        doubleForageTalent: firestoreSettings.doubleForageTalent,
        cauldronBonus: firestoreSettings.cauldronBonus,
        potionBrewerTalent: firestoreSettings.potionBrewerTalent,
        potionBrewerLevel: firestoreSettings.potionBrewerLevel
      });
    });

    return () => unsubscribe();
  }, [isAuthenticated, authLoading]);

  const saveSettings = useCallback(
    async (newSettings: SettingsState) => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        await firebaseSettingsService.setDefaultModifier(newSettings.defaultModifier);
        const bonusDice =
          newSettings.defaultBonusType && newSettings.defaultBonusValue > 0
            ? {
                type: newSettings.defaultBonusType as DiceType,
                value: newSettings.defaultBonusValue
              }
            : null;
        await firebaseSettingsService.setDefaultBonusDice(bonusDice);
        await firebaseSettingsService.setDoubleForageTalent(newSettings.doubleForageTalent);
        await firebaseSettingsService.setCauldronBonus(newSettings.cauldronBonus);
        await firebaseSettingsService.setPotionBrewerTalent(newSettings.potionBrewerTalent);
        await firebaseSettingsService.setPotionBrewerLevel(newSettings.potionBrewerLevel);
        setSettings(newSettings);
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const clearSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await firebaseSettingsService.clearSettings();
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = useCallback(
    async (onSuccess?: () => void) => {
      try {
        await saveSettings(settings);
        onSuccess?.();
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
    },
    [saveSettings, settings]
  );

  const handleClear = useCallback(async () => {
    try {
      await clearSettings();
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
    }
  }, [clearSettings]);

  return {
    settings,
    isLoading: isLoading || authLoading,
    loadSettings,
    saveSettings,
    clearSettings,
    updateSetting,
    handleSave,
    handleClear
  };
}
