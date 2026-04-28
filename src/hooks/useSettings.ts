'use client';
import { useSettingsContext } from '@/contexts/SettingsContext';

export function useSettings() {
  const {
    settings,
    isLoading,
    isInitialized,
    saveStatus,
    loadSettings,
    clearSettings,
    clearPlayerSettings,
    flushPendingSave,
    updateSetting
  } = useSettingsContext();

  return {
    settings,
    isLoading,
    isInitialized,
    saveStatus,
    loadSettings,
    clearSettings,
    clearPlayerSettings,
    flushPendingSave,
    updateSetting
  };
}
