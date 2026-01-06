import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CreatedPotion } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { Modal, Button } from '@/components/ui';

interface PotionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  potion: CreatedPotion | null;
  onUse: (potionId: string) => void;
  onDelete: (potionId: string) => void;
}

import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';

export function PotionDetailsModal({
  isOpen,
  onClose,
  potion,
  onUse,
  onDelete
}: PotionDetailsModalProps) {
  const { t } = useTranslation();
  const { getEnglishName } = useEnglishPotionNames();

  if (!potion) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('potions.details.title')}>
      <div className="space-y-6 pt-2">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            {potion.potion.nome}
          </h1>
          <p className="text-sm text-muted-foreground italic mb-4">
            {getEnglishName(potion.recipe.winningAttribute, potion.potion.id)}
          </p>

          <div className="flex justify-center gap-3">
            <div
              className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${
                potion.potion.raridade === 'Comum'
                  ? 'bg-totoro-green/20 text-totoro-green'
                  : potion.potion.raridade === 'Incomum'
                    ? 'bg-totoro-blue/20 text-totoro-blue'
                    : 'bg-totoro-orange/20 text-totoro-orange'
              }`}
            >
              {potion.potion.raridade}
            </div>
            <div
              className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].classes}`}
            >
              {t(POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].label)}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
          <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-3 relative z-10">
            {t('potions.details.desc.arcane')}
          </h4>
          <p className="text-sm text-foreground leading-relaxed italic relative z-10">
            &quot;{potion.potion.descricao}&quot;
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1">
                {t('potions.details.status')}
              </h4>
              <span
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  potion.quantity > 0
                    ? 'bg-totoro-green/10 text-totoro-green'
                    : 'bg-totoro-gray/10 text-totoro-gray'
                }`}
              >
                {potion.quantity > 0
                  ? t('potions.card.available', potion.quantity)
                  : t('potions.card.exhausted')}
              </span>
            </div>

            {potion.quantity > 0 && (
              <Button
                onClick={() => {
                  onUse(potion.id);
                  onClose();
                }}
                variant="primary"
                size="md"
                className="!rounded-2xl !font-bold"
              >
                {t('potions.card.useNow')}
              </Button>
            )}
          </div>

          {potion.used && potion.usedAt && (
            <div className="mt-4 pt-4 border-t border-totoro-blue/5 text-[10px] text-totoro-gray/50 font-bold uppercase tracking-widest relative z-10 text-center">
              {t('potions.details.lastUse', potion.usedAt.toLocaleDateString('pt-BR'))}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
          <h4 className="text-[10px] font-black text-totoro-blue/60 uppercase tracking-[0.2em] mb-4 relative z-10 text-center">
            {t('potions.result.scores')}
          </h4>
          <div className="grid grid-cols-3 gap-6 relative z-10">
            {/* Combat Score */}
            <div
              className={`text-center transition-all duration-300 ${
                potion.recipe.winningAttribute === 'combat'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  potion.recipe.winningAttribute === 'combat'
                    ? 'text-totoro-orange'
                    : 'text-totoro-orange/60'
                }`}
              >
                Cbt
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  potion.recipe.winningAttribute === 'combat'
                    ? 'text-totoro-orange drop-shadow-lg'
                    : 'text-totoro-orange/60'
                }`}
              >
                {potion.recipe.combatScore}
                {potion.recipe.winningAttribute === 'combat' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {potion.recipe.winningAttribute === 'combat' && (
                <div className="mt-1 h-1 w-full bg-totoro-orange rounded-full opacity-50"></div>
              )}
            </div>

            {/* Utility Score */}
            <div
              className={`text-center transition-all duration-300 ${
                potion.recipe.winningAttribute === 'utility'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  potion.recipe.winningAttribute === 'utility'
                    ? 'text-totoro-blue'
                    : 'text-totoro-blue/60'
                }`}
              >
                Utl
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  potion.recipe.winningAttribute === 'utility'
                    ? 'text-totoro-blue drop-shadow-lg'
                    : 'text-totoro-blue/60'
                }`}
              >
                {potion.recipe.utilityScore}
                {potion.recipe.winningAttribute === 'utility' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {potion.recipe.winningAttribute === 'utility' && (
                <div className="mt-1 h-1 w-full bg-totoro-blue rounded-full opacity-50"></div>
              )}
            </div>

            {/* Whimsy Score */}
            <div
              className={`text-center transition-all duration-300 ${
                potion.recipe.winningAttribute === 'whimsy'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  potion.recipe.winningAttribute === 'whimsy'
                    ? 'text-totoro-yellow'
                    : 'text-totoro-yellow/60'
                }`}
              >
                Why
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  potion.recipe.winningAttribute === 'whimsy'
                    ? 'text-totoro-yellow drop-shadow-lg'
                    : 'text-totoro-yellow/60'
                }`}
              >
                {potion.recipe.whimsyScore}
                {potion.recipe.winningAttribute === 'whimsy' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {potion.recipe.winningAttribute === 'whimsy' && (
                <div className="mt-1 h-1 w-full bg-totoro-yellow rounded-full opacity-50"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => onDelete(potion.id)}
            variant="ghost"
            className="flex-1 !text-totoro-orange hover:!bg-totoro-orange/10 !rounded-2xl !font-bold"
          >
            {t('ui.actions.delete')}
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1 !rounded-2xl !font-bold">
            {t('ui.actions.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
