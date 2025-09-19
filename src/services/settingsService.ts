interface Settings {
  defaultModifier: number | '';
  defaultBonusDice: { type: string; value: number } | null;
  doubleForageTalent: boolean;
  cauldronBonus: boolean;
  potionBrewerTalent: boolean;
  potionBrewerLevel: number;
}

const defaultSettings: Settings = {
  defaultModifier: '',
  defaultBonusDice: null,
  doubleForageTalent: false,
  cauldronBonus: false,
  potionBrewerTalent: false,
  potionBrewerLevel: 1
};

class SettingsService {
  private readonly SETTINGS_KEY = 'obojima_settings';

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getSettings(): Settings {
    if (!this.isClient()) return defaultSettings;
    
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  }

  private saveSettings(settings: Settings): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  getDefaultModifier(): number | '' {
    return this.getSettings().defaultModifier;
  }

  setDefaultModifier(modifier: number | ''): void {
    const settings = this.getSettings();
    settings.defaultModifier = modifier;
    this.saveSettings(settings);
  }

  getDefaultBonusDice(): { type: string; value: number } | null {
    return this.getSettings().defaultBonusDice;
  }

  setDefaultBonusDice(bonusDice: { type: string; value: number } | null): void {
    const settings = this.getSettings();
    settings.defaultBonusDice = bonusDice;
    this.saveSettings(settings);
  }

  getDoubleForageTalent(): boolean {
    return this.getSettings().doubleForageTalent;
  }

  setDoubleForageTalent(enabled: boolean): void {
    const settings = this.getSettings();
    settings.doubleForageTalent = enabled;
    this.saveSettings(settings);
  }

  getCauldronBonus(): boolean {
    return this.getSettings().cauldronBonus;
  }

  setCauldronBonus(enabled: boolean): void {
    const settings = this.getSettings();
    settings.cauldronBonus = enabled;
    this.saveSettings(settings);
  }

  getPotionBrewerTalent(): boolean {
    return this.getSettings().potionBrewerTalent;
  }

  setPotionBrewerTalent(enabled: boolean): void {
    const settings = this.getSettings();
    settings.potionBrewerTalent = enabled;
    this.saveSettings(settings);
  }

  getPotionBrewerLevel(): number {
    return this.getSettings().potionBrewerLevel;
  }

  setPotionBrewerLevel(level: number): void {
    const settings = this.getSettings();
    settings.potionBrewerLevel = Math.max(1, Math.min(20, level));
    this.saveSettings(settings);
  }

  clearSettings(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(this.SETTINGS_KEY);
  }
}

export const settingsService = new SettingsService();
