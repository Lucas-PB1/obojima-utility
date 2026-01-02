import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { RECIPE_FILTER_OPTIONS } from '@/constants/potions';

interface RecipeFilterProps {
  filter: 'all' | 'combat' | 'utility' | 'whimsy';
  setFilter: (filter: 'all' | 'combat' | 'utility' | 'whimsy') => void;
  filteredCount: number;
}

export function RecipeFilter({ filter, setFilter, filteredCount }: RecipeFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 bg-totoro-blue rounded-full"></span>
        {t('recipes.myRecipes', filteredCount)}
      </h3>

      <div className="flex flex-wrap gap-2 p-1 bg-primary/5 rounded-2xl border border-border/40 backdrop-blur-sm">
        {RECIPE_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as 'all' | 'combat' | 'utility' | 'whimsy')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              filter === option.value
                ? 'bg-totoro-blue text-white shadow-lg shadow-totoro-blue/20'
                : 'text-foreground/50 hover:text-totoro-blue hover:bg-muted'
            }`}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
