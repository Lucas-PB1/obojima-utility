import React from 'react';
import { Button } from '@/components/ui';
import { CollectedIngredient } from '@/types/ingredients';

interface IngredientCardProps {
  ingredient: CollectedIngredient;
  onMarkAsUsed?: (id: string) => void;
  onRemove?: (id: string) => void;
  showActions?: boolean;
}

export function IngredientCard({
  ingredient,
  onMarkAsUsed,
  onRemove,
  showActions = true
}: IngredientCardProps) {
  const maxAttr = Math.max(
    ingredient.ingredient.combat,
    ingredient.ingredient.utility,
    ingredient.ingredient.whimsy
  );

  const getBadgeClass = () => {
    if (ingredient.used) return 'bg-muted/10 border-border/20';
    if (ingredient.ingredient.combat === maxAttr)
      return 'bg-totoro-orange/5 border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]';
    if (ingredient.ingredient.utility === maxAttr)
      return 'bg-totoro-blue/5 border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]';
    return 'bg-totoro-yellow/5 border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]';
  };

  return (
    <div
      className={`glass-panel p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group ${getBadgeClass()}`}
    >
      <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif font-bold text-foreground text-xl leading-tight group-hover:text-totoro-blue transition-colors">
            {ingredient.ingredient.nome}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border font-sans ${
              ingredient.used
                ? 'bg-totoro-gray/10 text-totoro-gray border-totoro-gray/20'
                : 'bg-totoro-green/10 text-totoro-green border-totoro-green/20 animate-pulse'
            }`}
          >
            {ingredient.used ? 'Consumido' : 'Disponível'}
          </span>
        </div>

        <p className="text-sm text-foreground/60 mb-6 line-clamp-3 leading-relaxed italic">
          &quot;{ingredient.ingredient.descricao}&quot;
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="flex flex-col items-center bg-muted/30 p-2 rounded-xl border border-totoro-orange/20 shadow-sm font-sans">
            <span className="text-[9px] font-bold text-totoro-orange/60 uppercase">Cbt</span>
            <span className="text-xl font-bold text-totoro-orange font-mono">
              {ingredient.ingredient.combat}
            </span>
          </div>
          <div className="flex flex-col items-center bg-muted/30 p-2 rounded-xl border border-totoro-blue/20 shadow-sm font-sans">
            <span className="text-[9px] font-bold text-totoro-blue/60 uppercase">Utl</span>
            <span className="text-xl font-bold text-totoro-blue font-mono">
              {ingredient.ingredient.utility}
            </span>
          </div>
          <div className="flex flex-col items-center bg-muted/30 p-2 rounded-xl border border-totoro-yellow/20 shadow-sm font-sans">
            <span className="text-[9px] font-bold text-totoro-yellow/60 uppercase">Why</span>
            <span className="text-xl font-bold text-totoro-yellow font-mono">
              {ingredient.ingredient.whimsy}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider">
            {ingredient.collectedAt.toLocaleDateString('pt-BR')}
          </p>

          {showActions && (
            <div className="flex gap-2">
              {!ingredient.used && onMarkAsUsed && (
                <button
                  onClick={() => onMarkAsUsed(ingredient.id)}
                  className="bg-totoro-blue/10 hover:bg-totoro-blue text-totoro-blue hover:text-white px-4 py-1.5 text-[10px] font-bold rounded-xl transition-all duration-300 font-sans border border-totoro-blue/20"
                >
                  USAR
                </button>
              )}
              {onRemove && (
                <Button
                  onClick={() => onRemove(ingredient.id)}
                  variant="ghost"
                  size="sm"
                  className="!p-1.5 !rounded-xl hover:!text-totoro-orange hover:!bg-totoro-orange/10"
                >
                  🗑️
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute -bottom-10 -left-10 w-40 h-40 opacity-5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 ${
          ingredient.used
            ? 'bg-totoro-gray'
            : ingredient.ingredient.combat === maxAttr
              ? 'bg-totoro-orange'
              : ingredient.ingredient.utility === maxAttr
                ? 'bg-totoro-blue'
                : 'bg-totoro-yellow'
        }`}
      ></div>
    </div>
  );
}
