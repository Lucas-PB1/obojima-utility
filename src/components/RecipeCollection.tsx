'use client';

import React, { useState, useEffect } from 'react';
import { PotionRecipe } from '../types/ingredients';
import { firebaseRecipeService } from '../services/firebaseRecipeService';
import ContentCard from './ui/ContentCard';
import Button from './ui/Button';
import Modal from './ui/Modal';
import SimpleIngredientCard from './ui/SimpleIngredientCard';

/**
 * Componente para gerenciar a coleção de receitas de poções
 * 
 * @description
 * Este componente exibe todas as receitas de poções criadas,
 * incluindo filtros, estatísticas e opções de exportação/importação.
 */
export const RecipeCollection: React.FC = () => {
  const [recipes, setRecipes] = useState<PotionRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'combat' | 'utility' | 'whimsy'>('all');

  useEffect(() => {
    const unsubscribe = firebaseRecipeService.subscribeToRecipes((recipes) => {
      setRecipes(recipes);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Carrega todas as receitas do serviço (mantido para compatibilidade)
   */
  const loadRecipes = async () => {
    const allRecipes = await firebaseRecipeService.getAllRecipes();
    setRecipes(allRecipes);
  };


  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'all') return true;
    return recipe.winningAttribute === filter;
  });

  const [stats, setStats] = useState({ total: 0, byCategory: { combat: 0, utility: 0, whimsy: 0 }, recent: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await firebaseRecipeService.getRecipeStats();
      setStats(statsData);
    };
    loadStats();
  }, [recipes]);

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

  const handleRecipeClick = (recipe: PotionRecipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      await firebaseRecipeService.removeRecipe(recipeId);
      loadRecipes();
    }
  };



  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Coleção de Receitas
            </h2>
            <p className="text-gray-600 text-sm">
              Visualize e gerencie suas receitas de poções criadas.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{stats.byCategory.combat}</div>
              <div className="text-xs text-gray-600">Combate</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{stats.byCategory.utility}</div>
              <div className="text-xs text-gray-600">Utilidade</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600">{stats.byCategory.whimsy}</div>
              <div className="text-xs text-gray-600">Caprichoso</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
            >
              Todas ({stats.total})
            </Button>
            <Button
              onClick={() => setFilter('combat')}
              variant={filter === 'combat' ? 'primary' : 'secondary'}
              size="sm"
            >
              Combate ({stats.byCategory.combat})
            </Button>
            <Button
              onClick={() => setFilter('utility')}
              variant={filter === 'utility' ? 'primary' : 'secondary'}
              size="sm"
            >
              Utilidade ({stats.byCategory.utility})
            </Button>
            <Button
              onClick={() => setFilter('whimsy')}
              variant={filter === 'whimsy' ? 'primary' : 'secondary'}
              size="sm"
            >
              Caprichoso ({stats.byCategory.whimsy})
            </Button>
          </div>


        </div>
      </ContentCard>

      {/* Lista de Receitas */}
      <ContentCard>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Receitas ({filteredRecipes.length})
          </h3>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {filter === 'all' 
                ? 'Nenhuma receita criada ainda. Vá para a aba Poções para criar sua primeira receita!'
                : `Nenhuma receita de ${getAttributeLabel(filter)} encontrada.`
              }
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
                    {/* Cabeçalho */}
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {recipe.resultingPotion.nome_portugues}
                      </h4>
                      <p className="text-xs text-gray-600 italic">
                        {recipe.resultingPotion.nome_ingles}
                      </p>
                    </div>

                    {/* Categoria */}
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAttributeColor(recipe.winningAttribute)}`}>
                      {getAttributeLabel(recipe.winningAttribute)}
                    </div>

                    {/* Scores */}
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

                    {/* Data */}
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

      {/* Modal de Detalhes */}
      {selectedRecipe && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Detalhes da Receita"
        >
          <div className="space-y-4">
            {/* Poção Resultante */}
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {selectedRecipe.resultingPotion.nome_portugues}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {selectedRecipe.resultingPotion.nome_ingles}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedRecipe.resultingPotion.raridade === 'Comum' ? 'bg-green-100 text-green-800' :
                selectedRecipe.resultingPotion.raridade === 'Incomum' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedRecipe.resultingPotion.raridade}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
              <p className="text-sm text-gray-700">
                {selectedRecipe.resultingPotion.descricao}
              </p>
            </div>

            {/* Ingredientes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ingredientes Utilizados:</h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedRecipe.ingredients.map((ingredient) => (
                  <SimpleIngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </div>

            {/* Scores */}
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
                Categoria vencedora: <span className="font-medium">{getAttributeLabel(selectedRecipe.winningAttribute)}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
              <Button
                onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                variant="danger"
                size="sm"
              >
                🗑️ Excluir Receita
              </Button>
              <Button onClick={() => setShowModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
