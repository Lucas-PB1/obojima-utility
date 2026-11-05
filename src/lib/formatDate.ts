import type { Language } from '@/constants/settings';

const LOCALES: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES'
};

export function getLocale(language: Language): string {
  return LOCALES[language] || 'en-US';
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function formatTime(date: Date, language: Language): string {
  return date.toLocaleTimeString(getLocale(language), { hour: '2-digit', minute: '2-digit' });
}

/** "5 min ago", "yesterday", or a short date for anything older than a week. */
export function formatRelative(date: Date, language: Language, now = new Date()): string {
  const locale = getLocale(language);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400 && isSameCalendarDay(date, now)) {
    return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  }

  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  if (Math.abs(dayDiff) < 7) return rtf.format(dayDiff, 'day');

  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
}

/** Label for a day separator in a chat: "today", "yesterday" or a full date. */
export function formatDayLabel(date: Date, language: Language, now = new Date()): string {
  const locale = getLocale(language);
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  if (dayDiff === 0 || dayDiff === -1) {
    const label = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(dayDiff, 'day');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  return date.toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' });
}
