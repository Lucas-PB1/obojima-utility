'use client';

import React, { useState } from 'react';
import { CollectedIngredient } from '@/types/ingredients';
import { useIngredients } from '@/hooks/useIngredients';
import PageLayout from './ui/PageLayout';
import PageHeader from './ui/PageHeader';
import StatsGrid from './ui/StatsGrid';
import IngredientFilters from './filters/IngredientFilters';
import IngredientCard from './ui/IngredientCard';
import EmptyState from './ui/EmptyState';
import ContentCard from './ui/ContentCard';
import Button from './ui/Button';

export default function IngredientCollection() {
  const { ingredients, markAsUsed, removeIngredient, getStats } = useIngredients();
  const [filteredIngredients, setFilteredIngredients] = useState<CollectedIngredient[]>([]);

  const handleMarkAsUsed = (id: string) => {
    markAsUsed(id);
  };

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza que deseja remover este ingrediente da sua coleção?')) {
      removeIngredient(id);
    }
  };

  const stats = getStats();

  const statsData = [
    { value: stats.totalCollected, label: 'Total Coletados', color: 'emerald' as const },
    { value: stats.totalUsed, label: 'Usados', color: 'teal' as const },
    { value: stats.totalAttempts, label: 'Tentativas', color: 'cyan' as const },
    { value: `${stats.successRate.toFixed(1)}%`, label: 'Taxa de Sucesso', color: 'slate' as const }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Coleção de Ingredientes"
        subtitle="Gerencie seus ingredientes coletados em Obojima"
        icon="🎒"
      />

      {/* Stats */}
      <StatsGrid title="📊 Estatísticas" stats={statsData} className="mb-8" />

      {/* Filters */}
      <IngredientFilters 
        ingredients={ingredients} 
        onFilteredIngredients={setFilteredIngredients}
      />

      {/* Ingredients Grid */}
      <ContentCard title={`Ingredientes (${filteredIngredients.length})`}>
        {filteredIngredients.length === 0 ? (
          <EmptyState
            icon="🌿"
            title="Nenhum ingrediente encontrado"
            description="Comece a forragear para coletar ingredientes!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIngredients.map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onMarkAsUsed={handleMarkAsUsed}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </ContentCard>

      {/* Export/Import */}
      <ContentCard title="💾 Backup" className="mt-8">
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={() => {
              const data = JSON.stringify({
                collectedIngredients: ingredients,
                stats,
                exportedAt: new Date().toISOString()
              }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `obojima-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            variant="primary"
          >
            📤 Exportar Dados
          </Button>
          <Button
            onClick={() => {
              if (confirm('Isso irá limpar todos os dados atuais. Tem certeza?')) {
                localStorage.removeItem('obojima_collected_ingredients');
                localStorage.removeItem('obojima_forage_attempts');
                window.location.reload();
              }
            }}
            variant="danger"
          >
            🗑️ Limpar Todos os Dados
          </Button>
        </div>
      </ContentCard>
    </PageLayout>
  );
}