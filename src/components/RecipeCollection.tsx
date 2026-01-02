import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
import ContentCard from '@/components/ui/ContentCard';
import { useRecipeCollection } from '@/hooks/useRecipeCollection';
import { useTranslation } from '@/hooks/useTranslation';
import { RecipeFilter } from './Potions/Recipes/RecipeFilter';
import { RecipeList } from './Potions/Recipes/RecipeList';
import { RecipeDetailsModal } from './Potions/Recipes/RecipeDetailsModal';

export const RecipeCollection: React.FC = () => {
  const { t } = useTranslation();
  const {
    filteredRecipes,
    selectedRecipe,
    showModal,
    closeModal,
    filter,
    setFilter,
    statsData,
    handleRecipeClick,
    handleDeleteRecipe
  } = useRecipeCollection();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('recipes.collection.title')}
        subtitle={t('recipes.collection.subtitle')}
        icon="📜"
      />

      <StatsGrid title={`📊 ${t('ingredients.stats.title')}`} stats={statsData} />

      <ContentCard>
        <RecipeFilter
          filter={filter}
          setFilter={setFilter}
          filteredCount={filteredRecipes.length}
        />
        
        <RecipeList
          recipes={filteredRecipes}
          filter={filter}
          onRecipeClick={handleRecipeClick}
        />
      </ContentCard>

      <RecipeDetailsModal
        isOpen={showModal}
        onClose={closeModal}
        recipe={selectedRecipe}
        onDelete={handleDeleteRecipe}
      />
    </div>
  );
};
