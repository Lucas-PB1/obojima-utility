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
        const [common, uncommon, rare, unique] = await Promise.all([
          ingredientsService.loadCommonIngredients(),
          ingredientsService.loadUncommonIngredients(),
          ingredientsService.loadRareIngredients(),
          ingredientsService.loadUniqueIngredients()
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

        const uniqueWithKey = unique.ingredients.map((i) => ({
          ...i,
          combat: 20,
          utility: 20,
          whimsy: 20,
          descricao: `${i.circunstancia}. Localização: ${i.localizacao}`,
          raridade: 'unico' as const,
          uniqueKey: `unico-${i.id}`
        }));

        setAvailableIngredients(
          [...commonWithKey, ...uncommonWithKey, ...rareWithKey, ...uniqueWithKey].sort((a, b) =>
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
