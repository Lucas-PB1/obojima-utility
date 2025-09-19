'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient, PotionRecipe, PotionBrewingResult } from '../types/ingredients';
import { potionService } from '../services/potionService';
import { recipeService } from '../services/recipeService';
import { createdPotionService } from '../services/createdPotionService';
import Button from './ui/Button';
import ContentCard from './ui/ContentCard';
import SimpleIngredientCard from './ui/SimpleIngredientCard';
import Modal from './ui/Modal';

interface PotionBrewingProps {
  availableIngredients: Ingredient[];
  onPotionCreated?: (recipe: PotionRecipe) => void;
  onIngredientsUsed?: (ingredientIds: number[]) => void;
}

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

  // Calcular preview dos scores quando ingredientes são selecionados
  useEffect(() => {
    if (selectedIngredients.length === 3) {
      try {
        const scores = potionService.calculateScores(selectedIngredients);
        setPreviewScores(scores);
      } catch {
        setPreviewScores(null);
      }
    } else {
      setPreviewScores(null);
    }
  }, [selectedIngredients]);

  const handleIngredientSelect = (ingredient: Ingredient) => {
    if (selectedIngredients.length >= 3) {
      return; // Máximo de 3 ingredientes
    }

    // Verificar se o ingrediente já foi selecionado
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

    setIsBrewing(true);
    try {
      const result = await potionService.brewPotion(selectedIngredients);
      setBrewingResult(result);
      setShowResultModal(true);
      
      if (result.success) {
        // Salvar a receita
        recipeService.saveRecipe(result.recipe);
        
        // Adicionar a poção criada ao inventário
        createdPotionService.addCreatedPotion(result.recipe);
        
        // Marcar ingredientes como usados
        const ingredientIds = selectedIngredients.map(ing => ing.id);
        if (onIngredientsUsed) {
          onIngredientsUsed(ingredientIds);
        }
        
        // Limpar seleção após sucesso
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
              {availableIngredients.map((ingredient) => {
                const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id);
                const isDisabled = isSelected || selectedIngredients.length >= 3;
                
                return (
                  <div
                    key={ingredient.id}
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
    </div>
  );
};
