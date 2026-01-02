import { useSettingsContext } from '@/contexts/SettingsContext';

export function useSettings() {
  const { settings, isLoading, isInitialized, loadSettings, clearSettings, updateSetting } =
    useSettingsContext();

  return {
    settings,
    isLoading,
    isInitialized,
    loadSettings,
    clearSettings,
    updateSetting
  };
}
