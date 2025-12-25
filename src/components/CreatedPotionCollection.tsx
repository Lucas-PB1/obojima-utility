'use client';
import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { useCreatedPotionCollection } from '@/hooks/useCreatedPotionCollection';
import { POTION_CATEGORY_CONFIG, POTION_FILTER_OPTIONS } from '@/constants/potions';

export const CreatedPotionCollection: React.FC = () => {
  const {
    filteredPotions,
    selectedPotion,
    showModal,
    closeModal,
    filter,
    setFilter,
    stats,
    handlePotionClick,
    handleUsePotion,
    handleDeletePotion
  } = useCreatedPotionCollection();

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Poções Criadas</h2>
            <p className="text-gray-600 text-sm">
              Gerencie suas poções criadas e use-as quando necessário.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{stats.available}</div>
              <div className="text-xs text-gray-600">Disponíveis</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-600">{stats.used}</div>
              <div className="text-xs text-gray-600">Usadas</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{stats.recent}</div>
              <div className="text-xs text-gray-600">Recentes</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {POTION_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                variant={filter === option.value ? 'primary' : 'secondary'}
                size="sm"
              >
                {option.label} (
                {option.value === 'all'
                  ? stats.total
                  : option.value === 'available'
                    ? stats.available
                    : stats.used}
                )
              </Button>
            ))}
          </div>
        </div>
      </ContentCard>

      <ContentCard>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Poções ({filteredPotions.length})
          </h3>

          {filteredPotions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {filter === 'all'
                ? 'Nenhuma poção criada ainda. Vá para a aba Poções para criar sua primeira poção!'
                : filter === 'available'
                  ? 'Nenhuma poção disponível. Crie mais poções na aba Poções!'
                  : 'Nenhuma poção usada ainda.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPotions.map((potion) => (
                <div
                  key={potion.id}
                  className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handlePotionClick(potion)}
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {potion.potion.nome_portugues}
                      </h4>
                      <p className="text-xs text-gray-600 italic">{potion.potion.nome_ingles}</p>
                    </div>

                    <div className="flex gap-2">
                      <div
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].classes}`}
                      >
                        {POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].label}
                      </div>
                      <div
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          potion.potion.raridade === 'Comum'
                            ? 'bg-green-100 text-green-800'
                            : potion.potion.raridade === 'Incomum'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {potion.potion.raridade}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          potion.quantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {potion.quantity > 0 ? `${potion.quantity} disponível(is)` : 'Usada'}
                      </span>

                      {potion.quantity > 0 && (
                        <Button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleUsePotion(potion.id);
                          }}
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          Usar
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Criada em {potion.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>

      {selectedPotion && (
        <Modal isOpen={showModal} onClose={closeModal} title="Detalhes da Poção">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {selectedPotion.potion.nome_portugues}
              </div>
              <div className="text-sm text-gray-600 mb-2">{selectedPotion.potion.nome_ingles}</div>
              <div className="flex justify-center gap-2 mb-2">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPotion.potion.raridade === 'Comum'
                      ? 'bg-green-100 text-green-800'
                      : selectedPotion.potion.raridade === 'Incomum'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {selectedPotion.potion.raridade}
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].classes}`}
                >
                  {POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].label}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
              <p className="text-sm text-gray-700">{selectedPotion.potion.descricao}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Status:</h4>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPotion.quantity > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selectedPotion.quantity > 0
                    ? `${selectedPotion.quantity} disponível(is)`
                    : 'Usada'}
                </span>

                {selectedPotion.quantity > 0 && (
                  <Button
                    onClick={() => {
                      handleUsePotion(selectedPotion.id);
                      closeModal();
                    }}
                    variant="primary"
                    size="sm"
                  >
                    Usar Poção
                  </Button>
                )}
              </div>

              {selectedPotion.used && selectedPotion.usedAt && (
                <div className="mt-2 text-sm text-gray-600">
                  Usada em: {selectedPotion.usedAt.toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Scores da Receita:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-medium text-red-600">Combate</div>
                  <div className="text-lg font-bold">{selectedPotion.recipe.combatScore}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">Utilidade</div>
                  <div className="text-lg font-bold">{selectedPotion.recipe.utilityScore}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">Caprichoso</div>
                  <div className="text-lg font-bold">{selectedPotion.recipe.whimsyScore}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => handleDeletePotion(selectedPotion.id)}
                variant="danger"
                size="sm"
              >
                🗑️ Excluir Poção
              </Button>
              <Button onClick={closeModal}>Fechar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
