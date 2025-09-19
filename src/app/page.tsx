'use client';

import React from 'react';
import ForageSystem from '@/components/ForageSystem';
import IngredientCollection from '@/components/IngredientCollection';
import { PotionBrewing } from '@/components/PotionBrewing';
import { CreatedPotionCollection } from '@/components/CreatedPotionCollection';
import { RecipeCollection } from '@/components/RecipeCollection';
import ActivityLog from '@/components/ActivityLog';
import { BackupSection } from '@/components/BackupSection';
import TabNavigation from '@/components/ui/TabNavigation';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useApp } from '@/hooks/useApp';
import { useIngredients } from '@/hooks/useIngredients';

export default function Home() {
  const {
    activeTab,
    recentlyCollected,
    isClient,
    tabs,
    handleIngredientCollected,
    handleTabChange,
    handleViewCollection,
  } = useApp();

  const { ingredients, markAsUsed } = useIngredients();

  // Converter ingredientes coletados para o formato esperado pelo sistema de poções
  // Filtrar ingredientes não usados e com quantidade > 0
  const availableIngredients = ingredients
    .filter(ing => !ing.used && ing.quantity > 0)
    .map(ing => ing.ingredient);

  // Função para marcar ingredientes como usados
  const handleIngredientsUsed = (ingredientIds: number[]) => {
    // Encontrar os ingredientes coletados correspondentes e marcá-los como usados
    ingredients
      .filter(ing => ingredientIds.includes(ing.ingredient.id) && !ing.used)
      .forEach(ing => markAsUsed(ing.id));
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 flex items-center justify-center">
        <EmptyState
          icon="🌿"
          title="Carregando Obojima..."
          description="Preparando o sistema de forrageamento"
        />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 transition-colors duration-300">
        <div className="border-b border-totoro-blue/20 sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-totoro-gray transition-colors duration-300">
                  🌿 Obojima Utilities
                </h1>
                <p className="text-sm text-totoro-blue transition-colors duration-300">
                  Sistema de Forrageamento e Alquimia
                </p>
              </div>
              
              {recentlyCollected.length > 0 && (
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-totoro-yellow/20 transition-colors duration-300">
                  <span className="text-sm font-medium text-totoro-orange">
                    🎁 {recentlyCollected.length} novo(s) ingrediente(s)!
                  </span>
                  <Button
                    onClick={handleViewCollection}
                    variant="secondary"
                    size="sm"
                    effect="float"
                    className="text-sm"
                  >
                    Ver coleção
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="max-w-6xl mx-auto">
          {activeTab === 'forage' && (
            <ForageSystem 
              onIngredientCollected={handleIngredientCollected}
            />
          )}
          {activeTab === 'collection' && <IngredientCollection />}
          {activeTab === 'potions' && (
            <PotionBrewing 
              availableIngredients={availableIngredients}
              onPotionCreated={(recipe) => {
                console.log('Poção criada:', recipe);
                // A receita já é salva automaticamente pelo componente PotionBrewing
              }}
              onIngredientsUsed={handleIngredientsUsed}
            />
          )}
          {activeTab === 'created-potions' && <CreatedPotionCollection />}
          {activeTab === 'recipes' && <RecipeCollection />}
          {activeTab === 'log' && <ActivityLog />}
          {activeTab === 'backup' && <BackupSection />}
        </div>

        <footer className="border-t border-totoro-blue/20 bg-white/90 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center text-totoro-gray transition-colors duration-300">
              <p className="mb-2">
                🌿 Sistema de Forrageamento de Obojima
              </p>
              <p className="text-sm opacity-80">
                Explore as terras mágicas e colete ingredientes únicos para suas poções
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}
