import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PotionRecipe } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';

interface RecipeCardProps {
  recipe: PotionRecipe;
  onClick: (recipe: PotionRecipe) => void;
}

import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const { t } = useTranslation();
  const { getEnglishName } = useEnglishPotionNames();

  return (
    <div
      className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
      onClick={() => onClick(recipe)}
    >
      <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
      <div className="relative z-10 space-y-4">
        <div>
          <h4 className="font-serif font-bold text-foreground text-lg leading-tight group-hover:text-totoro-blue transition-colors">
            {recipe.resultingPotion.nome}
          </h4>
          <span className="text-xs text-totoro-gray/50 italic font-medium block mt-1">
            {getEnglishName(recipe.winningAttribute, recipe.resultingPotion.id)}
          </span>
        </div>

        <div
          className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${
            POTION_CATEGORY_CONFIG[recipe.winningAttribute].classes
          }`}
        >
          #{recipe.resultingPotion.id} - {t(POTION_CATEGORY_CONFIG[recipe.winningAttribute].label)}
        </div>

        <div className="grid grid-cols-3 gap-3 py-3 border-y border-totoro-blue/5">
          <div className="text-center">
            <div className="text-[9px] font-bold text-totoro-orange/60 uppercase">Cbt</div>
            <div className="text-lg font-black text-totoro-orange font-mono">
              {recipe.combatScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-totoro-blue/60 uppercase">Utl</div>
            <div className="text-lg font-black text-totoro-blue font-mono">
              {recipe.utilityScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-totoro-yellow/60 uppercase">Why</div>
            <div className="text-lg font-black text-totoro-yellow font-mono">
              {recipe.whimsyScore}
            </div>
          </div>
        </div>

        <div className="text-[9px] font-bold text-totoro-gray/30 uppercase tracking-[0.2em]">
          {t('recipes.card.created', recipe.createdAt.toLocaleDateString('pt-BR'))}
        </div>
      </div>
    </div>
  );
}
