import React from 'react';
import { BellRing, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';
import { PushSetupStatus } from '@/services/social/notificationService';
import { useTranslation } from '@/hooks/useTranslation';

interface PushNotificationGateProps {
  status: PushSetupStatus;
  error: string | null;
  loading: boolean;
  onEnable: () => void;
}

export function PushNotificationGate({
  status,
  error,
  loading,
  onEnable
}: PushNotificationGateProps) {
  const { t } = useTranslation();
  const canRequest =
    status === 'permission-required' || status === 'error' || status === 'checking';

  return (
    <div className="mx-auto max-w-2xl glass-panel p-6 text-center space-y-5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-totoro-blue/10 text-totoro-blue">
        {status === 'denied' || status === 'missing-config' || status === 'unsupported' ? (
          <ShieldAlert className="h-7 w-7" />
        ) : (
          <BellRing className="h-7 w-7" />
        )}
      </div>
      <div>
        <h2 className="text-xl font-serif font-bold text-totoro-gray">{t('social.push.title')}</h2>
        <p className="mt-2 text-sm text-totoro-gray/70">{t(`social.push.status.${status}`)}</p>
        {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
      </div>
      <Button onClick={onEnable} disabled={!canRequest || loading}>
        {loading ? '...' : t('social.push.enable')}
      </Button>
    </div>
  );
}
