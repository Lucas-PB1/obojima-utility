export type Language = 'pt' | 'en' | 'es';

export const LANGUAGE_OPTIONS = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' }
] as const;

export const DICE_OPTIONS = [
  { value: 'd4', label: 'D4' },
  { value: 'd6', label: 'D6' },
  { value: 'd8', label: 'D8' },
  { value: 'd10', label: 'D10' },
  { value: 'd12', label: 'D12' }
] as const;

export interface SettingsState {
  defaultModifier: number | '';
  defaultBonusType: string;
  defaultBonusValue: number;
  doubleForageTalent: boolean;
  cauldronBonus: boolean;
  potionBrewerTalent: boolean;
  potionBrewerLevel: number;
  language: Language;
}

export const DEFAULT_SETTINGS: SettingsState = {
  defaultModifier: '',
  defaultBonusType: '',
  defaultBonusValue: 0,
  doubleForageTalent: false,
  cauldronBonus: false,
  potionBrewerTalent: false,
  potionBrewerLevel: 1,
  language: 'pt'
};
