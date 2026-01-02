'use client';
import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-14 h-8 bg-muted rounded-full animate-pulse" />;

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-xs font-medium transition-colors ${!isDark ? 'text-totoro-blue' : 'text-foreground/40'}`}
      >
        {t('ui.theme.light')}
      </span>
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-totoro-blue focus-visible:ring-offset-2
          ${isDark ? 'bg-totoro-blue/20 border border-totoro-blue/30' : 'bg-slate-200 border border-slate-300'}
        `}
      >
        <span className="sr-only">{t('ui.theme.toggle')}</span>
        <div
          className={`
            pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out
            ${isDark ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-totoro-blue fill-totoro-blue/10" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 fill-amber-500/10" />
          )}
        </div>
      </button>
      <span
        className={`text-xs font-medium transition-colors ${isDark ? 'text-totoro-blue' : 'text-foreground/40'}`}
      >
        {t('ui.theme.dark')}
      </span>
    </div>
  );
}
