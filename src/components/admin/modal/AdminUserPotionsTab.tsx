import React from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';
import { Loader2 } from 'lucide-react';

import { AvailablePotion } from '@/hooks/usePotionsCatalog';

interface AdminUserPotionsTabProps {
  data: {
    potions: CreatedPotion[];
    availablePotions: AvailablePotion[];
    isAddingItem: boolean;
    setIsAddingItem: (v: boolean) => void;
    selectedUniqueKey: string;
    setSelectedUniqueKey: (v: string) => void;
    addQuantity: number;
    setAddQuantity: (v: number) => void;
    handleAddItem: () => void;
    handleUpdateQuantity: (id: string, current: number, change: number) => void;
    handleDeletePotion: (id: string, name: string) => void;
    submitting?: boolean;
    loading?: boolean;
  };
}

export function AdminUserPotionsTab({ data }: AdminUserPotionsTabProps) {
  const { t } = useTranslation();
  const { getEnglishName } = useEnglishPotionNames();

  const groupedPotions = {
    combat: data.availablePotions.filter((p) => p.winningAttribute === 'combat'),
    utility: data.availablePotions.filter((p) => p.winningAttribute === 'utility'),
    whimsy: data.availablePotions.filter((p) => p.winningAttribute === 'whimsy')
  };

  const renderOption = (pot: AvailablePotion, index: number) => (
    <option key={pot.uniqueKey} value={pot.uniqueKey}>
      {index + 1}. {pot.nome} ({t(`constants.rarity.${pot.raridade.toLowerCase()}`)})
    </option>
  );

  return (
    <div className="glass-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{t('admin.modal.potions.title')}</h3>
        <button
          onClick={() => data.setIsAddingItem(!data.isAddingItem)}
          className="text-xs bg-totoro-blue/10 text-totoro-blue px-3 py-1 rounded hover:bg-totoro-blue hover:text-white transition-colors"
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
              <option value="">{t('admin.modal.inventory.add.select_placeholder')}</option>
              {groupedPotions.combat.length > 0 && (
                <optgroup label={t('potions.category.combat.label')}>
                  {groupedPotions.combat.map((pot, idx) => renderOption(pot, idx))}
                </optgroup>
              )}
              {groupedPotions.utility.length > 0 && (
                <optgroup label={t('potions.category.utility.label')}>
                  {groupedPotions.utility.map((pot, idx) => renderOption(pot, idx))}
                </optgroup>
              )}
              {groupedPotions.whimsy.length > 0 && (
                <optgroup label={t('potions.category.whimsy.label')}>
                  {groupedPotions.whimsy.map((pot, idx) => renderOption(pot, idx))}
                </optgroup>
              )}
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
            disabled={!data.selectedUniqueKey || data.submitting}
            className="bg-totoro-blue text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.submitting ? t('ui.states.loading') : t('admin.modal.inventory.add.confirm')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 relative min-h-[100px]">
        {data.loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-totoro-blue" />
          </div>
        )}

        {data.potions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t('admin.modal.empty.potions')}</p>
        ) : (
          data.potions.map((potion) => {
            const category = potion.recipe.winningAttribute;
            const potionId = potion.recipe.resultingPotion.id;
            const englishName = getEnglishName(category, potionId);

            return (
              <div
                key={potion.id}
                className="bg-white/40 p-3 rounded-lg flex items-center justify-between group hover:bg-white/60 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-totoro-blue/20 flex items-center justify-center text-xl shrink-0">
                    🧪
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-medium truncate text-sm">
                      {potion.recipe.resultingPotion.nome}
                    </h4>
                    {englishName && (
                      <p className="text-xs text-gray-400 italic truncate">{englishName}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span className="font-mono bg-gray-100 px-1.5 rounded">ID: {potionId}</span>
                      <span className="uppercase tracking-wider text-[10px] bg-gray-100 px-1.5 rounded flex items-center">
                        {category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center bg-white/50 rounded overflow-hidden">
                    <button
                      className="px-2 py-1 hover:bg-gray-200 text-xs"
                      onClick={() => data.handleUpdateQuantity(potion.id, potion.quantity, -1)}
                    >
                      -
                    </button>
                    <span className="px-1 text-xs font-medium min-w-[20px] text-center font-mono text-totoro-blue">
                      x{potion.quantity}
                    </span>
                    <button
                      className="px-2 py-1 hover:bg-gray-200 text-xs"
                      onClick={() => data.handleUpdateQuantity(potion.id, potion.quantity, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.handleDeletePotion(
                        potion.id,
                        `${potion.recipe.resultingPotion.nome} (${englishName || ''})`
                      );
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
