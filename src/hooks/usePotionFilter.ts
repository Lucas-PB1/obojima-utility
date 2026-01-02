'use client';
import { useState, useMemo } from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { PotionFilterType } from '@/constants/potions';

export function usePotionFilter(potions: CreatedPotion[]) {
  const [filter, setFilter] = useState<PotionFilterType>('all');

  const filteredPotions = useMemo(() => {
    const result = potions.filter((potion) => {
      if (filter === 'all') return true;
      if (filter === 'available') return potion.quantity > 0;
      if (filter === 'used') return potion.used;
      return true;
    });

    return result.sort((a, b) => {
      // Sort by Category Order
      const categoryOrder = { combat: 1, utility: 2, whimsy: 3 };
      const catA = categoryOrder[a.recipe.winningAttribute as keyof typeof categoryOrder] || 99;
      const catB = categoryOrder[b.recipe.winningAttribute as keyof typeof categoryOrder] || 99;

      if (catA !== catB) return catA - catB;

      // Sort by ID (Number)
      return a.potion.id - b.potion.id;
    });
  }, [potions, filter]);

  return { filteredPotions, filter, setFilter };
}
