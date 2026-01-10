import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CollectedIngredient, Ingredient } from '@/types/ingredients';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';
import { Loader2 } from 'lucide-react';
import { useEnglishIngredientNames } from '@/hooks/useEnglishIngredientNames';
import { DataTable, Column } from '@/components/ui';

type AvailableIngredient = Ingredient & { uniqueKey: string };

interface AdminUserInventoryTabProps {
  data: {
    ingredients: CollectedIngredient[];
    availableIngredients: AvailableIngredient[];
    isAddingItem: boolean;
    setIsAddingItem: (v: boolean) => void;
    selectedUniqueKey: string;
    setSelectedUniqueKey: (v: string) => void;
    addQuantity: number;
    setAddQuantity: (v: number) => void;
    handleAddItem: () => void;
    handleUpdateQuantity: (id: string, current: number, change: number) => void;
    handleDeleteIngredient: (id: string, name: string) => void;
    submitting?: boolean;
    loading?: boolean;
  };
}

export function AdminUserInventoryTab({ data }: AdminUserInventoryTabProps) {
  const { t } = useTranslation();
  const { localizeIngredient } = useLocalizedIngredients();
  const { getEnglishName } = useEnglishIngredientNames();

  const columns: Column<CollectedIngredient>[] = [
    {
      key: 'ingredient',
      label: t('admin.modal.inventory.table.item'),
      render: (_, item) => {
        const localized = localizeIngredient(item.ingredient);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-totoro-green/10 flex items-center justify-center text-lg">
              🌿
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-totoro-gray text-sm">{localized.nome}</span>
              <span className="text-[10px] text-totoro-gray/50 italic">
                {getEnglishName(item.ingredient.id, item.ingredient.raridade)}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'used',
      label: t('admin.modal.inventory.table.status'),
      render: (used) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            used ? 'bg-totoro-gray/10 text-totoro-gray/50' : 'bg-totoro-green/10 text-totoro-green'
          }`}
        >
          {used
            ? t('admin.modal.inventory.status.used')
            : t('admin.modal.inventory.status.available')}
        </span>
      )
    },
    {
      key: 'collectedAt',
      label: t('admin.modal.inventory.table.acquired'),
      render: (_, item) => (
        <span className="text-xs text-totoro-gray/70 font-medium">
          {item.collectedAt ? new Date(item.collectedAt).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      key: 'id', // Actions column
      label: t('admin.modal.inventory.table.actions'),
      render: (_, item) => {
        const localized = localizeIngredient(item.ingredient);
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center bg-white border border-totoro-gray/10 rounded-lg overflow-hidden shadow-sm">
              <button
                className="px-2 py-1 hover:bg-totoro-gray/5 text-xs font-bold text-totoro-gray border-r border-totoro-gray/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(item.id, item.quantity, -1);
                }}
              >
                -
              </button>
              <span className="px-2 text-xs font-black min-w-[24px] text-center">
                {item.quantity}
              </span>
              <button
                className="px-2 py-1 hover:bg-totoro-gray/5 text-xs font-bold text-totoro-gray border-l border-totoro-gray/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(item.id, item.quantity, 1);
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.handleDeleteIngredient(
                  item.id,
                  `${localized.nome} (${getEnglishName(item.ingredient.id) || ''})`
                );
              }}
              className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={t('admin.modal.actions.remove')}
            >
              🗑️
            </button>
          </div>
        );
      }
    }
  ];

  const mobileRenderer = (item: CollectedIngredient) => {
    const localized = localizeIngredient(item.ingredient);
    return (
      <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white shadow-sm mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-white flex items-center justify-center text-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-totoro-blue/5">
            🌿
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-totoro-gray text-sm leading-tight">
              {localized.nome}
            </span>
            <span className="text-[10px] text-totoro-gray/50 italic">
              {getEnglishName(item.ingredient.id, item.ingredient.raridade)}
            </span>
            <span
               className={`text-[9px] font-black uppercase tracking-wider w-fit ${
                 item.used ? 'text-totoro-gray/40' : 'text-totoro-green'
               }`}
             >
               {item.used
                 ? t('admin.modal.inventory.status.used')
                 : t('admin.modal.inventory.status.available')}
             </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="flex items-center bg-white border border-totoro-gray/10 rounded-lg overflow-hidden shadow-sm">
              <button
                className="w-8 h-8 flex items-center justify-center hover:bg-totoro-gray/5 text-sm font-bold text-totoro-gray border-r border-totoro-gray/10 active:bg-totoro-gray/10"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(item.id, item.quantity, -1);
                }}
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-black">
                {item.quantity}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center hover:bg-totoro-gray/5 text-sm font-bold text-totoro-gray border-l border-totoro-gray/10 active:bg-totoro-gray/10"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(item.id, item.quantity, 1);
                }}
              >
                +
              </button>
            </div>
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  data.handleDeleteIngredient(
                    item.id,
                    `${localized.nome} (${getEnglishName(item.ingredient.id) || ''})`
                  );
                }}
                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
             >
               <span>🗑️</span> {t('admin.modal.actions.remove')}
             </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {data.isAddingItem && (
        <div className="glass-panel p-4 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-totoro-gray mb-1.5 block uppercase tracking-wider">
              {t('admin.modal.inventory.add.label')}
            </label>
            <select
              className="w-full text-sm p-2.5 rounded-xl border border-totoro-gray/20 bg-white/50 focus:ring-2 focus:ring-totoro-green/20 outline-none transition-all"
              value={data.selectedUniqueKey}
              onChange={(e) => data.setSelectedUniqueKey(e.target.value)}
            >
              <option value="">{t('admin.modal.inventory.add.select_placeholder')}</option>
              {data.availableIngredients.map((ing) => (
                <option key={ing.uniqueKey} value={ing.uniqueKey}>
                  {ing.nome} ({t(`constants.rarity.${(ing.raridade || 'common').toLowerCase()}`)})
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="text-xs font-bold text-totoro-gray mb-1.5 block uppercase tracking-wider">
              {t('admin.modal.inventory.add.qty')}
            </label>
            <input
              type="number"
              min="1"
              className="w-full text-sm p-2.5 rounded-xl border border-totoro-gray/20 bg-white/50 focus:ring-2 focus:ring-totoro-green/20 outline-none transition-all text-center font-bold"
              value={data.addQuantity}
              onChange={(e) => data.setAddQuantity(Number(e.target.value))}
            />
          </div>
          <button
            onClick={data.handleAddItem}
            disabled={!data.selectedUniqueKey || data.submitting}
            className="bg-totoro-green text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-totoro-green/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all"
          >
            {data.submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('admin.modal.inventory.add.confirm')}
          </button>
          </div>
        </div>
      )}

      {data.loading && (
          <div className="py-12 flex justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-totoro-green" />
          </div>
      )}

      {!data.loading && (
         <DataTable
           title={t('admin.modal.inventory.title')}
           icon="🎒"
           action={
             <button
               onClick={() => data.setIsAddingItem(!data.isAddingItem)}
               className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                 data.isAddingItem
                   ? 'bg-totoro-gray/10 text-totoro-gray hover:bg-totoro-gray/20'
                   : 'bg-totoro-green/10 text-totoro-green hover:bg-totoro-green hover:text-white'
               }`}
             >
               {data.isAddingItem
                 ? t('admin.modal.inventory.add.cancel')
                 : t('admin.modal.inventory.add.button')}
             </button>
           }
           data={data.ingredients}
           columns={columns}
           mobileRenderer={mobileRenderer}
           searchKeys={['ingredient.nome']}
           searchPlaceholder={t('ingredients.search.placeholder')}
         />
      )}
    </div>
  );
}
