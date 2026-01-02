import { useSettings } from './useSettings';
import { translations } from '@/constants/translations';
import { useCallback } from 'react';

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.language || 'pt';

  const t = useCallback(
    (key: string, ...args: (string | number)[]) => {
      let text = (translations[language] as Record<string, string>)[key] || key;

      args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, String(arg));
      });

      return text;
    },
    [language]
  );

  return { t, language };
}
