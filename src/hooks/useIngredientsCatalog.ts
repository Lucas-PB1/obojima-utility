'use client';
import { useState, useEffect } from 'react';
import { Ingredient } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

export type AvailableIngredient = Ingredient & { uniqueKey: string };

export function useIngredientsCatalog() {
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const [common, uncommon, rare] = await Promise.all([
          ingredientsService.loadCommonIngredients(),
          ingredientsService.loadUncommonIngredients(),
          ingredientsService.loadRareIngredients()
        ]);

        const commonWithKey = common.ingredients.map((i) => ({
          ...i,
          raridade: 'comum' as const,
          uniqueKey: `comum-${i.id}`
        }));

        const uncommonWithKey = uncommon.ingredients.map((i) => ({
          ...i,
          raridade: 'incomum' as const,
          uniqueKey: `incomum-${i.id}`
        }));

        const rareWithKey = rare.ingredients.map((i) => ({
          ...i,
          raridade: 'raro' as const,
          uniqueKey: `raro-${i.id}`
        }));

        setAvailableIngredients(
          [...commonWithKey, ...uncommonWithKey, ...rareWithKey].sort((a, b) =>
            a.nome.localeCompare(b.nome)
          )
        );
      } catch (error) {
        console.error('Failed to load ingredients for dropdown', error);
      }
    };
    loadIngredients();
  }, []);

  return { availableIngredients };
}
