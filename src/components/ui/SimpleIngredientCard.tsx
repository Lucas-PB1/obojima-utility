import React from 'react';
import { Ingredient } from '@/types/ingredients';

interface SimpleIngredientCardProps {
  ingredient: Ingredient;
  className?: string;
}

export default function SimpleIngredientCard({
  ingredient,
  className = ''
}: SimpleIngredientCardProps) {
  const maxAttr = Math.max(ingredient.combat, ingredient.utility, ingredient.whimsy);

  const getBadgeClass = () => {
    if (ingredient.combat === maxAttr)
      return 'bg-gradient-to-br from-totoro-orange/10 to-totoro-orange/20 border-totoro-orange/20';
    if (ingredient.utility === maxAttr)
      return 'bg-gradient-to-br from-totoro-blue/10 to-totoro-blue/20 border-totoro-blue/20';
    return 'bg-gradient-to-br from-totoro-yellow/10 to-totoro-yellow/20 border-totoro-yellow/20';
  };

  return (
    <div
      className={`group glass-panel p-5 rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden ${className} ${getBadgeClass()}`}
    >
      <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif font-bold text-totoro-gray text-base leading-tight group-hover:text-totoro-blue transition-colors">
            {ingredient.nome_portugues}
          </h3>
        </div>

        <p className="text-[10px] text-totoro-blue/60 mb-3 font-semibold uppercase tracking-widest font-sans">
          {ingredient.nome_ingles}
        </p>

        <p className="text-xs text-totoro-gray/70 mb-5 line-clamp-2 leading-relaxed italic">
          &quot;{ingredient.descricao}&quot;
        </p>

        <div className="flex justify-center items-center gap-1.5 pt-2 border-t border-black/5">
          <div className="flex flex-col items-center bg-white/80 px-2 py-1 rounded-lg border border-totoro-orange/10 min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-orange/60 uppercase">Cbt</span>
            <span className="text-xs font-bold text-totoro-orange font-mono">
              {ingredient.combat}
            </span>
          </div>
          <div className="flex flex-col items-center bg-white/80 px-2 py-1 rounded-lg border border-totoro-blue/10 min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-blue/60 uppercase">Utl</span>
            <span className="text-xs font-bold text-totoro-blue font-mono">
              {ingredient.utility}
            </span>
          </div>
          <div className="flex flex-col items-center bg-white/80 px-2 py-1 rounded-lg border border-totoro-yellow/10 min-w-[32px] font-sans">
            <span className="text-[9px] font-bold text-totoro-yellow/60 uppercase">Why</span>
            <span className="text-xs font-bold text-totoro-yellow font-mono">
              {ingredient.whimsy}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`absolute -bottom-4 -right-4 w-12 h-12 opacity-5 rounded-full blur-xl ${
          ingredient.combat === maxAttr
            ? 'bg-totoro-orange'
            : ingredient.utility === maxAttr
              ? 'bg-totoro-blue'
              : 'bg-totoro-yellow'
        }`}
      ></div>
    </div>
  );
}
