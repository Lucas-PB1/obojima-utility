'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, UserRound } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingsSwitcherProps {
  section: 'account' | 'player';
}

export function SettingsSwitcher({ section }: SettingsSwitcherProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="w-full md:w-auto justify-center md:justify-start"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('settings.navigation.back')}
      </Button>

      <div className="flex w-full md:w-auto p-1.5 bg-totoro-blue/10 rounded-lg shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12)]">
        <button
          type="button"
          onClick={() => router.push('/settings/account')}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.22em] transition-all ${
            section === 'account'
              ? 'bg-totoro-blue text-white shadow-[0_14px_28px_-18px_rgba(var(--primary-rgb),0.85),inset_0_1px_0_rgba(255,255,255,0.24)]'
              : 'text-totoro-gray/60 hover:text-totoro-blue hover:bg-[var(--surface-hover)]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <UserRound className="h-4 w-4" />
            {t('settings.navigation.account')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/settings/player')}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.22em] transition-all ${
            section === 'player'
              ? 'bg-totoro-blue text-white shadow-[0_14px_28px_-18px_rgba(var(--primary-rgb),0.85),inset_0_1px_0_rgba(255,255,255,0.24)]'
              : 'text-totoro-gray/60 hover:text-totoro-blue hover:bg-[var(--surface-hover)]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t('settings.navigation.player')}
          </span>
        </button>
      </div>
    </div>
  );
}
