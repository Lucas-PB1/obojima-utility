'use client';
import React from 'react';
import { logger } from '@/utils/logger';
import { Ingredient } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { ingredientsService } from '@/services/ingredientsService';

export function useLocalizedIngredients() {
  const { language } = useTranslation();
  const [ingredientsMap, setIngredientsMap] = React.useState<
    Record<
      string,
      { nome: string; descricao: string; combat: number; utility: number; whimsy: number }
    >
  >({});

  React.useEffect(() => {
    const loadIngredientsMap = async () => {
      try {
        const [common, uncommon, rare] = await Promise.all([
          ingredientsService.loadCommonIngredients(language),
          ingredientsService.loadUncommonIngredients(language),
          ingredientsService.loadRareIngredients(language)
        ]);

        const map: Record<
          string,
          { nome: string; descricao: string; combat: number; utility: number; whimsy: number }
        > = {};
        common.ingredients.forEach(
          (i) =>
            (map[`comum-${i.id}`] = {
              nome: i.nome,
              descricao: i.descricao,
              combat: i.combat,
              utility: i.utility,
              whimsy: i.whimsy
            })
        );
        uncommon.ingredients.forEach(
          (i) =>
            (map[`incomum-${i.id}`] = {
              nome: i.nome,
              descricao: i.descricao,
              combat: i.combat,
              utility: i.utility,
              whimsy: i.whimsy
            })
        );
        rare.ingredients.forEach(
          (i) =>
            (map[`raro-${i.id}`] = {
              nome: i.nome,
              descricao: i.descricao,
              combat: i.combat,
              utility: i.utility,
              whimsy: i.whimsy
            })
        );

        setIngredientsMap(map);
      } catch (error) {
        logger.error('Failed to load ingredients map', error);
      }
    };

    loadIngredientsMap();
  }, [language]);

  const localizeIngredient = React.useCallback(
    (ingredient: Ingredient) => {
      const key = `${ingredient.raridade || 'comum'}-${ingredient.id}`;
      const localized = ingredientsMap[key];
      if (!localized) return ingredient;
      return {
        ...ingredient,
        nome: localized.nome || ingredient.nome,
        descricao: localized.descricao || ingredient.descricao,
        combat: localized.combat ?? ingredient.combat,
        utility: localized.utility ?? ingredient.utility,
        whimsy: localized.whimsy ?? ingredient.whimsy
      };
    },
    [ingredientsMap]
  );

  return { ingredientsMap, localizeIngredient };
}
