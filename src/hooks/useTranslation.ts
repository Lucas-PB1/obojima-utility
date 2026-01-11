'use client';
import { useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { translations } from '@/constants/translations';

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.language || 'en';

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
