import React from 'react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useSystemMigration } from '@/hooks/useSystemMigration';

export function SystemMigration() {
  const { t } = useTranslation();
  const { loading, status, error, migratePublicProfiles, backfillChatParticipants } =
    useSystemMigration();

  return (
    <div className="glass-panel rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-totoro-gray">{t('admin.tools.title')}</h2>
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-white/5 rounded-lg shadow-[inset_0_0_0_1px_var(--hairline)]">
          <h3 className="font-bold mb-2">{t('admin.migration.title')}</h3>
          <p className="text-sm text-totoro-gray/60 mb-4">{t('admin.migration.description')}</p>
          <Button onClick={migratePublicProfiles} disabled={loading}>
            {loading ? t('ui.states.loading') : t('admin.migration.action')}
          </Button>
          {status && (
            <p className={`mt-2 text-sm font-bold ${error ? 'text-red-500' : 'text-green-600'}`}>
              {status}
            </p>
          )}
        </div>
        <div className="p-4 bg-white/5 rounded-lg shadow-[inset_0_0_0_1px_var(--hairline)]">
          <h3 className="font-bold mb-2">{t('admin.chatBackfill.title')}</h3>
          <p className="text-sm text-totoro-gray/60 mb-4">{t('admin.chatBackfill.description')}</p>
          <Button onClick={backfillChatParticipants} disabled={loading} variant="secondary">
            {loading ? t('ui.states.loading') : t('admin.chatBackfill.action')}
          </Button>
        </div>
      </div>
    </div>
  );
}
