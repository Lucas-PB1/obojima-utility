import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { useRecipeCollection } from '@/hooks/useRecipeCollection';
import SimpleIngredientCard from '@/components/ui/SimpleIngredientCard';
import { POTION_CATEGORY_CONFIG, RECIPE_FILTER_OPTIONS } from '@/constants/potions';

import { useTranslation } from '@/hooks/useTranslation';

export const RecipeCollection: React.FC = () => {
  const { t } = useTranslation();
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

  const statsData = [
    { value: stats.total, label: t('recipes.stats.total'), color: 'totoro-gray' as const },
    ...Object.entries(POTION_CATEGORY_CONFIG).map(([key, config]) => ({
      value: stats.byCategory[key as keyof typeof stats.byCategory],
      label: t(config.label),
      color: (key === 'combat'
        ? 'totoro-orange'
        : key === 'utility'
          ? 'totoro-blue'
          : 'totoro-yellow') as 'totoro-orange' | 'totoro-blue' | 'totoro-yellow'
    }))
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('recipes.collection.title')}
        subtitle={t('recipes.collection.subtitle')}
        icon="📜"
      />

      <StatsGrid title={`📊 ${t('ingredients.stats.title')}`} stats={statsData} />

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-totoro-blue rounded-full"></span>
            {t('recipes.myRecipes', filteredRecipes.length)}
          </h3>

          <div className="flex flex-wrap gap-2 p-1 bg-primary/5 rounded-2xl border border-border/40 backdrop-blur-sm">
            {RECIPE_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === option.value
                    ? 'bg-totoro-blue text-white shadow-lg shadow-totoro-blue/20'
                    : 'text-foreground/50 hover:text-totoro-blue hover:bg-muted'
                }`}
              >
                {t(option.label)}
              </button>
            ))}
          </div>
        </div>
        {filteredRecipes.length === 0 ? (
          <div className="glass-panel text-foreground/50 text-center py-12 rounded-3xl border border-dashed border-border/40">
            <div className="text-4xl mb-3">📜</div>
            <p className="text-sm font-medium">
              {filter === 'all'
                ? t('recipes.empty.all')
                : t('recipes.empty.filtered', POTION_CATEGORY_CONFIG[filter as keyof typeof POTION_CATEGORY_CONFIG]?.label ? t(POTION_CATEGORY_CONFIG[filter as keyof typeof POTION_CATEGORY_CONFIG].label) : '')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
                <div className="relative z-10 space-y-4">
                  <div>
                    <h4 className="font-serif font-bold text-foreground text-lg leading-tight group-hover:text-totoro-blue transition-colors">
                      {recipe.resultingPotion.nome}
                    </h4>

                  </div>

                  <div
                    className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${POTION_CATEGORY_CONFIG[recipe.winningAttribute].classes}`}
                  >
                    {t(POTION_CATEGORY_CONFIG[recipe.winningAttribute].label)}
                  </div>

                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-totoro-blue/5">
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-totoro-orange/60 uppercase">Cbt</div>
                      <div className="text-lg font-black text-totoro-orange font-mono">
                        {recipe.combatScore}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-totoro-blue/60 uppercase">Utl</div>
                      <div className="text-lg font-black text-totoro-blue font-mono">
                        {recipe.utilityScore}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-totoro-yellow/60 uppercase">Why</div>
                      <div className="text-lg font-black text-totoro-yellow font-mono">
                        {recipe.whimsyScore}
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] font-bold text-totoro-gray/30 uppercase tracking-[0.2em]">
                    {t('recipes.card.created', recipe.createdAt.toLocaleDateString('pt-BR'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {selectedRecipe && (
        <Modal isOpen={showModal} onClose={closeModal} title={t('recipes.details.title')}>
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
                {selectedRecipe.resultingPotion.nome}
              </h1>

              <div
                className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${
                  selectedRecipe.resultingPotion.raridade === 'Comum'
                    ? 'bg-totoro-green/20 text-totoro-green'
                    : selectedRecipe.resultingPotion.raridade === 'Incomum'
                      ? 'bg-totoro-blue/20 text-totoro-blue'
                      : 'bg-totoro-orange/20 text-totoro-orange'
                }`}
              >
                {selectedRecipe.resultingPotion.raridade}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-border/40 relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-3 relative z-10">
                {t('recipes.details.effect')}
              </h4>
              <p className="text-sm text-foreground leading-relaxed italic relative z-10">
                &quot;{selectedRecipe.resultingPotion.descricao}&quot;
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] pl-1">
                {t('recipes.details.ingredients')}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedRecipe.ingredients.map((ingredient) => (
                  <SimpleIngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-4 relative z-10 text-center">
                {t('recipes.details.potential')}
              </h4>
              <div className="grid grid-cols-3 gap-6 relative z-10">
                <div className="text-center group">
                  <div className="text-[9px] font-bold text-totoro-orange/60 uppercase tracking-widest mb-1">
                    Cbt
                  </div>
                  <div className="text-3xl font-black text-totoro-orange font-mono">
                    {selectedRecipe.combatScore}
                  </div>
                </div>
                <div className="text-center group">
                  <h4 className="text-[9px] font-bold text-totoro-blue/60 uppercase tracking-widest mb-1">
                    Utl
                  </h4>
                  <div className="text-3xl font-black text-totoro-blue font-mono">
                    {selectedRecipe.utilityScore}
                  </div>
                </div>
                <div className="text-center group">
                  <h4 className="text-[9px] font-bold text-totoro-yellow/60 uppercase tracking-widest mb-1">
                    Why
                  </h4>
                  <div className="text-3xl font-black text-totoro-yellow font-mono">
                    {selectedRecipe.whimsyScore}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-totoro-blue/5 text-[10px] text-totoro-gray/50 font-bold uppercase tracking-widest relative z-10 text-center">
                {t('recipes.details.predictedDomain')}{' '}
                <span className="text-totoro-blue">
                  {t(POTION_CATEGORY_CONFIG[selectedRecipe.winningAttribute].label)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                variant="ghost"
                className="flex-1 !text-totoro-orange hover:!bg-totoro-orange/10 !rounded-2xl !font-bold"
              >
                {t('recipes.details.delete')}
              </Button>
              <Button onClick={closeModal} variant="secondary" className="flex-1 !rounded-2xl !font-bold">
                {t('recipes.details.close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
