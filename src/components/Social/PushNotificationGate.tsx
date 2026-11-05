import React from 'react';
import { BellRing, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { PushSetupStatus } from '@/services/social/notificationService';
import { useTranslation } from '@/hooks/useTranslation';

interface PushNotificationGateProps {
  status: PushSetupStatus;
  error: string | null;
  loading: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

/** Compact, dismissible prompt. Only rendered when enabling push can actually work. */
export function PushNotificationGate({
  status,
  error,
  loading,
  onEnable,
  onDismiss
}: PushNotificationGateProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-4xl items-start gap-3 rounded-lg bg-totoro-blue/10 p-3 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.18)] sm:items-center sm:p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-totoro-blue/15 text-totoro-blue">
        <BellRing className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-totoro-gray">{t('social.push.title')}</p>
        <p className="text-xs text-totoro-gray/70">{t(`social.push.status.${status}`)}</p>
        {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
      </div>
      <Button size="sm" onClick={onEnable} disabled={loading} className="shrink-0">
        {loading ? '...' : t('social.push.enable')}
      </Button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('social.push.dismiss')}
        title={t('social.push.dismiss')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-totoro-gray/50 transition hover:bg-totoro-blue/10 hover:text-totoro-gray"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
