'use client';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/authService';

interface MigrationResponse {
  message: string;
  details?: string;
  error?: string;
}

import Swal from 'sweetalert2';

export function useSystemMigration() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const runAdminTask = async (url: string, startingMessage: string, successKey: string) => {
    setLoading(true);
    setStatus(startingMessage);
    setError(false);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: await authService.getAuthorizationHeaders()
      });

      const data: MigrationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || t('errors.unknown'));
      }

      setStatus(t(successKey, data.message));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unknown');
      setStatus(t('admin.migration.status.error', message));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmAdminTask = async (title: string, text: string) => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    });

    return result.isConfirmed;
  };

  const migratePublicProfiles = async () => {
    const confirmed = await confirmAdminTask(
      t('admin.migration.title'),
      t('admin.migration.confirm')
    );

    if (!confirmed) return;

    await runAdminTask(
      '/api/admin/migrate-public-profiles',
      t('admin.migration.status.starting'),
      'admin.migration.status.success'
    );
  };

  const backfillChatParticipants = async () => {
    const confirmed = await confirmAdminTask(
      t('admin.chatBackfill.title'),
      t('admin.chatBackfill.confirm')
    );

    if (!confirmed) return;

    await runAdminTask(
      '/api/admin/backfill-chat-participants',
      t('admin.chatBackfill.status.starting'),
      'admin.migration.status.success'
    );
  };

  return {
    loading,
    status,
    error,
    migratePublicProfiles,
    backfillChatParticipants
  };
}
