'use client';
import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { usePotionBrewing } from '@/hooks/usePotionBrewing';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { Ingredient, PotionRecipe } from '@/types/ingredients';
import SimpleIngredientCard from '@/components/ui/SimpleIngredientCard';

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
  const {
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
  } = usePotionBrewing({ onPotionCreated, onIngredientsUsed });

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Criação de Poções</h2>
            <p className="text-foreground/60 text-sm">
              Selecione exatamente 3 ingredientes únicos para criar uma poção. O tipo de poção será
              determinado pelos atributos dos ingredientes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-3">
              Ingredientes Selecionados ({selectedIngredients.length}/3)
            </h3>

            {selectedIngredients.length === 0 ? (
              <div className="text-gray-500 text-sm italic">Nenhum ingrediente selecionado</div>
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

          {previewScores && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border/20">
              <h4 className="text-sm font-medium text-foreground mb-3">Preview da Receita</h4>
              <div className="grid grid-cols-3 gap-4">
                {(['combat', 'utility', 'whimsy'] as const).map((attr) => (
                  <div
                    key={attr}
                    className={`p-3 rounded-lg border ${POTION_CATEGORY_CONFIG[attr].classes} ${previewScores.winningAttribute === attr ? 'ring-2 ring-opacity-50 ring-current' : ''}`}
                  >
                    <div className="text-xs font-medium">{POTION_CATEGORY_CONFIG[attr].label}</div>
                    <div className="text-lg font-bold">
                      {attr === 'combat'
                        ? previewScores.combatScore
                        : attr === 'utility'
                          ? previewScores.utilityScore
                          : previewScores.whimsyScore}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-foreground/60">
                Categoria vencedora:{' '}
                <span className="font-medium text-foreground">
                  {POTION_CATEGORY_CONFIG[previewScores.winningAttribute].label}
                </span>
              </div>

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
                      Escolhido: {POTION_CATEGORY_CONFIG[chosenAttribute].label}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleBrewPotion}
              disabled={selectedIngredients.length !== 3 || isBrewing}
              className="flex-1"
            >
              {isBrewing ? 'Criando Poção...' : 'Criar Poção'}
            </Button>

            {selectedIngredients.length > 0 && (
              <Button onClick={handleClearSelection} variant="secondary">
                Limpar Seleção
              </Button>
            )}
          </div>
        </div>
      </ContentCard>

      <ContentCard>
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Ingredientes Disponíveis</h3>

          {availableIngredients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Nenhum ingrediente disponível para criação de poções
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableIngredients.map((ingredient, index) => {
                const isSelected = selectedIngredients.some((ing) => ing.id === ingredient.id);
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

      {brewingResult && (
        <Modal
          isOpen={showResultModal}
          onClose={closeResultModal}
          title={brewingResult.success ? 'Poção Criada!' : 'Erro na Criação'}
        >
          <div className="space-y-4">
            {brewingResult.success ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {brewingResult.recipe.resultingPotion.nome_portugues}
                  </div>
                  <div className="text-sm text-foreground/60 mb-4">
                    {brewingResult.recipe.resultingPotion.nome_ingles}
                  </div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      brewingResult.recipe.resultingPotion.raridade === 'Comum'
                        ? 'bg-green-100 text-green-800'
                        : brewingResult.recipe.resultingPotion.raridade === 'Incomum'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {brewingResult.recipe.resultingPotion.raridade}
                  </div>
                </div>

                {brewingResult.cauldronBonus && brewingResult.remainsPotion && (
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-lg mb-2">✨</div>
                      <h4 className="font-bold text-green-800 text-lg mb-2">Poção dos Restos</h4>
                      <p className="text-green-700 text-sm mb-3">Gerada pelo Caldeirão Especial</p>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-green-200/20">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400 mb-1">
                          {brewingResult.remainsPotion.nome_portugues}
                        </div>
                        <div className="text-xs text-foreground/60 mb-2">
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

                {brewingResult.potionBrewerSuccess && brewingResult.secondPotion && (
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-lg mb-2">🧪</div>
                      <h4 className="font-bold text-purple-800 text-lg mb-2">Segunda Poção</h4>
                      <p className="text-purple-700 text-sm mb-3">
                        Gerada pelo Potion Brewer (Rolagem: {brewingResult.percentageRoll}%)
                      </p>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-purple-200/20">
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                          {brewingResult.secondPotion.nome_portugues}
                        </div>
                        <div className="text-xs text-foreground/60 mb-2">
                          {brewingResult.secondPotion.nome_ingles}
                        </div>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                            brewingResult.secondPotion.raridade === 'Comum'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                              : brewingResult.secondPotion.raridade === 'Incomum'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {brewingResult.secondPotion.raridade}
                        </div>
                        <p className="text-xs text-gray-700">
                          {brewingResult.secondPotion.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {brewingResult.potionBrewerSuccess === false && (
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg mb-2">🧪</div>
                      <h4 className="font-bold text-gray-700 text-lg mb-2">Potion Brewer</h4>
                      <p className="text-gray-600 text-sm">
                        Rolagem: {brewingResult.percentageRoll}% - Não foi possível gerar uma
                        segunda poção
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
                    {(['combat', 'utility', 'whimsy'] as const).map((attr) => (
                      <div key={attr} className="text-center">
                        <div
                          className={`font-medium ${POTION_CATEGORY_CONFIG[attr].classes.split(' ')[0]}`}
                        >
                          {POTION_CATEGORY_CONFIG[attr].label}
                        </div>
                        <div className="text-lg font-bold">
                          {attr === 'combat'
                            ? brewingResult.recipe.combatScore
                            : attr === 'utility'
                              ? brewingResult.recipe.utilityScore
                              : brewingResult.recipe.whimsyScore}
                        </div>
                      </div>
                    ))}
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
              <Button onClick={closeResultModal}>Fechar</Button>
            </div>
          </div>
        </Modal>
      )}

      {showScoreChoice && availableScores && (
        <Modal
          isOpen={showScoreChoice}
          onClose={closeScoreChoiceModal}
          title="🧪 Escolher Tipo de Poção"
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                O talento Potion Brewer permite escolher entre o 1º e 2º maior score. Qual tipo de
                poção você deseja criar?
              </p>
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
                        {POTION_CATEGORY_CONFIG[score.attribute].label}
                      </div>
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
              <Button onClick={closeScoreChoiceModal} variant="secondary">
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
