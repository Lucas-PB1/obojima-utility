import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PotionRecipe } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: PotionRecipe[];
  filter: 'all' | 'combat' | 'utility' | 'whimsy';
  onRecipeClick: (recipe: PotionRecipe) => void;
}

export function RecipeList({ recipes, filter, onRecipeClick }: RecipeListProps) {
  const { t } = useTranslation();

  if (recipes.length === 0) {
    return (
      <div className="glass-panel text-foreground/50 text-center py-12 rounded-3xl border border-dashed border-border/40">
        <div className="text-4xl mb-3">📜</div>
        <p className="text-sm font-medium">
          {filter === 'all'
            ? t('recipes.empty.all')
            : t(
                'recipes.empty.filtered',
                POTION_CATEGORY_CONFIG[filter as keyof typeof POTION_CATEGORY_CONFIG]?.label
                  ? t(POTION_CATEGORY_CONFIG[filter as keyof typeof POTION_CATEGORY_CONFIG].label)
                  : ''
              )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
      ))}
    </div>
  );
}
