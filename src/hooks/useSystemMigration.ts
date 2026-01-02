'use client';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface MigrationResponse {
  message: string;
  details?: string;
  error?: string;
}

export function useSystemMigration() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const migratePublicProfiles = async () => {
    if (!confirm(t('admin.migration.confirm'))) return;

    setLoading(true);
    setStatus(t('admin.migration.status.starting'));
    setError(false);

    try {
      const response = await fetch('/api/admin/migrate-public-profiles', {
        method: 'POST'
      });

      const data: MigrationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || t('errors.unknown'));
      }

      setStatus(t('admin.migration.status.success', data.message));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unknown');
      setStatus(t('admin.migration.status.error', message));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    status,
    error,
    migratePublicProfiles
  };
}
