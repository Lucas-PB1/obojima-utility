import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CreatedPotion } from '@/types/ingredients';

interface AdminUserPotionsTabProps {
  data: {
    potions: CreatedPotion[];
    handleDeletePotion: (id: string, name: string) => void;
  };
}

export function AdminUserPotionsTab({ data }: AdminUserPotionsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-panel p-4">
      <div className="flex flex-col gap-2">
        <div className="mb-2 text-xs font-medium text-gray-500 uppercase px-2">
          {t('admin.modal.potions.title')}
        </div>
        {data.potions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {t('admin.modal.empty.potions')}
          </p>
        ) : (
          data.potions.map((potion) => (
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
                  <p className="text-xs text-gray-500 truncate">
                    {potion.recipe.resultingPotion.descricao}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span className="font-bold text-totoro-blue bg-white/50 px-2 py-1 rounded text-sm">
                  x{potion.quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.handleDeletePotion(potion.id, potion.recipe.resultingPotion.nome);
                  }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title={t('admin.modal.actions.remove')}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
