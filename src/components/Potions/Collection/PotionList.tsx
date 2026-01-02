import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CreatedPotion } from '@/types/ingredients';
import { PotionFilterType } from '@/constants/potions';
import { PotionCard } from './PotionCard';

interface PotionListProps {
  potions: CreatedPotion[];
  filter: PotionFilterType;
  loading?: boolean;
  onPotionClick: (potion: CreatedPotion) => void;
  onUsePotion: (potionId: string) => void;
}

export function PotionList({ potions, filter, onPotionClick, onUsePotion }: PotionListProps) {
  const { t } = useTranslation();

  if (potions.length === 0) {
    return (
      <div className="glass-panel text-foreground/50 text-center py-12 rounded-3xl border border-dashed border-border/40">
        <div className="text-4xl mb-3">🧪</div>
        <p className="text-sm font-medium">
          {filter === 'all'
            ? t('potions.collection.empty.all')
            : filter === 'available'
              ? t('potions.collection.empty.available')
              : t('potions.collection.empty.used')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {potions.map((potion) => (
        <PotionCard key={potion.id} potion={potion} onClick={onPotionClick} onUse={onUsePotion} />
      ))}
    </div>
  );
}
