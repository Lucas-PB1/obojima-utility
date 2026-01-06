import { useState, useEffect } from 'react';
import { Potion } from '@/types/ingredients';
import { potionService } from '@/services/potionService';

export function useEnglishPotionNames() {
  const [englishNames, setEnglishNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEnglishNames = async () => {
      try {
        const [combat, utility, whimsy] = await Promise.all([
          potionService.getPotionsByCategory('combat', 'en'),
          potionService.getPotionsByCategory('utility', 'en'),
          potionService.getPotionsByCategory('whimsy', 'en')
        ]);

        if (!mounted) return;

        const names: Record<string, string> = {};

        const processPotions = (potions: Potion[], category: string) => {
          potions.forEach((p) => {
            names[`${category}-${p.id}`] = p.nome;
          });
        };

        processPotions(combat, 'combat');
        processPotions(utility, 'utility');
        processPotions(whimsy, 'whimsy');

        setEnglishNames(names);
      } catch (error) {
        console.error('Error loading english potion names:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEnglishNames();

    return () => {
      mounted = false;
    };
  }, []);

  const getEnglishName = (category: string, id: number | string) => {
    return englishNames[`${category}-${id}`];
  };

  return { getEnglishName, loading, englishNames };
}
