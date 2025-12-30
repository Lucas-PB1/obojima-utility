import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Ingredient } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

export function useLocalizedIngredients() {
  const { language } = useTranslation();
  const [ingredientsMap, setIngredientsMap] = React.useState<Record<number, { nome: string; descricao: string }>>({});

  React.useEffect(() => {
    const loadIngredientsMap = async () => {
      try {
        const [common, uncommon, rare] = await Promise.all([
          ingredientsService.loadCommonIngredients(language),
          ingredientsService.loadUncommonIngredients(language),
          ingredientsService.loadRareIngredients(language)
        ]);

        const map: Record<number, { nome: string; descricao: string }> = {};
        common.ingredients.forEach(i => map[i.id] = { nome: i.nome, descricao: i.descricao });
        uncommon.ingredients.forEach(i => map[i.id] = { nome: i.nome, descricao: i.descricao });
        rare.ingredients.forEach(i => map[i.id] = { nome: i.nome, descricao: i.descricao });
        
        setIngredientsMap(map);
      } catch (error) {
        console.error('Failed to load ingredients map', error);
      }
    };
    
    loadIngredientsMap();
  }, [language]);

  const localizeIngredient = React.useCallback((ingredient: Ingredient) => {
    const localized = ingredientsMap[ingredient.id];
    if (!localized) return ingredient;
    return {
      ...ingredient,
      nome: localized.nome || ingredient.nome,
      descricao: localized.descricao || ingredient.descricao
    };
  }, [ingredientsMap]);

  return { ingredientsMap, localizeIngredient };
}
