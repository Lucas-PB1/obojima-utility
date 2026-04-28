import React from 'react';
import { Ingredient } from '@/types/ingredients';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';

interface SimpleIngredientCardProps {
  ingredient: Ingredient;
  className?: string;
}

export function SimpleIngredientCard({ ingredient, className = '' }: SimpleIngredientCardProps) {
  const { localizeIngredient } = useLocalizedIngredients();
  const localizedIngredient = localizeIngredient(ingredient);

  const maxAttr = Math.max(
    localizedIngredient.combat,
    localizedIngredient.utility,
    localizedIngredient.whimsy
  );

  const getBadgeClass = () => {
    if (localizedIngredient.combat === maxAttr)
      return 'bg-gradient-to-br from-totoro-orange/10 to-totoro-orange/20 shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.14)]';
    if (localizedIngredient.utility === maxAttr)
      return 'bg-gradient-to-br from-totoro-blue/10 to-totoro-blue/20 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.14)]';
    return 'bg-gradient-to-br from-totoro-yellow/10 to-totoro-yellow/20 shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.14)]';
  };

  return (
    <div
      className={`group glass-panel p-5 rounded-lg border border-transparent transition-all duration-500 hover:shadow-[var(--shadow-raised)] hover:-translate-y-2 relative overflow-hidden ${className} ${getBadgeClass()}`}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif font-bold text-foreground text-base leading-tight group-hover:text-totoro-blue transition-colors">
            {localizedIngredient.nome}
          </h3>
        </div>

        <p className="text-xs text-foreground/60 mb-5 line-clamp-2 leading-relaxed italic">
          &quot;{localizedIngredient.descricao}&quot;
        </p>

        <div className="flex justify-center items-center gap-1.5 pt-2 shadow-[inset_0_1px_0_var(--hairline)]">
          <div className="flex flex-col items-center bg-muted/30 px-2 py-1 rounded-lg shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.15)] min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-orange/60 uppercase">Cbt</span>
            <span className="text-xs font-bold text-totoro-orange font-mono">
              {localizedIngredient.combat}
            </span>
          </div>
          <div className="flex flex-col items-center bg-muted/30 px-2 py-1 rounded-lg shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.15)] min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-blue/60 uppercase">Utl</span>
            <span className="text-xs font-bold text-totoro-blue font-mono">
              {localizedIngredient.utility}
            </span>
          </div>
          <div className="flex flex-col items-center bg-muted/30 px-2 py-1 rounded-lg shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.15)] min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-yellow/60 uppercase">Why</span>
            <span className="text-xs font-bold text-totoro-yellow font-mono">
              {localizedIngredient.whimsy}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`absolute -bottom-4 -right-4 w-12 h-12 opacity-5 rounded-full blur-xl ${
          localizedIngredient.combat === maxAttr
            ? 'bg-totoro-orange'
            : localizedIngredient.utility === maxAttr
              ? 'bg-totoro-blue'
              : 'bg-totoro-yellow'
        }`}
      ></div>
    </div>
  );
}
