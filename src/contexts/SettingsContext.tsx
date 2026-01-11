'use client';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';
import { DiceType } from '@/types/ingredients';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import { SettingsState, DEFAULT_SETTINGS, Language } from '@/constants/settings';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef
} from 'react';

interface SettingsContextType {
  settings: SettingsState;
  isLoading: boolean;
  isInitialized: boolean;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  clearSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('obojima_language');
      if (
        savedLanguage &&
        (savedLanguage === 'pt' || savedLanguage === 'en' || savedLanguage === 'es')
      ) {
        setSettings((prev) => ({ ...prev, language: savedLanguage }));
      }
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      if (typeof window !== 'undefined' && isInitialized) {
        setSettings((prev) => ({ ...DEFAULT_SETTINGS, language: prev.language }));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      return;
    }

    const unsubscribe = firebaseSettingsService.subscribeToSettings((firestoreSettings) => {
      setSettings((current) => {
        if (firestoreSettings.language) {
          localStorage.setItem('obojima_language', firestoreSettings.language);
        }

        return {
          defaultModifier: firestoreSettings.defaultModifier,
          defaultBonusType: firestoreSettings.defaultBonusDice?.type || '',
          defaultBonusValue: firestoreSettings.defaultBonusDice?.value || 0,
          doubleForageTalent: firestoreSettings.doubleForageTalent,
          cauldronBonus: firestoreSettings.cauldronBonus,
          potionBrewerTalent: firestoreSettings.potionBrewerTalent,
          potionBrewerLevel: firestoreSettings.potionBrewerLevel,
          language: firestoreSettings.language || current.language || 'en',
          defaultRegion: firestoreSettings.defaultRegion || '',
          defaultTestType: firestoreSettings.defaultTestType
        };
      });
      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [isAuthenticated, authLoading, isInitialized]);

  const loadSettings = useCallback(async () => {}, []);

  const clearSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await firebaseSettingsService.clearSettings();
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      logger.error('Erro ao limpar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };

        if (key === 'language') {
          localStorage.setItem('obojima_language', value as string);
        }

        const save = async () => {
          if (!isAuthenticated) return;
          try {
            if (key === 'language') await firebaseSettingsService.setLanguage(value as Language);
            else if (key === 'doubleForageTalent')
              await firebaseSettingsService.setDoubleForageTalent(value as boolean);
            else if (key === 'cauldronBonus')
              await firebaseSettingsService.setCauldronBonus(value as boolean);
            else if (key === 'potionBrewerTalent')
              await firebaseSettingsService.setPotionBrewerTalent(value as boolean);
            else if (key === 'defaultModifier')
              await firebaseSettingsService.setDefaultModifier(value as number | '');
            else if (key === 'defaultRegion')
              await firebaseSettingsService.setDefaultRegion(value as string);
            else if (key === 'defaultTestType')
              await firebaseSettingsService.setDefaultTestType(
                value as 'natureza' | 'sobrevivencia'
              );
            else if (key === 'potionBrewerLevel')
              await firebaseSettingsService.setPotionBrewerLevel(value as number);
            else {
              if (key === 'defaultBonusType' || key === 'defaultBonusValue') {
                const bonusValue =
                  key === 'defaultBonusValue' ? (value as number) : newSettings.defaultBonusValue;
                const bonusType =
                  key === 'defaultBonusType' ? (value as string) : newSettings.defaultBonusType;

                const bonusDice =
                  bonusType && bonusValue > 0
                    ? { type: bonusType as DiceType, value: bonusValue }
                    : null;
                await firebaseSettingsService.setDefaultBonusDice(bonusDice);
              }
            }
          } catch (e) {
            logger.error('Auto-save failed', e);
          }
        };

        const isDebouncedField =
          key === 'defaultModifier' || key === 'potionBrewerLevel' || key === 'defaultBonusValue';

        if (isDebouncedField) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(save, 800);
        } else {
          save();
        }

        return newSettings;
      });
    },
    [isAuthenticated]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading: isLoading || authLoading,
        isInitialized,
        updateSetting,
        clearSettings,
        loadSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
