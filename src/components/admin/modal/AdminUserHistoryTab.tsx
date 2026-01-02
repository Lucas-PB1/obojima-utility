import React from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminUserHistoryTabProps {
  data: {
    attempts: ForageAttempt[];
  };
}

export function AdminUserHistoryTab({ data }: AdminUserHistoryTabProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-panel p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-medium">{t('ui.labels.date')}</th>
              <th className="px-4 py-3 font-medium">{t('forage.form.region')}</th>
              <th className="px-4 py-3 font-medium">{t('activity.card.roll')}</th>
              <th className="px-4 py-3 font-medium">{t('activity.filters.result.label')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {data.attempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-white/30">
                <td className="px-4 py-3 text-gray-600">
                  {new Date(attempt.timestamp).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 capitalize">{attempt.region}</td>
                <td className="px-4 py-3 font-mono">{attempt.roll}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attempt.success
                        ? 'bg-totoro-green/20 text-totoro-green'
                        : 'bg-totoro-orange/20 text-totoro-orange'
                    }`}
                  >
                    {attempt.success
                      ? t('admin.modal.history.success')
                      : t('admin.modal.history.failure')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
