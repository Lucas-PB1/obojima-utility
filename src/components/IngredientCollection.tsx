'use client';

import React, { useState } from 'react';
import { CollectedIngredient } from '@/types/ingredients';
import { useIngredients } from '@/hooks/useIngredients';
import { StatsService } from '@/services/statsService';
import { BackupService } from '@/services/backupService';
import PageLayout from './ui/PageLayout';
import PageHeader from './ui/PageHeader';
import StatsGrid from './ui/StatsGrid';
import DataTable, { Column, Filter } from './ui/DataTable';
import Button from './ui/Button';
import IngredientModal from './IngredientModal';

export default function IngredientCollection() {
  const { ingredients, attempts, markAsUsed, getStats } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<CollectedIngredient['ingredient'] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkAsUsed = (id: string) => {
    markAsUsed(id);
  };

  const handleIngredientClick = (ingredient: CollectedIngredient['ingredient']) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIngredient(null);
  };

  const handleExportData = () => {
    const stats = getStats();
    BackupService.exportData(ingredients, attempts, stats);
  };

  const handleClearAllData = () => {
    if (confirm('Isso irá limpar todos os dados atuais. Tem certeza?')) {
      BackupService.clearAllData();
      window.location.reload();
    }
  };

  const collectionStats = StatsService.calculateCollectionStats(ingredients, attempts);
  const statsData = [
    { value: collectionStats.totalCollected, label: 'Total Coletados', color: 'emerald' as const },
    { value: collectionStats.totalUsed, label: 'Usados', color: 'teal' as const },
    { value: collectionStats.totalAttempts, label: 'Tentativas', color: 'cyan' as const },
    { value: `${collectionStats.successRate.toFixed(1)}%`, label: 'Taxa de Sucesso', color: 'slate' as const }
  ];

  const columns: Column<CollectedIngredient>[] = [
    {
      key: 'ingredient' as keyof CollectedIngredient,
      label: 'Ingrediente',
      sortable: true,
      width: '30%',
      render: (_, item) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-rose-50 p-2 rounded-lg transition-colors"
          onClick={() => handleIngredientClick(item.ingredient)}
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 hover:text-rose-400 transition-colors">
              {item.ingredient.nome_portugues}
            </div>
            <div className="text-sm text-gray-500">{item.ingredient.nome_ingles}</div>
            <div className="text-xs text-rose-300 mt-1">Clique para ver detalhes</div>
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
          <span className="bg-rose-100 text-rose-400 px-2 py-1 rounded-full text-sm font-medium">
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
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
            ⚔️ {item.ingredient.combat}
          </span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            🛠️ {item.ingredient.utility}
          </span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
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
        <div className="text-sm text-gray-600">
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
              item.used || item.quantity === 0
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-rose-100 text-rose-400'
            }`}>
              {item.used || item.quantity === 0 ? 'Usado (0)' : `${item.quantity} disponível(is)`}
            </span>
          </div>
          {!item.used && item.quantity > 0 && (
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
            <span className="text-xs text-gray-500">
              Usado em: {item.usedAt ? new Date(item.usedAt).toLocaleDateString('pt-BR') : 'N/A'}
            </span>
          )}
        </div>
      )
    }
  ];

  const filters: Filter[] = [
    {
      key: 'used',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'false', label: 'Disponível' },
        { value: 'true', label: 'Usado' }
      ],
      placeholder: 'Todos os status'
    },
    {
      key: 'ingredient.combat',
      label: 'Combat',
      type: 'select',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' }
      ],
      placeholder: 'Todos os valores'
    },
    {
      key: 'ingredient.utility',
      label: 'Utility',
      type: 'select',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' }
      ],
      placeholder: 'Todos os valores'
    },
    {
      key: 'ingredient.whimsy',
      label: 'Whimsy',
      type: 'select',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' }
      ],
      placeholder: 'Todos os valores'
    }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Coleção de Ingredientes"
        subtitle="Gerencie seus ingredientes coletados em Obojima"
        icon="🎒"
      />

      <StatsGrid title="📊 Estatísticas" stats={statsData} className="mb-8" />

      <DataTable<CollectedIngredient>
        data={ingredients}
        columns={columns}
        filters={filters}
        searchKey="ingredient.nome_portugues"
        searchPlaceholder="Buscar ingrediente..."
        itemsPerPage={15}
        className="mb-8"
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 Backup</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={handleExportData}
            variant="primary"
          >
            📤 Exportar Dados
          </Button>
          <Button
            onClick={handleClearAllData}
            variant="danger"
          >
            🗑️ Limpar Todos os Dados
          </Button>
        </div>
      </div>

      <IngredientModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </PageLayout>
  );
}