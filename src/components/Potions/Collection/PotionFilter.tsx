import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PotionFilterType, POTION_FILTER_OPTIONS } from '@/constants/potions';

interface PotionFilterProps {
  filter: PotionFilterType;
  setFilter: (filter: PotionFilterType) => void;
  filteredCount: number;
}

export function PotionFilter({ filter, setFilter, filteredCount }: PotionFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 bg-totoro-blue rounded-full"></span>
        {t('potions.collection.myPotions', filteredCount)}
      </h3>

      <div className="flex flex-wrap gap-2 p-1 bg-primary/5 rounded-2xl border border-border/40 backdrop-blur-sm">
        {POTION_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
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
