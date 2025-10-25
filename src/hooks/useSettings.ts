import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/settingsService';
import { DiceType } from '@/types/ingredients';

/**
 * Interface que define o estado das configurações do sistema
 */
export interface SettingsState {
  defaultModifier: number | '';
  defaultBonusType: string;
  defaultBonusValue: number;
  doubleForageTalent: boolean;
  cauldronBonus: boolean;
  potionBrewerTalent: boolean;
  potionBrewerLevel: number;
}

const defaultSettings: SettingsState = {
  defaultModifier: '',
  defaultBonusType: '',
  defaultBonusValue: 0,
  doubleForageTalent: false,
  cauldronBonus: false,
  potionBrewerTalent: false,
  potionBrewerLevel: 1
};

/**
 * Hook para gerenciar as configurações do sistema Obojima
 * 
 * @description
 * Este hook encapsula toda a lógica de gerenciamento de configurações, incluindo:
 * - Carregamento de configurações salvas
 * - Salvamento de novas configurações
 * - Limpeza de configurações
 * - Atualização individual de configurações
 * 
 */
export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Carrega as configurações salvas do localStorage
   */
  const loadSettings = useCallback(() => {
    const defaultModifier = settingsService.getDefaultModifier();
    const defaultBonusDice = settingsService.getDefaultBonusDice();
    const doubleForageTalent = settingsService.getDoubleForageTalent();
    const cauldronBonus = settingsService.getCauldronBonus();
    const potionBrewerTalent = settingsService.getPotionBrewerTalent();
    const potionBrewerLevel = settingsService.getPotionBrewerLevel();
    
    setSettings({
      defaultModifier,
      defaultBonusType: defaultBonusDice?.type || '',
      defaultBonusValue: defaultBonusDice?.value || 0,
      doubleForageTalent,
      cauldronBonus,
      potionBrewerTalent,
      potionBrewerLevel
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Salva as configurações no localStorage
   * 
   * @param newSettings - Novas configurações a serem salvas
   */
  const saveSettings = useCallback(async (newSettings: SettingsState) => {
    setIsLoading(true);
    
    try {
      settingsService.setDefaultModifier(newSettings.defaultModifier);
      
      const bonusDice = newSettings.defaultBonusType && newSettings.defaultBonusValue > 0
        ? { type: newSettings.defaultBonusType as DiceType, value: newSettings.defaultBonusValue }
        : null;
      
      settingsService.setDefaultBonusDice(bonusDice);
      settingsService.setDoubleForageTalent(newSettings.doubleForageTalent);
      settingsService.setCauldronBonus(newSettings.cauldronBonus);
      settingsService.setPotionBrewerTalent(newSettings.potionBrewerTalent);
      settingsService.setPotionBrewerLevel(newSettings.potionBrewerLevel);
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Limpa todas as configurações e volta aos valores padrão
   */
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

  /**
   * Atualiza uma configuração específica
   * 
   * @param key - Chave da configuração a ser atualizada
   * @param value - Novo valor da configuração
   */
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
