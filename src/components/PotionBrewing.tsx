'use client';
import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { usePotionBrewing } from '@/hooks/usePotionBrewing';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { Ingredient, PotionRecipe } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { BrewingResultModal } from './Potions/Brewing/BrewingResultModal';
import { BrewingArea } from './Potions/Brewing/BrewingArea';
import { IngredientsList } from './Potions/Brewing/IngredientsList';

interface PotionBrewingProps {
  availableIngredients: Ingredient[];
  onPotionCreated?: (recipe: PotionRecipe) => void;
  onIngredientsUsed?: (ingredientIds: number[]) => void;
}

export const PotionBrewing: React.FC<PotionBrewingProps> = ({
  availableIngredients: rawAvailableIngredients,
  onPotionCreated,
  onIngredientsUsed
}) => {
  const { t } = useTranslation();

  const {
    selectedIngredients,
    availableIngredients,
    brewingResult,
    isBrewing,
    showResultModal,
    previewScores,
    availableScores,
    chosenAttribute,
    showScoreChoice,
    handleIngredientSelect,
    handleIngredientRemove,
    handleClearSelection,
    handleScoreChoice,
    handleBrewPotion,
    closeResultModal,
    closeScoreChoiceModal
  } = usePotionBrewing({
    onPotionCreated,
    onIngredientsUsed,
    availableIngredients: rawAvailableIngredients
  });

  return (
    <div className="space-y-6">
      <ContentCard>
        <BrewingArea
          selectedIngredients={selectedIngredients}
          onRemove={handleIngredientRemove}
          onClear={handleClearSelection}
          onBrew={handleBrewPotion}
          isBrewing={isBrewing}
          previewScores={previewScores}
          availableScores={availableScores}
          chosenAttribute={chosenAttribute}
        />
      </ContentCard>

      <ContentCard>
        <IngredientsList
          ingredients={availableIngredients || []}
          selectedIngredients={selectedIngredients}
          onSelect={handleIngredientSelect}
        />
      </ContentCard>

      <BrewingResultModal
        isOpen={showResultModal}
        onClose={closeResultModal}
        result={brewingResult}
      />

      {showScoreChoice && availableScores && (
        <Modal
          isOpen={showScoreChoice}
          onClose={closeScoreChoiceModal}
          title={t('potions.choice.title')}
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t('potions.choice.desc')}</p>
            </div>

            <div className="space-y-3">
              {availableScores.scores.map((score, index) => (
                <button
                  key={score.attribute}
                  onClick={() => handleScoreChoice(score.attribute)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    POTION_CATEGORY_CONFIG[score.attribute].classes
                  } hover:shadow-md hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-bold text-lg">
                        {t(POTION_CATEGORY_CONFIG[score.attribute].label)}
                      </div>
                      <div className="text-sm opacity-80">Score: {score.value}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{score.value}</div>
                      {index === 0 && (
                        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1">
                          {t('potions.choice.rank', '1')}
                        </div>
                      )}
                      {index === 1 && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1">
                          {t('potions.choice.rank', '2')}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button onClick={closeScoreChoiceModal} variant="secondary">
                {t('ui.actions.cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
