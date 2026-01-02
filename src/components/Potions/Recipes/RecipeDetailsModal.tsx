import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SimpleIngredientCard from '@/components/ui/SimpleIngredientCard';
import { PotionRecipe } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';

interface RecipeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: PotionRecipe | null;
  onDelete: (recipeId: string) => void;
}

export function RecipeDetailsModal({ isOpen, onClose, recipe, onDelete }: RecipeDetailsModalProps) {
  const { t } = useTranslation();

  if (!recipe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('recipes.details.title')}>
      <div className="space-y-6 pt-2">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            {recipe.resultingPotion.nome}
          </h1>

          <div
            className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${
              recipe.resultingPotion.raridade === 'Comum'
                ? 'bg-totoro-green/20 text-totoro-green'
                : recipe.resultingPotion.raridade === 'Incomum'
                  ? 'bg-totoro-blue/20 text-totoro-blue'
                  : 'bg-totoro-orange/20 text-totoro-orange'
            }`}
          >
            {recipe.resultingPotion.raridade}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
          <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-3 relative z-10">
            {t('recipes.details.effect')}
          </h4>
          <p className="text-sm text-foreground leading-relaxed italic relative z-10">
            &quot;{recipe.resultingPotion.descricao}&quot;
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">
            {t('recipes.details.ingredients')}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {recipe.ingredients.map((ingredient) => (
              <SimpleIngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
          <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-4 relative z-10 text-center">
            {t('recipes.details.potential')}
          </h4>
          <div className="grid grid-cols-3 gap-6 relative z-10">
            {/* Combat Score */}
            <div
              className={`text-center transition-all duration-300 ${
                recipe.winningAttribute === 'combat'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  recipe.winningAttribute === 'combat'
                    ? 'text-totoro-orange'
                    : 'text-totoro-orange/60'
                }`}
              >
                Cbt
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  recipe.winningAttribute === 'combat'
                    ? 'text-totoro-orange drop-shadow-lg'
                    : 'text-totoro-orange/60'
                }`}
              >
                {recipe.combatScore}
                {recipe.winningAttribute === 'combat' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {recipe.winningAttribute === 'combat' && (
                <div className="mt-1 h-1 w-full bg-totoro-orange rounded-full opacity-50"></div>
              )}
            </div>

            {/* Utility Score */}
            <div
              className={`text-center transition-all duration-300 ${
                recipe.winningAttribute === 'utility'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  recipe.winningAttribute === 'utility'
                    ? 'text-totoro-blue'
                    : 'text-totoro-blue/60'
                }`}
              >
                Utl
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  recipe.winningAttribute === 'utility'
                    ? 'text-totoro-blue drop-shadow-lg'
                    : 'text-totoro-blue/60'
                }`}
              >
                {recipe.utilityScore}
                {recipe.winningAttribute === 'utility' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {recipe.winningAttribute === 'utility' && (
                <div className="mt-1 h-1 w-full bg-totoro-blue rounded-full opacity-50"></div>
              )}
            </div>

            {/* Whimsy Score */}
            <div
              className={`text-center transition-all duration-300 ${
                recipe.winningAttribute === 'whimsy'
                  ? 'scale-110 opacity-100'
                  : 'scale-90 opacity-50 grayscale'
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                  recipe.winningAttribute === 'whimsy'
                    ? 'text-totoro-yellow'
                    : 'text-totoro-yellow/60'
                }`}
              >
                Why
              </div>
              <div
                className={`text-3xl font-black font-mono relative inline-block ${
                  recipe.winningAttribute === 'whimsy'
                    ? 'text-totoro-yellow drop-shadow-lg'
                    : 'text-totoro-yellow/60'
                }`}
              >
                {recipe.whimsyScore}
                {recipe.winningAttribute === 'whimsy' && (
                  <div className="absolute -top-3 -right-3 text-xs">👑</div>
                )}
              </div>
              {recipe.winningAttribute === 'whimsy' && (
                <div className="mt-1 h-1 w-full bg-totoro-yellow rounded-full opacity-50"></div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-totoro-blue/5 text-[10px] text-totoro-gray/50 font-bold uppercase tracking-widest relative z-10 text-center">
            {t('recipes.details.predictedDomain')}{' '}
            <span className="text-totoro-blue">
              {t(POTION_CATEGORY_CONFIG[recipe.winningAttribute].label)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => onDelete(recipe.id)}
            variant="ghost"
            className="flex-1 !text-totoro-orange hover:!bg-totoro-orange/10 !rounded-2xl !font-bold"
          >
            {t('recipes.details.delete')}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 !rounded-2xl !font-bold"
          >
            {t('ui.actions.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
