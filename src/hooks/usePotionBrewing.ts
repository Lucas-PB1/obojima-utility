import { useState, useEffect, useCallback } from 'react';
import { Ingredient, PotionRecipe, PotionBrewingResult } from '@/types/ingredients';
import { potionService } from '@/services/potionService';
import { recipeService } from '@/services/recipeService';
import { createdPotionService } from '@/services/createdPotionService';

/**
 * Hook para gerenciar a lógica de criação de poções no sistema Obojima
 * 
 * @description
 * Este hook encapsula toda a lógica de criação de poções, incluindo:
 * - Seleção e gerenciamento de ingredientes
 * - Cálculo de preview de scores
 * - Lógica de criação de poções com talentos especiais
 * - Gerenciamento de modais e estados
 * 
 */
export function usePotionBrewing() {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [brewingResult, setBrewingResult] = useState<PotionBrewingResult | null>(null);
  const [isBrewing, setIsBrewing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [previewScores, setPreviewScores] = useState<{
    combatScore: number;
    utilityScore: number;
    whimsyScore: number;
    winningAttribute: 'combat' | 'utility' | 'whimsy';
  } | null>(null);
  const [availableScores, setAvailableScores] = useState<{
    scores: Array<{ attribute: 'combat' | 'utility' | 'whimsy'; value: number; label: string }>;
    canChoose: boolean;
  } | null>(null);
  const [chosenAttribute, setChosenAttribute] = useState<'combat' | 'utility' | 'whimsy' | null>(null);
  const [showScoreChoice, setShowScoreChoice] = useState(false);

  useEffect(() => {
    if (selectedIngredients.length === 3) {
      try {
        const scores = potionService.calculateScores(selectedIngredients);
        setPreviewScores(scores);
        
        const available = potionService.calculateAvailableScores(selectedIngredients);
        setAvailableScores(available);
      } catch {
        setPreviewScores(null);
        setAvailableScores(null);
      }
    } else {
      setPreviewScores(null);
      setAvailableScores(null);
      setChosenAttribute(null);
      setShowScoreChoice(false);
    }
  }, [selectedIngredients]);

  /**
   * Adiciona um ingrediente à seleção atual
   * 
   * @param ingredient - Ingrediente a ser adicionado
   */
  const handleIngredientSelect = useCallback((ingredient: Ingredient) => {
    if (selectedIngredients.length >= 3) {
      return;
    }

    if (selectedIngredients.some(ing => ing.id === ingredient.id)) {
      return;
    }

    setSelectedIngredients(prev => [...prev, ingredient]);
  }, [selectedIngredients]);

  /**
   * Remove um ingrediente da seleção atual
   * 
   * @param ingredientId - ID do ingrediente a ser removido
   */
  const handleIngredientRemove = useCallback((ingredientId: number) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  }, []);

  /**
   * Executa a criação de uma poção com os ingredientes selecionados
   * 
   * @param onPotionCreated - Callback executado quando uma poção é criada com sucesso
   * @param onIngredientsUsed - Callback executado quando ingredientes são marcados como usados
   */
  const handleBrewPotion = useCallback(async (
    onPotionCreated?: (recipe: PotionRecipe) => void,
    onIngredientsUsed?: (ingredientIds: number[]) => void
  ) => {
    if (selectedIngredients.length !== 3) {
      return;
    }

    if (availableScores?.canChoose && !chosenAttribute) {
      setShowScoreChoice(true);
      return;
    }

    setIsBrewing(true);
    try {
      const result = await potionService.brewPotion(selectedIngredients, chosenAttribute || undefined);
      setBrewingResult(result);
      setShowResultModal(true);
      
      if (result.success) {
        recipeService.saveRecipe(result.recipe);
        createdPotionService.addCreatedPotion(result.recipe);
        
        if (result.cauldronBonus && result.remainsPotion) {
          try {
            const remainsRecipe: PotionRecipe = {
              id: `remains_${result.recipe.id}`,
              ingredients: [],
              combatScore: 0,
              utilityScore: 0,
              whimsyScore: 0,
              winningAttribute: result.recipe.winningAttribute,
              resultingPotion: result.remainsPotion,
              createdAt: new Date()
            };
            
            recipeService.saveRecipe(remainsRecipe);
            createdPotionService.addCreatedPotion(remainsRecipe);
          } catch (error) {
            console.error('Erro ao gerar poção dos restos:', error);
          }
        }

        if (result.potionBrewerSuccess && result.secondPotion) {
          try {
            const secondRecipe: PotionRecipe = {
              id: `second_${result.recipe.id}`,
              ingredients: [...selectedIngredients],
              combatScore: result.recipe.combatScore,
              utilityScore: result.recipe.utilityScore,
              whimsyScore: result.recipe.whimsyScore,
              winningAttribute: result.recipe.winningAttribute,
              resultingPotion: result.secondPotion,
              createdAt: new Date()
            };
            
            recipeService.saveRecipe(secondRecipe);
            createdPotionService.addCreatedPotion(secondRecipe);
          } catch (error) {
            console.error('Erro ao gerar segunda poção:', error);
          }
        }
        
        const ingredientIds = selectedIngredients.map(ing => ing.id);
        if (onIngredientsUsed) {
          onIngredientsUsed(ingredientIds);
        }
        
        setSelectedIngredients([]);
        
        if (onPotionCreated) {
          onPotionCreated(result.recipe);
        }
      }
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
  }, [selectedIngredients, availableScores, chosenAttribute]);

  /**
   * Limpa a seleção atual de ingredientes e reseta todos os estados
   */
  const handleClearSelection = useCallback(() => {
    setSelectedIngredients([]);
    setBrewingResult(null);
    setPreviewScores(null);
    setAvailableScores(null);
    setChosenAttribute(null);
    setShowScoreChoice(false);
  }, []);

  /**
   * Define o atributo escolhido para a criação da poção
   * 
   * @param attribute - Atributo escolhido (combat, utility, whimsy)
   */
  const handleScoreChoice = useCallback((attribute: 'combat' | 'utility' | 'whimsy') => {
    setChosenAttribute(attribute);
    setShowScoreChoice(false);
  }, []);

  /**
   * Retorna as classes CSS para colorir um atributo específico
   * 
   * @param attribute - Atributo para o qual retornar as classes
   * @returns String com as classes CSS
   */
  const getAttributeColor = useCallback((attribute: 'combat' | 'utility' | 'whimsy') => {
    switch (attribute) {
      case 'combat':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'utility':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'whimsy':
        return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  }, []);

  /**
   * Retorna o label em português para um atributo específico
   * 
   * @param attribute - Atributo para o qual retornar o label
   * @returns String com o label em português
   */
  const getAttributeLabel = useCallback((attribute: 'combat' | 'utility' | 'whimsy') => {
    switch (attribute) {
      case 'combat':
        return 'Combate';
      case 'utility':
        return 'Utilidade';
      case 'whimsy':
        return 'Caprichoso';
    }
  }, []);

  return {
    selectedIngredients,
    brewingResult,
    isBrewing,
    showResultModal,
    previewScores,
    availableScores,
    chosenAttribute,
    showScoreChoice,
    setShowResultModal,
    setShowScoreChoice,
    handleIngredientSelect,
    handleIngredientRemove,
    handleBrewPotion,
    handleClearSelection,
    handleScoreChoice,
    getAttributeColor,
    getAttributeLabel
  };
}
