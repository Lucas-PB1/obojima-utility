import React from 'react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useSystemMigration } from '@/hooks/useSystemMigration';

export function SystemMigration() {
  const { t } = useTranslation();
  const { loading, status, error, migratePublicProfiles } = useSystemMigration();

  return (
    <div className="glass-panel p-6 space-y-4">
      <h2 className="text-xl font-bold text-totoro-gray">{t('admin.tools.title')}</h2>
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="font-bold mb-2">{t('admin.migration.title')}</h3>
          <p className="text-sm text-totoro-gray/60 mb-4">{t('admin.migration.description')}</p>
          <Button onClick={migratePublicProfiles} disabled={loading}>
            {loading ? t('ui.loading') : t('admin.migration.action')}
          </Button>
          {status && (
            <p className={`mt-2 text-sm font-bold ${error ? 'text-red-500' : 'text-green-600'}`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
