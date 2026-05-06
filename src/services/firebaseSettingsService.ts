import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { UserUtils } from '@/lib/userUtils';
import { logger } from '@/utils/logger';
import {
  getDevState,
  getDevUserId,
  isDevMode,
  setDevState,
  subscribeDevState
} from '@/features/dev-mode';

interface Settings {
  defaultModifier: number | '';
  defaultBonusDice: { type: string; value: number } | null;
  doubleForageTalent: boolean;
  cauldronBonus: boolean;
  potionBrewerTalent: boolean;
  potionBrewerLevel: number;
  gold: number;
  language?: 'pt' | 'en' | 'es';
  defaultRegion?: string;
  defaultTestType?: 'natureza' | 'sobrevivencia';
}

type StoredSettings = Omit<Settings, 'defaultTestType'> & {
  defaultTestType: Settings['defaultTestType'] | null;
};

const defaultSettings: Settings = {
  defaultModifier: '',
  defaultBonusDice: null,
  doubleForageTalent: false,
  cauldronBonus: false,
  potionBrewerTalent: false,
  potionBrewerLevel: 1,
  gold: 0,
  language: 'en',
  defaultRegion: '',
  defaultTestType: undefined
};

const defaultPlayerSettings: Omit<Settings, 'language'> = {
  defaultModifier: '',
  defaultBonusDice: null,
  doubleForageTalent: false,
  cauldronBonus: false,
  potionBrewerTalent: false,
  potionBrewerLevel: 1,
  gold: 0,
  defaultRegion: '',
  defaultTestType: undefined
};

function toStoredSettings(settings: Settings): StoredSettings {
  return {
    defaultModifier: settings.defaultModifier,
    defaultBonusDice: settings.defaultBonusDice ?? null,
    doubleForageTalent: settings.doubleForageTalent,
    cauldronBonus: settings.cauldronBonus,
    potionBrewerTalent: settings.potionBrewerTalent,
    potionBrewerLevel: settings.potionBrewerLevel,
    gold: settings.gold,
    language: settings.language || 'en',
    defaultRegion: settings.defaultRegion || '',
    defaultTestType: settings.defaultTestType ?? null
  };
}

function fromStoredSettings(settings: Settings | StoredSettings): Settings {
  return {
    ...defaultSettings,
    ...settings,
    defaultTestType: settings.defaultTestType || undefined
  };
}

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
    return `users/${userId}`;
  }

  private getSettingsFieldPath(): string {
    return 'settings';
  }

  private async getSettings(): Promise<Settings> {
    if (isDevMode()) {
      return (
        (getDevState().settingsByUser[getDevUserId()] as Settings | undefined) || defaultSettings
      );
    }

    if (!this.isClient() || !this.getUserId()) return defaultSettings;

    try {
      const userRef = doc(db, this.getSettingsPath());
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const settings = data[this.getSettingsFieldPath()] as Settings | undefined;
        if (settings) {
          return fromStoredSettings(settings);
        }
      }

      await this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      logger.error('Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  }

  private async saveSettings(settings: Settings): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        settingsByUser: { ...state.settingsByUser, [userId]: settings }
      }));
      return;
    }

    const userId = this.getUserId();
    if (!this.isClient() || !userId) return;

    try {
      const userRef = doc(db, this.getSettingsPath());
      const snapshot = await getDoc(userRef);
      const storedSettings = toStoredSettings(settings);

      if (snapshot.exists()) {
        const existingData = snapshot.data();
        await setDoc(
          userRef,
          {
            ...(!existingData.uid ? { uid: userId } : {}),
            ...(!existingData.role ? { role: 'user' } : {}),
            [this.getSettingsFieldPath()]: storedSettings
          },
          { merge: true }
        );
        return;
      }

      const user = authService.getCurrentUser();
      const now = new Date().toISOString();

      await setDoc(userRef, {
        uid: userId,
        email: user?.email || '',
        displayName: user?.displayName || UserUtils.getFallbackName(user?.email || ''),
        photoURL: user?.photoURL || null,
        role: 'user',
        createdAt: now,
        lastLogin: now,
        updatedAt: now,
        [this.getSettingsFieldPath()]: storedSettings
      });
    } catch (error) {
      logger.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  subscribeToSettings(callback: (settings: Settings) => void): () => void {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) =>
        callback((state.settingsByUser[userId] as Settings | undefined) || defaultSettings)
      );
    }

    if (!this.isClient() || !this.getUserId()) {
      callback(defaultSettings);
      return () => {};
    }

    try {
      const userRef = doc(db, this.getSettingsPath());

      this.settingsUnsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const settings = data[this.getSettingsFieldPath()] as Settings | undefined;
            if (settings) {
              callback(fromStoredSettings(settings));
            } else {
              callback(defaultSettings);
            }
          } else {
            callback(defaultSettings);
          }
        },
        (error) => {
          logger.error('Erro ao observar configurações:', error);
          callback(defaultSettings);
        }
      );

      return () => {
        if (this.settingsUnsubscribe) {
          this.settingsUnsubscribe();
          this.settingsUnsubscribe = null;
        }
      };
    } catch (error) {
      logger.error('Erro ao criar subscription de configurações:', error);
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

  async getGold(): Promise<number> {
    const settings = await this.getSettings();
    return Math.max(0, Math.floor(Number(settings.gold || 0)));
  }

  async setGold(gold: number): Promise<void> {
    const settings = await this.getSettings();
    settings.gold = Math.max(0, Math.floor(Number(gold) || 0));
    await this.saveSettings(settings);
  }

  async getLanguage(): Promise<'pt' | 'en' | 'es'> {
    const settings = await this.getSettings();
    return settings.language || 'pt';
  }

  async setLanguage(language: 'pt' | 'en' | 'es'): Promise<void> {
    const settings = await this.getSettings();
    settings.language = language;
    await this.saveSettings(settings);
  }

  async getDefaultRegion(): Promise<string> {
    const settings = await this.getSettings();
    return settings.defaultRegion || '';
  }

  async setDefaultRegion(region: string): Promise<void> {
    const settings = await this.getSettings();
    settings.defaultRegion = region;
    await this.saveSettings(settings);
  }

  async getDefaultTestType(): Promise<'natureza' | 'sobrevivencia' | undefined> {
    const settings = await this.getSettings();
    return settings.defaultTestType;
  }

  async setDefaultTestType(testType: 'natureza' | 'sobrevivencia' | undefined): Promise<void> {
    const settings = await this.getSettings();
    settings.defaultTestType = testType;
    await this.saveSettings(settings);
  }

  async clearSettings(): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;

    try {
      const userRef = doc(db, this.getSettingsPath());
      await setDoc(
        userRef,
        { [this.getSettingsFieldPath()]: toStoredSettings(defaultSettings) },
        { merge: true }
      );
    } catch (error) {
      logger.error('Erro ao limpar configurações:', error);
      throw error;
    }
  }

  async clearPlayerSettings(): Promise<void> {
    if (!this.isClient() || !this.getUserId()) return;

    try {
      const settings = await this.getSettings();
      await this.saveSettings({
        ...settings,
        ...defaultPlayerSettings
      });
    } catch (error) {
      logger.error('Erro ao limpar configurações do jogador:', error);
      throw error;
    }
  }

  cleanup(): void {
    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }
  }
}

export const firebaseSettingsService = new FirebaseSettingsService();
