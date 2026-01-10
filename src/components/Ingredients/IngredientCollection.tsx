'use client';
import React from 'react';
import { Button, StatsGrid, PageHeader, DataTable, Column } from '@/components/ui';
import { CollectedIngredient } from '@/types/ingredients';
import { IngredientModal } from './IngredientModal';
import { INGREDIENT_COLLECTION_FILTERS } from '@/constants/ingredients';
import { useIngredientCollection } from '@/hooks/useIngredientCollection';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';

export function IngredientCollection() {
  const { t } = useTranslation();
  const { localizeIngredient } = useLocalizedIngredients();

  const {
    displayIngredients,
    selectedIngredient,
    isModalOpen,
    statsData,
    handleMarkAsUsed,
    handleIngredientClick,
    handleCloseModal
  } = useIngredientCollection();

  const columns: Column<CollectedIngredient>[] = [
    {
      key: 'ingredient' as keyof CollectedIngredient,
      label: t('ingredients.table.ingredient'),
      sortable: true,
      width: '30%',
      render: (_, item: CollectedIngredient) => {
        const mappedIngredient = localizeIngredient(item.ingredient);

        return (
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-totoro-blue/5 p-2 rounded-lg transition-colors"
            onClick={() => handleIngredientClick(mappedIngredient)}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-totoro-green/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-totoro-gray hover:text-totoro-blue transition-colors">
                {mappedIngredient.nome}
              </div>
              <div className="text-xs text-totoro-blue mt-1">
                {t('ingredients.table.clickDetails')}
              </div>
            </div>
          </div>
        );
      }
    },

    {
      key: 'quantity' as keyof CollectedIngredient,
      label: t('ingredients.table.quantity'),
      sortable: true,
      width: '15%',
      render: (_, item: CollectedIngredient) => (
        <div className="flex items-center space-x-2">
          <span className="bg-totoro-green/20 text-totoro-green px-2 py-1 rounded-full text-sm font-medium">
            {item.quantity}
          </span>
        </div>
      )
    },
    {
      key: 'collectedAt' as keyof CollectedIngredient,
      label: t('ingredients.table.collectedAt'),
      sortable: false,
      width: '25%',
      render: (_, item: CollectedIngredient) => {
        const localized = localizeIngredient(item.ingredient);
        return (
          <div className="flex space-x-2">
            <span className="bg-totoro-orange/20 text-totoro-orange px-2 py-1 rounded text-xs">
              ⚔️ {localized.combat}
            </span>
            <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs">
              🛠️ {localized.utility}
            </span>
            <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs">
              ✨ {localized.whimsy}
            </span>
          </div>
        );
      }
    },
    {
      key: 'used' as keyof CollectedIngredient,
      label: t('ingredients.table.date'),
      sortable: true,
      width: '15%',
      render: (_, item: CollectedIngredient) => (
        <div className="text-sm text-totoro-gray">
          {new Date(item.collectedAt).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'forageAttemptId' as keyof CollectedIngredient,
      label: t('ingredients.table.actions'),
      sortable: true,
      width: '20%',
      render: (_, item: CollectedIngredient) => (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.used
                  ? 'bg-totoro-gray/20 text-totoro-gray'
                  : 'bg-totoro-green/20 text-totoro-green'
              }`}
            >
              {item.used
                ? t('ingredients.table.used')
                : t('ingredients.table.available', item.quantity)}
            </span>
          </div>
          {!item.used && (
            <Button
              onClick={() => handleMarkAsUsed(item.id)}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              {t('ingredients.table.use')}
            </Button>
          )}
          {item.used && (
            <span className="text-xs text-totoro-gray/60">
              {t(
                'ingredients.table.usedAt',
                item.usedAt ? new Date(item.usedAt).toLocaleDateString('pt-BR') : 'N/A'
              )}
            </span>
          )}
        </div>
      )
    }
  ];

  const mobileRenderer = (item: CollectedIngredient) => {
    const localized = localizeIngredient(item.ingredient);
    return (
      <div
        onClick={() => handleIngredientClick(localized)}
        className="flex items-center justify-between p-5 hover:bg-totoro-blue/5 transition-colors active:bg-totoro-blue/10 cursor-pointer group"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center text-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-totoro-blue/5 group-hover:scale-105 transition-transform duration-300">
            🌿
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-totoro-gray text-[15px] leading-tight group-hover:text-totoro-blue transition-colors">
              {localized.nome}
            </span>
            <span className="text-[11px] text-totoro-gray/50 font-black uppercase tracking-widest">
              {localized.raridade}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-black text-2xl text-totoro-gray/90 tabular-nums">
            {item.quantity}
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              item.used
                ? 'text-totoro-gray/40'
                : 'text-[#7ED321]'
            }`}
          >
            {item.used
              ? t('constants.ingredients.status.used')
              : t('constants.ingredients.status.available')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('ingredients.collection.title')}
        subtitle={t('ingredients.collection.subtitle')}
        icon="🎒"
      />

      <StatsGrid title={t('ingredients.stats.title')} stats={statsData} className="mb-8" />

      <DataTable<CollectedIngredient>
        data={displayIngredients}
        columns={columns}
        filters={INGREDIENT_COLLECTION_FILTERS}
        searchKeys={['ingredient.nome', 'ingredient.descricao', 'ingredient.raridade']}
        searchPlaceholder={t('ingredients.search.placeholder')}
        itemsPerPage={15}
        className="mb-8"
        title={t('ui.datatable.search')}
        icon="🔍"
        mobileRenderer={mobileRenderer}
      />

      <IngredientModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
