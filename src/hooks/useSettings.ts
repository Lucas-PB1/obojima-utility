import { useState, useEffect, useCallback } from 'react';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import { DiceType } from '@/types/ingredients';
import { useAuth } from './useAuth';

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
 * - Carregamento de configurações salvas do Firestore
 * - Salvamento de novas configurações
 * - Limpeza de configurações
 * - Atualização individual de configurações
 * - Sincronização em tempo real
 * 
 */
export function useSettings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Carrega as configurações salvas do Firestore
   */
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setSettings(defaultSettings);
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
      setSettings(defaultSettings);
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

  /**
   * Salva as configurações no Firestore
   * 
   * @param newSettings - Novas configurações a serem salvas
   */
  const saveSettings = useCallback(async (newSettings: SettingsState) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    
    try {
      await firebaseSettingsService.setDefaultModifier(newSettings.defaultModifier);
      
      const bonusDice = newSettings.defaultBonusType && newSettings.defaultBonusValue > 0
        ? { type: newSettings.defaultBonusType as DiceType, value: newSettings.defaultBonusValue }
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
  }, [isAuthenticated]);

  /**
   * Limpa todas as configurações e volta aos valores padrão
   */
  const clearSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    
    try {
      await firebaseSettingsService.clearSettings();
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
    isLoading: isLoading || authLoading,
    loadSettings,
    saveSettings,
    clearSettings,
    updateSetting
  };
}
