import { useState, useEffect } from 'react';
import { ingredientsService } from '@/services/ingredientsService';

export function useEnglishIngredientNames() {
  const [englishNames, setEnglishNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEnglishNames = async () => {
      try {
        const [common, uncommon, rare, unique] = await Promise.all([
          ingredientsService.loadCommonIngredients('en'),
          ingredientsService.loadUncommonIngredients('en'),
          ingredientsService.loadRareIngredients('en'),
          ingredientsService.loadUniqueIngredients('en')
        ]);

        if (!mounted) return;

        const names: Record<string, string> = {};
        
        common.ingredients.forEach(i => (names[`comum-${i.id}`] = i.nome));
        uncommon.ingredients.forEach(i => (names[`incomum-${i.id}`] = i.nome));
        rare.ingredients.forEach(i => (names[`raro-${i.id}`] = i.nome));
        unique.ingredients.forEach(i => (names[`unico-${i.id}`] = i.nome));

        setEnglishNames(names);
      } catch (error) {
        console.error('Error loading english ingredient names:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEnglishNames();

    return () => {
      mounted = false;
    };
  }, []);

  const getEnglishName = (id: number, rarity?: string) => {
    // If no rarity provided, try to find in common first (backwards compatibilityish, but risky)
    // Better to require it, but for now defaults to 'comum' if undefined to match previous behavior logic which likely assumed common or just collided.
    const key = `${rarity || 'comum'}-${id}`; 
    return englishNames[key];
  };

  return { getEnglishName, loading, englishNames };
}
