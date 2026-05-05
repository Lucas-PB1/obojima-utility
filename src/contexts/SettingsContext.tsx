'use client';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';
import { DiceType } from '@/types/ingredients';
import { firebaseSettingsService } from '@/services/firebaseSettingsService';
import {
  SettingsState,
  DEFAULT_SETTINGS,
  Language,
  PLAYER_SETTINGS_DEFAULTS,
  SettingsSaveStatus
} from '@/constants/settings';

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
  saveStatus: SettingsSaveStatus;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  clearSettings: () => Promise<void>;
  clearPlayerSettings: () => Promise<void>;
  flushPendingSave: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

type PendingSave = {
  key: keyof SettingsState;
  value: SettingsState[keyof SettingsState];
} | null;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SettingsSaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<PendingSave>(null);
  const settingsRef = useRef<SettingsState>(DEFAULT_SETTINGS);

  const syncSettingsRef = useCallback((nextSettings: SettingsState) => {
    settingsRef.current = nextSettings;
  }, []);

  const settleSaveStatus = useCallback((status: SettingsSaveStatus) => {
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = null;
    }

    setSaveStatus(status);

    if (status === 'saved') {
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2200);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('obojima_language');
      if (
        savedLanguage &&
        (savedLanguage === 'pt' || savedLanguage === 'en' || savedLanguage === 'es')
      ) {
        const nextSettings = { ...DEFAULT_SETTINGS, language: savedLanguage as Language };
        setSettings(nextSettings);
        syncSettingsRef(nextSettings);
      }
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [syncSettingsRef]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const nextSettings =
        typeof window !== 'undefined' && isInitialized
          ? { ...DEFAULT_SETTINGS, language: settingsRef.current.language }
          : DEFAULT_SETTINGS;
      setSettings(nextSettings);
      syncSettingsRef(nextSettings);
      settleSaveStatus('idle');
      return;
    }

    const unsubscribe = firebaseSettingsService.subscribeToSettings((firestoreSettings) => {
      const nextSettings: SettingsState = {
        defaultModifier: firestoreSettings.defaultModifier,
        defaultBonusType: firestoreSettings.defaultBonusDice?.type || '',
        defaultBonusValue: firestoreSettings.defaultBonusDice?.value || 0,
        doubleForageTalent: firestoreSettings.doubleForageTalent,
        cauldronBonus: firestoreSettings.cauldronBonus,
        potionBrewerTalent: firestoreSettings.potionBrewerTalent,
        potionBrewerLevel: firestoreSettings.potionBrewerLevel,
        gold: Math.max(0, Math.floor(Number(firestoreSettings.gold || 0))),
        language: firestoreSettings.language || settingsRef.current.language || 'en',
        defaultRegion: firestoreSettings.defaultRegion || '',
        defaultTestType: firestoreSettings.defaultTestType
      };

      if (nextSettings.language) {
        localStorage.setItem('obojima_language', nextSettings.language);
      }

      setSettings(nextSettings);
      syncSettingsRef(nextSettings);
      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [isAuthenticated, authLoading, isInitialized, settleSaveStatus, syncSettingsRef]);

  const persistSetting = useCallback(
    async <K extends keyof SettingsState>(
      key: K,
      value: SettingsState[K],
      snapshot: SettingsState = settingsRef.current
    ) => {
      if (!isAuthenticated) return;

      if (key === 'language') {
        localStorage.setItem('obojima_language', value as string);
      }

      if (key === 'language') {
        await firebaseSettingsService.setLanguage(value as Language);
      } else if (key === 'doubleForageTalent') {
        await firebaseSettingsService.setDoubleForageTalent(value as boolean);
      } else if (key === 'cauldronBonus') {
        await firebaseSettingsService.setCauldronBonus(value as boolean);
      } else if (key === 'potionBrewerTalent') {
        await firebaseSettingsService.setPotionBrewerTalent(value as boolean);
      } else if (key === 'defaultModifier') {
        await firebaseSettingsService.setDefaultModifier(value as number | '');
      } else if (key === 'defaultRegion') {
        await firebaseSettingsService.setDefaultRegion(value as string);
      } else if (key === 'defaultTestType') {
        await firebaseSettingsService.setDefaultTestType(
          value as 'natureza' | 'sobrevivencia' | undefined
        );
      } else if (key === 'potionBrewerLevel') {
        await firebaseSettingsService.setPotionBrewerLevel(value as number);
      } else if (key === 'gold') {
        await firebaseSettingsService.setGold(value as number);
      } else if (key === 'defaultBonusType' || key === 'defaultBonusValue') {
        const bonusDice =
          snapshot.defaultBonusType && snapshot.defaultBonusValue > 0
            ? {
                type: snapshot.defaultBonusType as DiceType,
                value: snapshot.defaultBonusValue
              }
            : null;

        await firebaseSettingsService.setDefaultBonusDice(bonusDice);
      }
    },
    [isAuthenticated]
  );

  const commitSave = useCallback(
    async <K extends keyof SettingsState>(
      key: K,
      value: SettingsState[K],
      snapshot: SettingsState = settingsRef.current
    ) => {
      settleSaveStatus('saving');

      try {
        await persistSetting(key, value, snapshot);
        settleSaveStatus('saved');
      } catch (error) {
        logger.error('Auto-save failed', error);
        settleSaveStatus('error');
      }
    },
    [persistSetting, settleSaveStatus]
  );

  const flushPendingSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const pendingSave = pendingSaveRef.current;
    pendingSaveRef.current = null;

    if (!pendingSave) return;

    await commitSave(pendingSave.key, pendingSave.value, settingsRef.current);
  }, [commitSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    };
  }, []);

  const loadSettings = useCallback(async () => {}, []);

  const clearSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    await flushPendingSave();
    setIsLoading(true);
    settleSaveStatus('saving');

    try {
      await firebaseSettingsService.clearSettings();
      const nextSettings = { ...DEFAULT_SETTINGS };
      setSettings(nextSettings);
      syncSettingsRef(nextSettings);
      settleSaveStatus('saved');
    } catch (error) {
      logger.error('Erro ao limpar configurações:', error);
      settleSaveStatus('error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [flushPendingSave, isAuthenticated, settleSaveStatus, syncSettingsRef]);

  const clearPlayerSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingSaveRef.current = null;

    const nextSettings = {
      ...settingsRef.current,
      ...PLAYER_SETTINGS_DEFAULTS
    };

    setSettings(nextSettings);
    syncSettingsRef(nextSettings);
    settleSaveStatus('saving');

    try {
      await firebaseSettingsService.clearPlayerSettings();
      settleSaveStatus('saved');
    } catch (error) {
      logger.error('Erro ao limpar configurações do jogador:', error);
      settleSaveStatus('error');
      throw error;
    }
  }, [isAuthenticated, settleSaveStatus, syncSettingsRef]);

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => {
        const nextSettings = { ...prev, [key]: value };
        syncSettingsRef(nextSettings);

        const isDebouncedField =
          key === 'defaultModifier' ||
          key === 'potionBrewerLevel' ||
          key === 'defaultBonusValue' ||
          key === 'gold';

        if (isDebouncedField) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          pendingSaveRef.current = { key, value };
          settleSaveStatus('saving');
          timeoutRef.current = setTimeout(() => {
            const pendingSave = pendingSaveRef.current;
            pendingSaveRef.current = null;
            timeoutRef.current = null;

            if (pendingSave) {
              void commitSave(pendingSave.key, pendingSave.value, settingsRef.current);
            }
          }, 800);
        } else {
          void commitSave(key, value, nextSettings);
        }

        return nextSettings;
      });
    },
    [commitSave, settleSaveStatus, syncSettingsRef]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading: isLoading || authLoading,
        isInitialized,
        saveStatus,
        updateSetting,
        clearSettings,
        clearPlayerSettings,
        flushPendingSave,
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
