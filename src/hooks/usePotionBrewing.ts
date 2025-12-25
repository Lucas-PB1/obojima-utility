'use client';
import { useSettings } from '@/hooks/useSettings';
import { potionService } from '@/services/potionService';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { Ingredient, PotionRecipe, PotionBrewingResult, Potion } from '@/types/ingredients';

interface UsePotionBrewingProps {
  onPotionCreated?: (recipe: PotionRecipe) => void;
  onIngredientsUsed?: (ingredientIds: number[]) => void;
}

export function usePotionBrewing({ onPotionCreated, onIngredientsUsed }: UsePotionBrewingProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [brewingResult, setBrewingResult] = useState<PotionBrewingResult | null>(null);
  const [isBrewing, setIsBrewing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [chosenAttribute, setChosenAttribute] = useState<'combat' | 'utility' | 'whimsy' | null>(
    null
  );
  const [showScoreChoice, setShowScoreChoice] = useState(false);
  const { settings } = useSettings();

  const previewScores = useMemo(() => {
    if (selectedIngredients.length !== 3) return null;
    try {
      return potionService.calculateScores(selectedIngredients);
    } catch {
      return null;
    }
  }, [selectedIngredients]);

  const availableScores = useMemo(() => {
    if (selectedIngredients.length !== 3) return null;
    try {
      return potionService.calculateAvailableScores(
        selectedIngredients,
        settings.potionBrewerTalent
      );
    } catch {
      return null;
    }
  }, [selectedIngredients, settings.potionBrewerTalent]);

  useEffect(() => {
    if (selectedIngredients.length !== 3) {
      setChosenAttribute(null);
      setShowScoreChoice(false);
    }
  }, [selectedIngredients.length]);

  const handleIngredientSelect = useCallback((ingredient: Ingredient) => {
    setSelectedIngredients((prev) => {
      if (prev.length >= 3 || prev.some((ing) => ing.id === ingredient.id)) {
        return prev;
      }
      return [...prev, ingredient];
    });
  }, []);

  const handleIngredientRemove = useCallback((ingredientId: number) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing.id !== ingredientId));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIngredients([]);
    setBrewingResult(null);
    setChosenAttribute(null);
    setShowScoreChoice(false);
  }, []);

  const handleScoreChoice = useCallback((attribute: 'combat' | 'utility' | 'whimsy') => {
    setChosenAttribute(attribute);
    setShowScoreChoice(false);
  }, []);

  const saveAdditionalPotion = useCallback(
    async (
      baseId: string,
      prefix: string,
      potion: Potion,
      ingredients: Ingredient[] = [],
      mainRecipe?: PotionRecipe
    ) => {
      try {
        const additionalRecipe: PotionRecipe = {
          id: `${prefix}_${baseId}`,
          ingredients: ingredients,
          combatScore: mainRecipe?.combatScore || 0,
          utilityScore: mainRecipe?.utilityScore || 0,
          whimsyScore: mainRecipe?.whimsyScore || 0,
          winningAttribute:
            mainRecipe?.winningAttribute || (potion.raridade === 'Comum' ? 'combat' : 'utility'),
          resultingPotion: potion,
          createdAt: new Date()
        };

        await firebaseRecipeService.saveRecipe(additionalRecipe);
        await firebaseCreatedPotionService.addCreatedPotion(additionalRecipe);
      } catch (error) {
        console.error(`Erro ao gerar poção adicional (${prefix}):`, error);
      }
    },
    []
  );

  const handleBrewPotion = useCallback(async () => {
    if (selectedIngredients.length !== 3) return;

    if (availableScores?.canChoose && !chosenAttribute) {
      setShowScoreChoice(true);
      return;
    }

    setIsBrewing(true);
    try {
      const result = await potionService.brewPotion(
        selectedIngredients,
        chosenAttribute || undefined
      );
      setBrewingResult(result);
      setShowResultModal(true);

      if (!result.success) return;

      await firebaseRecipeService.saveRecipe(result.recipe);
      await firebaseCreatedPotionService.addCreatedPotion(result.recipe);

      if (result.cauldronBonus && result.remainsPotion) {
        await saveAdditionalPotion(
          result.recipe.id,
          'remains',
          result.remainsPotion,
          [],
          result.recipe
        );
      }

      if (result.potionBrewerSuccess && result.secondPotion) {
        await saveAdditionalPotion(
          result.recipe.id,
          'second',
          result.secondPotion,
          [...selectedIngredients],
          result.recipe
        );
      }

      const ingredientIds = selectedIngredients.map((ing) => ing.id);
      onIngredientsUsed?.(ingredientIds);

      setSelectedIngredients([]);
      onPotionCreated?.(result.recipe);
    } catch (error) {
      console.error('Erro ao criar poção:', error);
      setBrewingResult({
        recipe: {
          id: '',
          ingredients: [],
          combatScore: 0,
          utilityScore: 0,
          whimsyScore: 0,
          winningAttribute: 'combat',
          resultingPotion: {
            id: 0,
            nome_ingles: '',
            nome_portugues: '',
            raridade: '',
            descricao: ''
          },
          createdAt: new Date()
        },
        success: false,
        message: 'Erro inesperado ao criar a poção.'
      });
      setShowResultModal(true);
    } finally {
      setIsBrewing(false);
    }
  }, [
    selectedIngredients,
    chosenAttribute,
    availableScores,
    onIngredientsUsed,
    onPotionCreated,
    saveAdditionalPotion
  ]);

  const closeResultModal = useCallback(() => setShowResultModal(false), []);
  const closeScoreChoiceModal = useCallback(() => setShowScoreChoice(false), []);

  return {
    selectedIngredients,
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
  };
}
