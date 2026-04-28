import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CreatedPotion } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { Button } from '@/components/ui';

interface PotionCardProps {
  potion: CreatedPotion;
  onClick: (potion: CreatedPotion) => void;
  onUse: (potionId: string) => void;
}

import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';

export function PotionCard({ potion, onClick, onUse }: PotionCardProps) {
  const { t } = useTranslation();
  const { getEnglishName } = useEnglishPotionNames();

  return (
    <div
      className="glass-panel p-6 rounded-lg border border-transparent shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
      onClick={() => onClick(potion)}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent pointer-events-none"></div>
      <div className="relative z-10 space-y-4">
        <div>
          <h4 className="font-serif font-bold text-foreground text-lg leading-tight group-hover:text-totoro-blue transition-colors">
            {potion.potion.nome}
          </h4>
          <span className="text-xs text-totoro-gray/50 italic font-medium block mt-1">
            {getEnglishName(potion.recipe.winningAttribute, potion.potion.id)}
          </span>
        </div>

        <div className="flex gap-2">
          <div
            className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] ${POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].classes}`}
          >
            #{potion.potion.id} - {t(POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].label)}
          </div>
          <div
            className={`inline-block px-2 py-1 rounded-lg text-xs font-bold tracking-wider backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] ${
              potion.potion.raridade === 'Comum'
                ? 'bg-totoro-green/20 text-totoro-green'
                : potion.potion.raridade === 'Incomum'
                  ? 'bg-totoro-blue/20 text-totoro-blue'
                  : 'bg-totoro-orange/20 text-totoro-orange'
            }`}
          >
            {t(`constants.rarity.${potion.potion.raridade.toLowerCase()}`)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 subtle-divider-top">
          <span
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              potion.quantity > 0
                ? 'bg-totoro-green/10 text-totoro-green shadow-[inset_0_0_0_1px_rgba(var(--success-rgb),0.16)]'
                : 'bg-muted text-foreground/40 shadow-[inset_0_0_0_1px_var(--hairline)]'
            }`}
          >
            {potion.quantity > 0
              ? t('potions.card.available', potion.quantity)
              : t('potions.card.used')}
          </span>

          {potion.quantity > 0 && (
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onUse(potion.id);
              }}
              variant="primary"
              size="sm"
              className="!text-[10px] !font-black !rounded-lg"
            >
              {t('potions.card.use')}
            </Button>
          )}
        </div>

        <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
          {t('potions.card.created', potion.createdAt.toLocaleDateString('pt-BR'))}
        </div>
      </div>
    </div>
  );
}
