import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { useRecipeCollection } from '@/hooks/useRecipeCollection';
import SimpleIngredientCard from '@/components/ui/SimpleIngredientCard';
import { POTION_CATEGORY_CONFIG, RECIPE_FILTER_OPTIONS } from '@/constants/potions';

export const RecipeCollection: React.FC = () => {
  const {
    filteredRecipes,
    selectedRecipe,
    showModal,
    closeModal,
    filter,
    setFilter,
    stats,
    handleRecipeClick,
    handleDeleteRecipe
  } = useRecipeCollection();

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Coleção de Receitas</h2>
            <p className="text-gray-600 text-sm">
              Visualize e gerencie suas receitas de poções criadas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            {Object.entries(POTION_CATEGORY_CONFIG).map(([key, config]) => (
              <div
                key={key}
                className={`${config.classes.split(' ').slice(1).join(' ')} p-3 rounded-lg text-center`}
              >
                <div className={`text-lg font-bold ${config.classes.split(' ')[0]}`}>
                  {stats.byCategory[key as keyof typeof stats.byCategory]}
                </div>
                <div className="text-xs text-gray-600">{config.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {RECIPE_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                variant={filter === option.value ? 'primary' : 'secondary'}
                size="sm"
              >
                {option.label} (
                {option.value === 'all'
                  ? stats.total
                  : stats.byCategory[option.value as keyof typeof stats.byCategory]}
                )
              </Button>
            ))}
          </div>
        </div>
      </ContentCard>

      <ContentCard>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Receitas ({filteredRecipes.length})
          </h3>

          {filteredRecipes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {filter === 'all'
                ? 'Nenhuma receita criada ainda. Vá para a aba Poções para criar sua primeira receita!'
                : `Nenhuma receita de ${POTION_CATEGORY_CONFIG[filter as keyof typeof POTION_CATEGORY_CONFIG].label} encontrada.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {recipe.resultingPotion.nome_portugues}
                      </h4>
                      <p className="text-xs text-gray-600 italic">
                        {recipe.resultingPotion.nome_ingles}
                      </p>
                    </div>

                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${POTION_CATEGORY_CONFIG[recipe.winningAttribute].classes}`}
                    >
                      {POTION_CATEGORY_CONFIG[recipe.winningAttribute].label}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-red-600">Combate</div>
                        <div className="font-bold">{recipe.combatScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">Utilidade</div>
                        <div className="font-bold">{recipe.utilityScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">Caprichoso</div>
                        <div className="font-bold">{recipe.whimsyScore}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Criada em {recipe.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>

      {selectedRecipe && (
        <Modal isOpen={showModal} onClose={closeModal} title="Detalhes da Receita">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {selectedRecipe.resultingPotion.nome_portugues}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {selectedRecipe.resultingPotion.nome_ingles}
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  selectedRecipe.resultingPotion.raridade === 'Comum'
                    ? 'bg-green-100 text-green-800'
                    : selectedRecipe.resultingPotion.raridade === 'Incomum'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                }`}
              >
                {selectedRecipe.resultingPotion.raridade}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
              <p className="text-sm text-gray-700">{selectedRecipe.resultingPotion.descricao}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ingredientes Utilizados:</h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedRecipe.ingredients.map((ingredient) => (
                  <SimpleIngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Scores da Receita:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-medium text-red-600">Combate</div>
                  <div className="text-2xl font-bold">{selectedRecipe.combatScore}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">Utilidade</div>
                  <div className="text-2xl font-bold">{selectedRecipe.utilityScore}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">Caprichoso</div>
                  <div className="text-2xl font-bold">{selectedRecipe.whimsyScore}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 text-center">
                Categoria vencedora:{' '}
                <span className="font-medium">
                  {POTION_CATEGORY_CONFIG[selectedRecipe.winningAttribute].label}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                variant="danger"
                size="sm"
              >
                🗑️ Excluir Receita
              </Button>
              <Button onClick={closeModal}>Fechar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
