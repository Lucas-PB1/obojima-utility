import React from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, Column } from '@/components/ui';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';
import { useEnglishIngredientNames } from '@/hooks/useEnglishIngredientNames';

interface AdminUserHistoryTabProps {
  data: {
    attempts: ForageAttempt[];
  };
}

export function AdminUserHistoryTab({ data }: AdminUserHistoryTabProps) {
  const { t } = useTranslation();
  const { localizeIngredient } = useLocalizedIngredients();
  const { getEnglishName } = useEnglishIngredientNames();

  const columns: Column<ForageAttempt>[] = [
    {
      key: 'timestamp',
      label: t('ui.labels.date'),
      render: (_, item) => (
        <span className="text-sm font-medium text-totoro-gray">
          {new Date(item.timestamp).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'region',
      label: t('forage.form.region'),
      render: (_, item) => (
        <span className="capitalize text-sm text-totoro-gray">{item.region}</span>
      )
    },
    {
      key: 'ingredient',
      label: t('admin.modal.inventory.table.item'),
      render: (_, item) => {
        if (!item.ingredient) return <span className="text-totoro-gray/40">-</span>;
        const localized = localizeIngredient(item.ingredient);
        const englishName = getEnglishName(item.ingredient.id, item.ingredient.raridade);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-totoro-gray text-sm">{localized.nome}</span>
            <span className="text-[10px] text-totoro-gray/50 italic capitalize">{englishName}</span>
          </div>
        );
      }
    },
    {
      key: 'roll',
      label: t('activity.card.roll'),
      render: (_, item) => (
        <span className="font-mono font-bold text-totoro-blue bg-totoro-blue/10 px-2 py-0.5 rounded text-xs">
          {item.roll}
        </span>
      )
    },
    {
      key: 'success',
      label: t('activity.filters.result.label'),
      render: (_, item) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            item.success
              ? 'bg-totoro-green/10 text-totoro-green'
              : 'bg-totoro-orange/10 text-totoro-orange'
          }`}
        >
          {item.success ? t('admin.modal.history.success') : t('admin.modal.history.failure')}
        </span>
      )
    }
  ];

  const mobileRenderer = (attempt: ForageAttempt) => {
    const localized = attempt.ingredient ? localizeIngredient(attempt.ingredient) : null;
    const englishName = attempt.ingredient
      ? getEnglishName(attempt.ingredient.id, attempt.ingredient.raridade)
      : null;

    return (
      <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white shadow-sm mb-3">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-totoro-blue/5 ${
              attempt.success
                ? 'bg-totoro-green/10 text-totoro-green'
                : 'bg-totoro-orange/10 text-totoro-orange'
            }`}
          >
            {attempt.success ? '✅' : '❌'}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-totoro-gray text-sm leading-tight">
              {new Date(attempt.timestamp).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-totoro-gray/50 capitalize font-medium uppercase tracking-wider">
              {attempt.region}
            </span>
            {localized && (
              <div className="mt-1 flex flex-col">
                <span className="text-xs font-black text-totoro-blue">{localized.nome}</span>
                <span className="text-[9px] text-totoro-blue/60 italic capitalize">
                  {englishName}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-totoro-gray/40">
            {t('activity.card.roll')}
          </span>
          <span className="text-xl font-black text-totoro-blue">{attempt.roll}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="font-bold text-lg mb-4">{t('admin.modal.tabs.history')}</h3>
      <DataTable
        data={data.attempts}
        columns={columns}
        mobileRenderer={mobileRenderer}
        itemsPerPage={5}
        searchKeys={['region', 'roll', 'ingredient.nome']}
        searchPlaceholder={t('ui.datatable.search')}
      />
    </div>
  );
}
