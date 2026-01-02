import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import SimpleIngredientCard from '@/components/ui/SimpleIngredientCard';
import { Ingredient, PotionScores } from '@/types/ingredients';
import { ScorePreview } from './ScorePreview';

interface BrewingAreaProps {
  selectedIngredients: Ingredient[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onBrew: () => void;
  isBrewing: boolean;
  previewScores: PotionScores | null;
  availableScores: { canChoose: boolean } | null;
  chosenAttribute: 'combat' | 'utility' | 'whimsy' | null;
}

export function BrewingArea({
  selectedIngredients,
  onRemove,
  onClear,
  onBrew,
  isBrewing,
  previewScores,
  availableScores,
  chosenAttribute
}: BrewingAreaProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('potions.create.title')}
        </h2>
        <p className="text-foreground/60 text-sm">{t('potions.create.subtitle')}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">
          {t('potions.create.selected', selectedIngredients.length)}
        </h3>

        {selectedIngredients.length === 0 ? (
          <div className="text-gray-500 text-sm italic">{t('potions.create.noneSelected')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedIngredients.map((ingredient) => (
              <div key={ingredient.id} className="relative">
                <SimpleIngredientCard ingredient={ingredient} />
                <button
                  onClick={() => onRemove(ingredient.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewScores && (
        <ScorePreview
          previewScores={previewScores}
          availableScores={availableScores}
          chosenAttribute={chosenAttribute}
        />
      )}

      <div className="flex gap-3">
        <Button
          onClick={onBrew}
          disabled={selectedIngredients.length !== 3 || isBrewing}
          className="flex-1"
        >
          {isBrewing ? t('potions.create.button.brewing') : t('potions.create.button.brew')}
        </Button>

        {selectedIngredients.length > 0 && (
          <Button onClick={onClear} variant="secondary">
            {t('potions.create.button.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
