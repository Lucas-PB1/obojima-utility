import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from './authService';

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

class FirebaseSettingsService {
  private settingsUnsubscribe: Unsubscribe | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getSettingsPath(): string {
    const userId = this.getUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    // Armazenar settings diretamente no documento do usuário
    return `users/${userId}`;
  }
  
  private getSettingsFieldPath(): string {
    return 'settings';
  }

  private async getSettings(): Promise<Settings> {
    if (!this.isClient() || !this.getUserId()) return defaultSettings;
    
    try {
      const userRef = doc(db, this.getSettingsPath());
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        const settings = data[this.getSettingsFieldPath()] as Settings | undefined;
        if (settings) {
          return settings;
        }
      }
      
      // Criar settings padrão se não existir
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  }

  private async saveSettings(settings: Settings): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;
    
    try {
      const userRef = doc(db, this.getSettingsPath());
      await setDoc(userRef, { [this.getSettingsFieldPath()]: settings }, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  subscribeToSettings(callback: (settings: Settings) => void): () => void {
    if (!this.isClient() || !this.getUserId()) {
      callback(defaultSettings);
      return () => {};
    }

    try {
      const userRef = doc(db, this.getSettingsPath());
      
      this.settingsUnsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const settings = data[this.getSettingsFieldPath()] as Settings | undefined;
          if (settings) {
            callback(settings);
          } else {
            callback(defaultSettings);
          }
        } else {
          callback(defaultSettings);
        }
      }, (error) => {
        console.error('Erro ao observar configurações:', error);
        callback(defaultSettings);
      });

      return () => {
        if (this.settingsUnsubscribe) {
          this.settingsUnsubscribe();
          this.settingsUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('Erro ao criar subscription de configurações:', error);
      callback(defaultSettings);
      return () => {};
    }
  }

  async getDefaultModifier(): Promise<number | ''> {
    const settings = await this.getSettings();
    return settings.defaultModifier;
  }

  async setDefaultModifier(modifier: number | ''): Promise<void> {
    const settings = await this.getSettings();
    settings.defaultModifier = modifier;
    await this.saveSettings(settings);
  }

  async getDefaultBonusDice(): Promise<{ type: string; value: number } | null> {
    const settings = await this.getSettings();
    return settings.defaultBonusDice;
  }

  async setDefaultBonusDice(bonusDice: { type: string; value: number } | null): Promise<void> {
    const settings = await this.getSettings();
    settings.defaultBonusDice = bonusDice;
    await this.saveSettings(settings);
  }

  async getDoubleForageTalent(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.doubleForageTalent;
  }

  async setDoubleForageTalent(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.doubleForageTalent = enabled;
    await this.saveSettings(settings);
  }

  async getCauldronBonus(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.cauldronBonus;
  }

  async setCauldronBonus(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.cauldronBonus = enabled;
    await this.saveSettings(settings);
  }

  async getPotionBrewerTalent(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.potionBrewerTalent;
  }

  async setPotionBrewerTalent(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.potionBrewerTalent = enabled;
    await this.saveSettings(settings);
  }

  async getPotionBrewerLevel(): Promise<number> {
    const settings = await this.getSettings();
    return settings.potionBrewerLevel;
  }

  async setPotionBrewerLevel(level: number): Promise<void> {
    const settings = await this.getSettings();
    settings.potionBrewerLevel = Math.max(1, Math.min(20, level));
    await this.saveSettings(settings);
  }

  async clearSettings(): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;
    
    try {
      const userRef = doc(db, this.getSettingsPath());
      await setDoc(userRef, { [this.getSettingsFieldPath()]: defaultSettings }, { merge: true });
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
      throw error;
    }
  }

  // Cleanup subscriptions
  cleanup(): void {
    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }
  }
}

export const firebaseSettingsService = new FirebaseSettingsService();

