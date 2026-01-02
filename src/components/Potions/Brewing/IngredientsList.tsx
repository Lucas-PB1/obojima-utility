import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SimpleIngredientCard } from '@/components/ui';
import { Ingredient } from '@/types/ingredients';

interface IngredientsListProps {
  ingredients: Ingredient[];
  selectedIngredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
}

export function IngredientsList({
  ingredients,
  selectedIngredients,
  onSelect
}: IngredientsListProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-medium text-foreground mb-4">{t('potions.create.available')}</h3>

      {ingredients.length === 0 ? (
        <div className="text-gray-500 text-center py-8">{t('potions.create.noAvailable')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ingredients.map((ingredient, index) => {
            const isSelected = selectedIngredients.some((ing) => ing.id === ingredient.id);
            const isDisabled = isSelected || selectedIngredients.length >= 3;

            return (
              <div
                key={`${ingredient.id}-${index}`}
                className={`cursor-pointer transition-all ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={() => !isDisabled && onSelect(ingredient)}
              >
                <SimpleIngredientCard
                  ingredient={ingredient}
                  className={isSelected ? 'ring-2 ring-green-500' : ''}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
