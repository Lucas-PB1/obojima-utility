import { Language } from '@/constants/settings';
import { en } from '@/locales/en';
import { pt } from '@/locales/pt';
import { es } from '@/locales/es';

type TranslationKey = keyof typeof pt;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  pt,
  en,
  es
};
