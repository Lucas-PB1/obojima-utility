'use client';
import { useState, useEffect } from 'react';
import { Potion } from '@/types/ingredients';
import { potionService } from '@/services/potionService';
import { useTranslation } from '@/hooks/useTranslation';

export type AvailablePotion = Potion & {
  uniqueKey: string;
  winningAttribute: 'combat' | 'utility' | 'whimsy';
};

export function usePotionsCatalog() {
  const [availablePotions, setAvailablePotions] = useState<AvailablePotion[]>([]);
  const { language } = useTranslation();

  useEffect(() => {
    const loadPotions = async () => {
      try {
        const [combat, utility, whimsy] = await Promise.all([
          potionService.getPotionsByCategory('combat', language),
          potionService.getPotionsByCategory('utility', language),
          potionService.getPotionsByCategory('whimsy', language)
        ]);

        const combatWithKey = combat.map((p) => ({
          ...p,
          winningAttribute: 'combat' as const,
          uniqueKey: `combat-${p.id}`
        }));

        const utilityWithKey = utility.map((p) => ({
          ...p,
          winningAttribute: 'utility' as const,
          uniqueKey: `utility-${p.id}`
        }));

        const whimsyWithKey = whimsy.map((p) => ({
          ...p,
          winningAttribute: 'whimsy' as const,
          uniqueKey: `whimsy-${p.id}`
        }));

        setAvailablePotions(
          [...combatWithKey, ...utilityWithKey, ...whimsyWithKey].sort((a, b) =>
            a.nome.localeCompare(b.nome)
          )
        );
      } catch (error) {
        console.error('Failed to load potions for dropdown', error);
      }
    };
    loadPotions();
  }, [language]);

  return { availablePotions };
}
