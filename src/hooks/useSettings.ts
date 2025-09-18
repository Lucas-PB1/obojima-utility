import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/settingsService';
import { DiceType } from '@/types/ingredients';

export interface SettingsState {
  defaultModifier: number | '';
  defaultBonusType: string;
  defaultBonusValue: number;
}

const defaultSettings: SettingsState = {
  defaultModifier: '',
  defaultBonusType: '',
  defaultBonusValue: 0
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(() => {
    const defaultModifier = settingsService.getDefaultModifier();
    const defaultBonusDice = settingsService.getDefaultBonusDice();
    
    setSettings({
      defaultModifier,
      defaultBonusType: defaultBonusDice?.type || '',
      defaultBonusValue: defaultBonusDice?.value || 0
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (newSettings: SettingsState) => {
    setIsLoading(true);
    
    try {
      settingsService.setDefaultModifier(newSettings.defaultModifier);
      
      const bonusDice = newSettings.defaultBonusType && newSettings.defaultBonusValue > 0
        ? { type: newSettings.defaultBonusType as DiceType, value: newSettings.defaultBonusValue }
        : null;
      
      settingsService.setDefaultBonusDice(bonusDice);
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      settingsService.clearSettings();
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    settings,
    isLoading,
    loadSettings,
    saveSettings,
    clearSettings,
    updateSetting
  };
}
