import React, { useMemo } from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';
import { Loader2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui';

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

  const columns: Column<CreatedPotion>[] = [
    {
      key: 'potion',
      label: t('admin.modal.potions.table.potion'),
      render: (_, potion) => {
        const category = potion.recipe.winningAttribute;
        const potionId = potion.recipe.resultingPotion.id;
        const englishName = getEnglishName(category, potionId);

        return (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-totoro-blue/10 flex items-center justify-center text-lg">
                🧪
             </div>
             <div className="flex flex-col min-w-0">
                <span className="font-bold text-totoro-gray text-sm truncate max-w-[150px] md:max-w-[200px]">
                  {potion.recipe.resultingPotion.nome}
                </span>
                {englishName && (
                  <span className="text-[10px] text-totoro-gray/50 italic truncate max-w-[150px]">
                     {englishName}
                  </span>
                )}
             </div>
          </div>
        );
      }
    },
    {
      key: 'recipe', // Used for details
      label: 'Detalhes',
      render: (_, potion) => {
        const category = potion.recipe.winningAttribute;
        const potionId = potion.recipe.resultingPotion.id;
        return (
             <div className="flex gap-2">
                <span className="font-mono text-[9px] bg-totoro-gray/5 text-totoro-gray/70 px-1.5 py-0.5 rounded">
                  {potionId}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  category === 'combat' ? 'bg-red-100 text-red-600' :
                  category === 'utility' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                   {category}
                </span>
             </div>
        )
      }
    },
    {
      key: 'quantity',
      label: t('admin.modal.potions.table.qty'),
      render: (_, potion) => (
         <div className="flex items-center bg-white border border-totoro-gray/10 rounded-lg overflow-hidden shadow-sm w-fit">
              <button
                className="px-2 py-1 hover:bg-totoro-gray/5 text-xs font-bold text-totoro-gray border-r border-totoro-gray/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(potion.id, potion.quantity, -1);
                }}
              >
                -
              </button>
              <span className="px-2 text-xs font-black min-w-[24px] text-center text-totoro-blue">
                {potion.quantity}
              </span>
              <button
                className="px-2 py-1 hover:bg-totoro-gray/5 text-xs font-bold text-totoro-gray border-l border-totoro-gray/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(potion.id, potion.quantity, 1);
                }}
              >
                +
              </button>
          </div>
      )
    },
    {
        key: 'id', // Used for actions
        label: t('admin.modal.actions.remove'),
        render: (_, potion) => {
            const category = potion.recipe.winningAttribute;
            const potionId = potion.recipe.resultingPotion.id;
            const englishName = getEnglishName(category, potionId);
            return (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.handleDeletePotion(
                        potion.id,
                        `${potion.recipe.resultingPotion.nome} (${englishName || ''})`
                      );
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    🗑️
                </button>
            )
        }
    }
  ];

  const mobileRenderer = (potion: CreatedPotion) => {
     const category = potion.recipe.winningAttribute;
     const potionId = potion.recipe.resultingPotion.id;
     const englishName = getEnglishName(category, potionId);
     
     return (
       <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white shadow-sm mb-3">
         <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-totoro-blue/5 ${
                 category === 'combat' ? 'bg-red-50 text-red-500' :
                 category === 'utility' ? 'bg-blue-50 text-blue-500' :
                 'bg-purple-50 text-purple-500'
            }`}>
               🧪
            </div>
            <div className="flex flex-col gap-1 min-w-0">
               <span className="font-bold text-totoro-gray text-sm leading-tight truncate">
                  {potion.recipe.resultingPotion.nome}
               </span>
               {englishName && (
                  <span className="text-[10px] text-totoro-gray/50 italic truncate">
                     {englishName}
                  </span>
               )}
               <div className="flex gap-2">
                 <span className="font-mono text-[9px] bg-white/80 border border-totoro-gray/10 px-1 rounded text-totoro-gray/60">
                    {potionId}
                 </span>
                 <span className="text-[9px] font-black uppercase tracking-wider text-totoro-gray/40">
                    {category}
                 </span>
               </div>
            </div>
         </div>

         <div className="flex flex-col items-end gap-3 ml-2">
             <div className="flex items-center bg-white border border-totoro-gray/10 rounded-lg overflow-hidden shadow-sm">
              <button
                className="w-8 h-8 flex items-center justify-center hover:bg-totoro-gray/5 text-sm font-bold text-totoro-gray border-r border-totoro-gray/10 active:bg-totoro-gray/10"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(potion.id, potion.quantity, -1);
                }}
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-black text-totoro-blue">
                {potion.quantity}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center hover:bg-totoro-gray/5 text-sm font-bold text-totoro-gray border-l border-totoro-gray/10 active:bg-totoro-gray/10"
                onClick={(e) => {
                  e.stopPropagation();
                  data.handleUpdateQuantity(potion.id, potion.quantity, 1);
                }}
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
                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
             >
                <span>🗑️</span> {t('admin.modal.actions.remove')}
             </button>
         </div>
       </div>
     )
  }

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
              className="w-full text-sm p-2.5 rounded-xl border border-totoro-gray/20 bg-white/50 focus:ring-2 focus:ring-totoro-blue/20 outline-none transition-all"
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
          <div className="w-24">
            <label className="text-xs font-bold text-totoro-gray mb-1.5 block uppercase tracking-wider">
              {t('admin.modal.inventory.add.qty')}
            </label>
            <input
              type="number"
              min="1"
              className="w-full text-sm p-2.5 rounded-xl border border-totoro-gray/20 bg-white/50 focus:ring-2 focus:ring-totoro-blue/20 outline-none transition-all text-center font-bold"
              value={data.addQuantity}
              onChange={(e) => data.setAddQuantity(Number(e.target.value))}
            />
          </div>
          <button
            onClick={data.handleAddItem}
            disabled={!data.selectedUniqueKey || data.submitting}
            className="bg-totoro-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-totoro-blue/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all"
          >
            {data.submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('admin.modal.inventory.add.confirm')}
          </button>
          </div>
        </div>
      )}

      {data.loading && (
          <div className="py-12 flex justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-totoro-blue" />
          </div>
      )}

      {!data.loading && (
        <DataTable
            title={t('admin.modal.potions.title')}
            icon="🧪"
            action={
             <button
              onClick={() => data.setIsAddingItem(!data.isAddingItem)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                 data.isAddingItem
                   ? 'bg-totoro-gray/10 text-totoro-gray hover:bg-totoro-gray/20'
                   : 'bg-totoro-blue/10 text-totoro-blue hover:bg-totoro-blue hover:text-white'
               }`}
            >
              {data.isAddingItem
                ? t('admin.modal.inventory.add.cancel')
                : t('admin.modal.inventory.add.button')}
            </button>
            }
            data={data.potions}
            columns={columns}
            mobileRenderer={mobileRenderer}
            searchKeys={['recipe.resultingPotion.nome']}
            searchPlaceholder={t('potions.search.placeholder')}
        />
      )}
    </div>
  );
}
