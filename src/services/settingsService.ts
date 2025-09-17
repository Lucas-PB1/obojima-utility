class SettingsService {
  private readonly SETTINGS_KEY = 'obojima_settings';

  getDefaultModifier(): number | '' {
    if (typeof window === 'undefined') return '';
    
    try {
      const settings = this.getSettings();
      return settings.defaultModifier;
    } catch (error) {
      console.error('Erro ao carregar modificador padrão:', error);
      return '';
    }
  }

  setDefaultModifier(modifier: number | ''): void {
    if (typeof window === 'undefined') return;
    
    try {
      const settings = this.getSettings();
      settings.defaultModifier = modifier;
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar modificador padrão:', error);
    }
  }

  getDefaultBonusDice(): { type: string; value: number } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const settings = this.getSettings();
      return settings.defaultBonusDice;
    } catch (error) {
      console.error('Erro ao carregar dado bônus padrão:', error);
      return null;
    }
  }

  setDefaultBonusDice(bonusDice: { type: string; value: number } | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      const settings = this.getSettings();
      settings.defaultBonusDice = bonusDice;
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar dado bônus padrão:', error);
    }
  }

  private getSettings(): {
    defaultModifier: number | '';
    defaultBonusDice: { type: string; value: number } | null;
  } {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (!stored) {
      return {
        defaultModifier: '',
        defaultBonusDice: null
      };
    }
    
    return JSON.parse(stored);
  }

  clearSettings(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SETTINGS_KEY);
  }
}

export const settingsService = new SettingsService();
