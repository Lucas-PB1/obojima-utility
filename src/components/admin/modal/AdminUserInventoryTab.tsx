import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CollectedIngredient, Ingredient } from '@/types/ingredients';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';

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
  };
}

export function AdminUserInventoryTab({ data }: AdminUserInventoryTabProps) {
  const { t } = useTranslation();
  const { localizeIngredient } = useLocalizedIngredients();

  return (
    <div className="glass-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{t('admin.modal.inventory.title')}</h3>
        <button
          onClick={() => data.setIsAddingItem(!data.isAddingItem)}
          className="text-xs bg-totoro-green/10 text-totoro-green px-3 py-1 rounded hover:bg-totoro-green hover:text-white transition-colors"
        >
          {data.isAddingItem
            ? t('admin.modal.inventory.add.cancel')
            : t('admin.modal.inventory.add.button')}
        </button>
      </div>

      {data.isAddingItem && (
        <div className="bg-white/50 p-4 rounded-lg mb-4 flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium block mb-1">
              {t('admin.modal.inventory.add.label')}
            </label>
            <select
              className="w-full text-sm p-2 rounded border border-gray-200"
              value={data.selectedUniqueKey}
              onChange={(e) => data.setSelectedUniqueKey(e.target.value)}
            >
              <option value="">
                {t('admin.modal.inventory.add.select_placeholder')}
              </option>
              {data.availableIngredients.map((ing) => (
                <option key={ing.uniqueKey} value={ing.uniqueKey}>
                  {ing.nome} ({ing.raridade})
                </option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <label className="text-xs font-medium block mb-1">
              {t('admin.modal.inventory.add.qty')}
            </label>
            <input
              type="number"
              min="1"
              className="w-full text-sm p-2 rounded border border-gray-200"
              value={data.addQuantity}
              onChange={(e) => data.setAddQuantity(Number(e.target.value))}
            />
          </div>
          <button
            onClick={data.handleAddItem}
            disabled={!data.selectedUniqueKey}
            className="bg-totoro-green text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {t('admin.modal.inventory.add.confirm')}
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-4">{t('admin.modal.inventory.table.item')}</div>
          <div className="col-span-3 text-center">
            {t('admin.modal.inventory.table.status')}
          </div>
          <div className="col-span-3">
            {t('admin.modal.inventory.table.acquired')}
          </div>
          <div className="col-span-2 text-right">
            {t('admin.modal.inventory.table.actions')}
          </div>
        </div>
        {data.ingredients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {t('admin.modal.empty.ingredients')}
          </p>
        ) : (
          data.ingredients.map((item) => {
            const localized = localizeIngredient(item.ingredient);
            return (
              <div
                key={item.id}
                className="bg-white/40 p-2 rounded-lg grid grid-cols-12 gap-2 items-center hover:bg-white/60 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2 overflow-hidden">
                  <span className="text-xl">🌿</span>
                  <span
                    className="font-medium truncate text-sm"
                    title={localized.nome}
                  >
                    {localized.nome}
                  </span>
                </div>
                <div className="col-span-3 flex justify-center">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.used ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}
                  >
                    {item.used
                      ? t('admin.modal.inventory.status.used')
                      : t('admin.modal.inventory.status.available')}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-gray-600 truncate">
                  {item.collectedAt
                    ? new Date(item.collectedAt).toLocaleDateString()
                    : '-'}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <div className="flex items-center bg-white/50 rounded overflow-hidden">
                    <button
                      className="px-2 py-1 hover:bg-gray-200 text-xs"
                      onClick={() => data.handleUpdateQuantity(item.id, item.quantity, -1)}
                    >
                      -
                    </button>
                    <span className="px-1 text-xs font-medium min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 hover:bg-gray-200 text-xs"
                      onClick={() => data.handleUpdateQuantity(item.id, item.quantity, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.handleDeleteIngredient(item.id, localized.nome);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title={t('admin.modal.actions.remove')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
