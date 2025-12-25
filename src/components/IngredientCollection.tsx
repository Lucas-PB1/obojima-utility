'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import StatsGrid from '@/components/ui/StatsGrid';
import PageHeader from '@/components/ui/PageHeader';
import { CollectedIngredient } from '@/types/ingredients';
import IngredientModal from '@/components/IngredientModal';
import DataTable, { Column } from '@/components/ui/DataTable';
import { INGREDIENT_COLLECTION_FILTERS } from '@/constants/ingredients';
import { useIngredientCollection } from '@/hooks/useIngredientCollection';

export default function IngredientCollection() {
  const {
    displayIngredients,
    selectedIngredient,
    isModalOpen,
    statsData,
    handleMarkAsUsed,
    handleIngredientClick,
    handleCloseModal
  } = useIngredientCollection();

  const columns: Column<CollectedIngredient>[] = [
    {
      key: 'ingredient' as keyof CollectedIngredient,
      label: 'Ingrediente',
      sortable: true,
      width: '30%',
      render: (_, item) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-totoro-blue/5 p-2 rounded-lg transition-colors"
          onClick={() => handleIngredientClick(item.ingredient)}
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-totoro-green/20 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-totoro-gray hover:text-totoro-blue transition-colors">
              {item.ingredient.nome_portugues}
            </div>
            <div className="text-sm text-totoro-gray/60">{item.ingredient.nome_ingles}</div>
            <div className="text-xs text-totoro-blue mt-1">Clique para ver detalhes</div>
          </div>
        </div>
      )
    },
    {
      key: 'quantity' as keyof CollectedIngredient,
      label: 'Quantidade',
      sortable: true,
      width: '15%',
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <span className="bg-totoro-green/20 text-totoro-green px-2 py-1 rounded-full text-sm font-medium">
            {String(value)}
          </span>
        </div>
      )
    },
    {
      key: 'collectedAt' as keyof CollectedIngredient,
      label: 'Estatísticas',
      sortable: false,
      width: '25%',
      render: (_, item) => (
        <div className="flex space-x-2">
          <span className="bg-totoro-orange/20 text-totoro-orange px-2 py-1 rounded text-xs">
            ⚔️ {item.ingredient.combat}
          </span>
          <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs">
            🛠️ {item.ingredient.utility}
          </span>
          <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs">
            ✨ {item.ingredient.whimsy}
          </span>
        </div>
      )
    },
    {
      key: 'used' as keyof CollectedIngredient,
      label: 'Coletado em',
      sortable: true,
      width: '15%',
      render: (_, item) => (
        <div className="text-sm text-totoro-gray">
          {new Date(item.collectedAt).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'forageAttemptId' as keyof CollectedIngredient,
      label: 'Ações',
      sortable: true,
      width: '20%',
      render: (_, item) => (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.used
                ? 'bg-totoro-gray/20 text-totoro-gray' 
                : 'bg-totoro-green/20 text-totoro-green'
            }`}>
              {item.used ? 'Usado' : `${item.quantity} disponível(is)`}
            </span>
          </div>
          {!item.used && (
            <Button
              onClick={() => handleMarkAsUsed(item.id)}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              Usar 1
            </Button>
          )}
          {item.used && (
            <span className="text-xs text-totoro-gray/60">
              Usado em: {item.usedAt ? new Date(item.usedAt).toLocaleDateString('pt-BR') : 'N/A'}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleção de Ingredientes"
        subtitle="Gerencie seus ingredientes coletados em Obojima"
        icon="🎒"
      />

      <StatsGrid title="📊 Estatísticas" stats={statsData} className="mb-8" />

      <DataTable<CollectedIngredient>
        data={displayIngredients}
        columns={columns}
        filters={INGREDIENT_COLLECTION_FILTERS}
        searchKey="ingredient.nome_portugues"
        searchPlaceholder="Buscar ingrediente..."
        itemsPerPage={15}
        className="mb-8"
      />

      <IngredientModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
