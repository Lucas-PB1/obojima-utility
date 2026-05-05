'use client';
import { logger } from '@/utils/logger';
import { useSettings } from '@/hooks/useSettings';
import { potionService } from '@/services/potionService';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { Ingredient, PotionRecipe, PotionBrewingResult, Potion } from '@/types/ingredients';
import {
  canAffordPotion,
  getPotionGoldCost,
  applyPotionGoldCost
} from '@/features/potions/domain/potionEconomy';

interface UsePotionBrewingProps {
  onPotionCreated?: (recipe: PotionRecipe) => void;
  onIngredientsUsed?: (ingredientIds: number[]) => void;
}

export function usePotionBrewing({
  onPotionCreated,
  onIngredientsUsed,
  availableIngredients = []
}: UsePotionBrewingProps & { availableIngredients?: Ingredient[] }) {
  const { localizeIngredient } = useLocalizedIngredients();
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [brewingResult, setBrewingResult] = useState<PotionBrewingResult | null>(null);
  const [isBrewing, setIsBrewing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [chosenAttribute, setChosenAttribute] = useState<'combat' | 'utility' | 'whimsy' | null>(
    null
  );
  const [showScoreChoice, setShowScoreChoice] = useState(false);
  const { settings, updateSetting } = useSettings();
  const [estimatedPotion, setEstimatedPotion] = useState<Potion | null>(null);

  const localizedSelectedIngredients = useMemo(() => {
    return selectedIngredients.map((ing) => localizeIngredient(ing));
  }, [selectedIngredients, localizeIngredient]);

  const localizedAvailableIngredients = useMemo(() => {
    return availableIngredients.map((ing) => localizeIngredient(ing));
  }, [availableIngredients, localizeIngredient]);

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

  const estimatedGoldCost = useMemo(() => getPotionGoldCost(estimatedPotion), [estimatedPotion]);
  const hasEnoughGold = useMemo(
    () => estimatedGoldCost === 0 || canAffordPotion(settings.gold, estimatedPotion),
    [estimatedGoldCost, estimatedPotion, settings.gold]
  );

  useEffect(() => {
    let disposed = false;

    async function loadEstimate() {
      if (selectedIngredients.length !== 3 || (availableScores?.canChoose && !chosenAttribute)) {
        setEstimatedPotion(null);
        return;
      }

      const potion = await potionService.previewResultingPotion(
        selectedIngredients,
        chosenAttribute || undefined,
        settings.language
      );
      if (!disposed) setEstimatedPotion(potion);
    }

    void loadEstimate();

    return () => {
      disposed = true;
    };
  }, [availableScores?.canChoose, chosenAttribute, selectedIngredients, settings.language]);

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
    ): Promise<boolean> => {
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
        return true;
      } catch (error) {
        logger.error(`Erro ao gerar poção adicional (${prefix}):`, error);
        return false;
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

    if (estimatedPotion && !hasEnoughGold) {
      setBrewingResult({
        recipe: {
          id: '',
          ingredients: selectedIngredients,
          combatScore: 0,
          utilityScore: 0,
          whimsyScore: 0,
          winningAttribute: 'combat',
          resultingPotion: estimatedPotion,
          createdAt: new Date()
        },
        success: false,
        message: `Gold insuficiente. Você precisa de ${estimatedGoldCost} gold para criar ${estimatedPotion.nome}.`
      });
      setShowResultModal(true);
      return;
    }

    setIsBrewing(true);
    try {
      const result = await potionService.brewPotion(
        selectedIngredients,
        chosenAttribute || undefined,
        settings.language
      );
      setBrewingResult(result);
      setShowResultModal(true);

      if (!result.success) return;

      const mainCost = getPotionGoldCost(result.recipe.resultingPotion);
      if (!canAffordPotion(settings.gold, result.recipe.resultingPotion)) {
        setBrewingResult({
          ...result,
          success: false,
          message: `Gold insuficiente. Você precisa de ${mainCost} gold para criar ${result.recipe.resultingPotion.nome}.`
        });
        return;
      }

      let remainingGold = applyPotionGoldCost(settings.gold, result.recipe.resultingPotion);
      let goldSpent = mainCost;
      const goldWarnings: string[] = [];

      await firebaseRecipeService.saveRecipe(result.recipe);
      await firebaseCreatedPotionService.addCreatedPotion(result.recipe);

      if (result.cauldronBonus && result.remainsPotion) {
        if (canAffordPotion(remainingGold, result.remainsPotion)) {
          const cost = getPotionGoldCost(result.remainsPotion);
          const saved = await saveAdditionalPotion(
            result.recipe.id,
            'remains',
            result.remainsPotion,
            [],
            result.recipe
          );
          if (saved) {
            remainingGold = applyPotionGoldCost(remainingGold, result.remainsPotion);
            goldSpent += cost;
          } else {
            goldWarnings.push(`A poção extra ${result.remainsPotion.nome} não foi salva.`);
            result.remainsPotion = undefined;
            result.cauldronBonus = false;
          }
        } else {
          goldWarnings.push(
            `Sem gold suficiente para salvar a poção extra ${result.remainsPotion.nome}.`
          );
          result.remainsPotion = undefined;
          result.cauldronBonus = false;
        }
      }

      if (result.potionBrewerSuccess && result.secondPotion) {
        if (canAffordPotion(remainingGold, result.secondPotion)) {
          const cost = getPotionGoldCost(result.secondPotion);
          const saved = await saveAdditionalPotion(
            result.recipe.id,
            'second',
            result.secondPotion,
            [...selectedIngredients],
            result.recipe
          );
          if (saved) {
            remainingGold = applyPotionGoldCost(remainingGold, result.secondPotion);
            goldSpent += cost;
          } else {
            goldWarnings.push(`A segunda poção ${result.secondPotion.nome} não foi salva.`);
            result.secondPotion = undefined;
            result.potionBrewerSuccess = false;
          }
        } else {
          goldWarnings.push(
            `Sem gold suficiente para salvar a segunda poção ${result.secondPotion.nome}.`
          );
          result.secondPotion = undefined;
          result.potionBrewerSuccess = false;
        }
      }

      updateSetting('gold', remainingGold);
      setBrewingResult({
        ...result,
        goldSpent,
        goldBalanceAfter: remainingGold,
        goldWarnings
      });

      const ingredientIds = selectedIngredients.map((ing) => ing.id);
      onIngredientsUsed?.(ingredientIds);

      setSelectedIngredients([]);
      onPotionCreated?.(result.recipe);
    } catch (error) {
      logger.error('Erro ao criar poção:', error);
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
            nome: '',
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
    estimatedPotion,
    estimatedGoldCost,
    hasEnoughGold,
    onIngredientsUsed,
    onPotionCreated,
    saveAdditionalPotion,
    settings.language,
    settings.gold,
    updateSetting
  ]);

  const closeResultModal = useCallback(() => setShowResultModal(false), []);
  const closeScoreChoiceModal = useCallback(() => setShowScoreChoice(false), []);

  return {
    selectedIngredients: localizedSelectedIngredients,
    availableIngredients: localizedAvailableIngredients,
    brewingResult,
    isBrewing,
    showResultModal,
    previewScores,
    availableScores,
    estimatedGoldCost,
    hasEnoughGold,
    currentGold: settings.gold,
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
