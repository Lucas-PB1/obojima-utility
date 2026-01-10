'use client';
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

        common.ingredients.forEach((i) => (names[`comum-${i.id}`] = i.nome));
        uncommon.ingredients.forEach((i) => (names[`incomum-${i.id}`] = i.nome));
        rare.ingredients.forEach((i) => (names[`raro-${i.id}`] = i.nome));
        unique.ingredients.forEach((i) => {
          names[`unico-${i.id}`] = i.nome;
          if ([15, 16, 17, 18, 19, 21].includes(i.id)) {
            names[`raro-${i.id}`] = i.nome;
          }
        });

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
    let r = (rarity || 'comum').toLowerCase();
    if (r === 'unique') r = 'unico';
    if (r === 'ú' || r === 'único') r = 'unico';

    const key = `${r}-${id}`;
    return englishNames[key];
  };

  return { getEnglishName, loading, englishNames };
}
