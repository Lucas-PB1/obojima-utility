'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient, PotionRecipe, PotionBrewingResult } from '../types/ingredients';
import { potionService } from '../services/potionService';
import { firebaseRecipeService } from '../services/firebaseRecipeService';
import { firebaseCreatedPotionService } from '../services/firebaseCreatedPotionService';
import Button from './ui/Button';
import ContentCard from './ui/ContentCard';
import SimpleIngredientCard from './ui/SimpleIngredientCard';
import Modal from './ui/Modal';

interface PotionBrewingProps {
  availableIngredients: Ingredient[];
  onPotionCreated?: (recipe: PotionRecipe) => void;
  onIngredientsUsed?: (ingredientIds: number[]) => void;
}

/**
 * Componente para criação de poções
 * 
 * @description
 * Este componente permite selecionar ingredientes e criar poções,
 * incluindo sistema de scores, escolha de atributos e aplicação de talentos.
 * 
 * @param availableIngredients - Lista de ingredientes disponíveis
 * @param onPotionCreated - Callback executado quando uma poção é criada
 * @param onIngredientsUsed - Callback executado quando ingredientes são usados
 */
export const PotionBrewing: React.FC<PotionBrewingProps> = ({
  availableIngredients,
  onPotionCreated,
  onIngredientsUsed
}) => {
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

  const handleIngredientSelect = (ingredient: Ingredient) => {
    if (selectedIngredients.length >= 3) {
      return;
    }

    if (selectedIngredients.some(ing => ing.id === ingredient.id)) {
      return;
    }

    setSelectedIngredients(prev => [...prev, ingredient]);
  };

  const handleIngredientRemove = (ingredientId: number) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  };

  const handleBrewPotion = async () => {
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
        await firebaseRecipeService.saveRecipe(result.recipe);
        
        await firebaseCreatedPotionService.addCreatedPotion(result.recipe);
        
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
            
            await firebaseRecipeService.saveRecipe(remainsRecipe);
            await firebaseCreatedPotionService.addCreatedPotion(remainsRecipe);
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
            
            await firebaseRecipeService.saveRecipe(secondRecipe);
            await firebaseCreatedPotionService.addCreatedPotion(secondRecipe);
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
  };

  const handleClearSelection = () => {
    setSelectedIngredients([]);
    setBrewingResult(null);
    setPreviewScores(null);
    setAvailableScores(null);
    setChosenAttribute(null);
    setShowScoreChoice(false);
  };

  const handleScoreChoice = (attribute: 'combat' | 'utility' | 'whimsy') => {
    setChosenAttribute(attribute);
    setShowScoreChoice(false);
  };

  const getAttributeColor = (attribute: 'combat' | 'utility' | 'whimsy') => {
    switch (attribute) {
      case 'combat':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'utility':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'whimsy':
        return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getAttributeLabel = (attribute: 'combat' | 'utility' | 'whimsy') => {
    switch (attribute) {
      case 'combat':
        return 'Combate';
      case 'utility':
        return 'Utilidade';
      case 'whimsy':
        return 'Caprichoso';
    }
  };

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Criação de Poções
            </h2>
            <p className="text-gray-600 text-sm">
              Selecione exatamente 3 ingredientes únicos para criar uma poção. 
              O tipo de poção será determinado pelos atributos dos ingredientes.
            </p>
          </div>

          {/* Ingredientes Selecionados */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Ingredientes Selecionados ({selectedIngredients.length}/3)
            </h3>
            
            {selectedIngredients.length === 0 ? (
              <div className="text-gray-500 text-sm italic">
                Nenhum ingrediente selecionado
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedIngredients.map((ingredient) => (
                  <div key={ingredient.id} className="relative">
                    <SimpleIngredientCard ingredient={ingredient} />
                    <button
                      onClick={() => handleIngredientRemove(ingredient.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview dos Scores */}
          {previewScores && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Preview da Receita
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border ${getAttributeColor('combat')} ${previewScores.winningAttribute === 'combat' ? 'ring-2 ring-red-300' : ''}`}>
                  <div className="text-xs font-medium">Combate</div>
                  <div className="text-lg font-bold">{previewScores.combatScore}</div>
                </div>
                <div className={`p-3 rounded-lg border ${getAttributeColor('utility')} ${previewScores.winningAttribute === 'utility' ? 'ring-2 ring-blue-300' : ''}`}>
                  <div className="text-xs font-medium">Utilidade</div>
                  <div className="text-lg font-bold">{previewScores.utilityScore}</div>
                </div>
                <div className={`p-3 rounded-lg border ${getAttributeColor('whimsy')} ${previewScores.winningAttribute === 'whimsy' ? 'ring-2 ring-purple-300' : ''}`}>
                  <div className="text-xs font-medium">Caprichoso</div>
                  <div className="text-lg font-bold">{previewScores.whimsyScore}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Categoria vencedora: <span className="font-medium">{getAttributeLabel(previewScores.winningAttribute)}</span>
              </div>
              
              {/* Indicação do Potion Brewer */}
              {availableScores?.canChoose && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center text-purple-700 text-sm">
                    <span className="mr-2">🧪</span>
                    <span className="font-medium">Potion Brewer Ativo:</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Você pode escolher entre os scores disponíveis ao criar a poção
                  </p>
                  {chosenAttribute && (
                    <p className="text-xs text-purple-800 mt-1 font-medium">
                      Escolhido: {getAttributeLabel(chosenAttribute)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleBrewPotion}
              disabled={selectedIngredients.length !== 3 || isBrewing}
              className="flex-1"
            >
              {isBrewing ? 'Criando Poção...' : 'Criar Poção'}
            </Button>
            
            {selectedIngredients.length > 0 && (
              <Button
                onClick={handleClearSelection}
                variant="secondary"
              >
                Limpar Seleção
              </Button>
            )}
          </div>
        </div>
      </ContentCard>

      {/* Lista de Ingredientes Disponíveis */}
      <ContentCard>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ingredientes Disponíveis
          </h3>
          
          {availableIngredients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Nenhum ingrediente disponível para criação de poções
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableIngredients.map((ingredient, index) => {
                const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id);
                const isDisabled = isSelected || selectedIngredients.length >= 3;
                
                return (
                  <div
                    key={`${ingredient.id}-${index}`}
                    className={`cursor-pointer transition-all ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                    onClick={() => !isDisabled && handleIngredientSelect(ingredient)}
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
      </ContentCard>

      {/* Modal de Resultado */}
      {brewingResult && (
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={brewingResult.success ? "Poção Criada!" : "Erro na Criação"}
        >
          <div className="space-y-4">
            {brewingResult.success ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {brewingResult.recipe.resultingPotion.nome_portugues}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {brewingResult.recipe.resultingPotion.nome_ingles}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    brewingResult.recipe.resultingPotion.raridade === 'Comum' ? 'bg-green-100 text-green-800' :
                    brewingResult.recipe.resultingPotion.raridade === 'Incomum' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {brewingResult.recipe.resultingPotion.raridade}
                  </div>
                </div>

                {/* Poção dos Restos */}
                {brewingResult.cauldronBonus && brewingResult.remainsPotion && (
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-lg mb-2">✨</div>
                      <h4 className="font-bold text-green-800 text-lg mb-2">
                        Poção dos Restos
                      </h4>
                      <p className="text-green-700 text-sm mb-3">
                        Gerada pelo Caldeirão Especial
                      </p>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-700 mb-1">
                          {brewingResult.remainsPotion.nome_portugues}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {brewingResult.remainsPotion.nome_ingles}
                        </div>
                        <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                          {brewingResult.remainsPotion.raridade}
                        </div>
                        <p className="text-xs text-gray-700">
                          {brewingResult.remainsPotion.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Segunda Poção do Potion Brewer */}
                {brewingResult.potionBrewerSuccess && brewingResult.secondPotion && (
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-lg mb-2">🧪</div>
                      <h4 className="font-bold text-purple-800 text-lg mb-2">
                        Segunda Poção
                      </h4>
                      <p className="text-purple-700 text-sm mb-3">
                        Gerada pelo Potion Brewer (Rolagem: {brewingResult.percentageRoll}%)
                      </p>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-700 mb-1">
                          {brewingResult.secondPotion.nome_portugues}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {brewingResult.secondPotion.nome_ingles}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                          brewingResult.secondPotion.raridade === 'Comum' ? 'bg-green-100 text-green-800' :
                          brewingResult.secondPotion.raridade === 'Incomum' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {brewingResult.secondPotion.raridade}
                        </div>
                        <p className="text-xs text-gray-700">
                          {brewingResult.secondPotion.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resultado do Potion Brewer (falha) */}
                {brewingResult.potionBrewerSuccess === false && (
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg mb-2">🧪</div>
                      <h4 className="font-bold text-gray-700 text-lg mb-2">
                        Potion Brewer
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Rolagem: {brewingResult.percentageRoll}% - Não foi possível gerar uma segunda poção
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
                  <p className="text-sm text-gray-700">
                    {brewingResult.recipe.resultingPotion.descricao}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Scores da Receita:</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-red-600">Combate</div>
                      <div className="text-lg font-bold">{brewingResult.recipe.combatScore}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">Utilidade</div>
                      <div className="text-lg font-bold">{brewingResult.recipe.utilityScore}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">Caprichoso</div>
                      <div className="text-lg font-bold">{brewingResult.recipe.whimsyScore}</div>
                    </div>
                  </div>
                </div>

              </>
            ) : (
              <div className="text-center text-red-600">
                <div className="text-lg font-medium mb-2">Erro</div>
                <p className="text-sm">{brewingResult.message}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowResultModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Escolha de Score */}
      {showScoreChoice && availableScores && (
        <Modal
          isOpen={showScoreChoice}
          onClose={() => setShowScoreChoice(false)}
          title="🧪 Escolher Tipo de Poção"
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                O talento Potion Brewer permite escolher entre o 1º e 2º maior score. 
                Qual tipo de poção você deseja criar?
              </p>
            </div>

            <div className="space-y-3">
              {availableScores.scores.map((score, index) => (
                <button
                  key={score.attribute}
                  onClick={() => handleScoreChoice(score.attribute)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    getAttributeColor(score.attribute)
                  } hover:shadow-md hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-bold text-lg">{score.label}</div>
                      <div className="text-sm opacity-80">Score: {score.value}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{score.value}</div>
                      {index === 0 && (
                        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1">
                          1º Maior Score
                        </div>
                      )}
                      {index === 1 && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1">
                          2º Maior Score
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowScoreChoice(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
