'use client';
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ContentCard from '@/components/ui/ContentCard';
import { useCreatedPotionCollection } from '@/hooks/useCreatedPotionCollection';
import { POTION_CATEGORY_CONFIG, POTION_FILTER_OPTIONS } from '@/constants/potions';

import { useTranslation } from '@/hooks/useTranslation';

export const CreatedPotionCollection: React.FC = () => {
  const { t } = useTranslation();
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

  const statsData = [
    {
      value: stats.progress?.total.total > 0
        ? `${stats.progress.total.collected} / ${stats.progress.total.total} (${stats.progress.total.percentage}%)`
        : stats.total,
      label: t('ui.labels.total'),
      color: 'totoro-gray' as const
    },
    { value: stats.available, label: t('ui.labels.available'), color: 'totoro-green' as const },
    { value: stats.used, label: t('ui.labels.used'), color: 'totoro-gray' as const },
    
    ...Object.entries(POTION_CATEGORY_CONFIG).map(([key, config]) => {
      const categoryKey = key as keyof typeof stats.byCategory;
      const categoryProgress = stats.progress?.[categoryKey as 'combat' | 'utility' | 'whimsy'];
      
      return {
        value: categoryProgress?.total > 0
          ? `${categoryProgress.collected} / ${categoryProgress.total}`
          : stats.byCategory[categoryKey],
        label: t(config.label),
        color: (key === 'combat'
          ? 'totoro-orange'
          : key === 'utility'
            ? 'totoro-blue'
            : 'totoro-yellow') as 'totoro-orange' | 'totoro-blue' | 'totoro-yellow'
      };
    })
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('potions.collection.title')}
        subtitle={t('potions.collection.subtitle')}
        icon="🧪"
      />

      <StatsGrid title={`📊 ${t('ui.labels.total')}`} stats={statsData} />

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-totoro-blue rounded-full"></span>
            {t('potions.collection.myPotions', filteredPotions.length)}
          </h3>

          <div className="flex flex-wrap gap-2 p-1 bg-primary/5 rounded-2xl border border-border/40 backdrop-blur-sm">
            {POTION_FILTER_OPTIONS.map((option) => (
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
        {filteredPotions.length === 0 ? (
          <div className="glass-panel text-foreground/50 text-center py-12 rounded-3xl border border-dashed border-border/40">
            <div className="text-4xl mb-3">🧪</div>
            <p className="text-sm font-medium">
              {filter === 'all'
                ? t('potions.collection.empty.all')
                : filter === 'available'
                  ? t('potions.collection.empty.available')
                  : t('potions.collection.empty.used')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPotions.map((potion) => (
              <div
                key={potion.id}
                className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                onClick={() => handlePotionClick(potion)}
              >
                <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
                <div className="relative z-10 space-y-4">
                  <div>
                    <h4 className="font-serif font-bold text-foreground text-lg leading-tight group-hover:text-totoro-blue transition-colors">
                      {potion.potion.nome}
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <div
                      className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].classes}`}
                    >
                      #{potion.potion.id} - {t(POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].label)}
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${
                        potion.potion.raridade === 'Comum'
                          ? 'bg-totoro-green/20 text-totoro-green'
                          : potion.potion.raridade === 'Incomum'
                            ? 'bg-totoro-blue/20 text-totoro-blue'
                            : 'bg-totoro-orange/20 text-totoro-orange'
                      }`}
                    >
                      {potion.potion.raridade}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-totoro-blue/5">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        potion.quantity > 0
                          ? 'bg-totoro-green/10 text-totoro-green border-totoro-green/20'
                          : 'bg-muted text-foreground/40 border-border/40'
                      }`}
                    >
                      {potion.quantity > 0
                        ? t('potions.card.available', potion.quantity)
                        : t('potions.card.used')}
                    </span>

                    {potion.quantity > 0 && (
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleUsePotion(potion.id);
                        }}
                        variant="primary"
                        size="sm"
                        className="!text-[10px] !font-black !rounded-xl"
                      >
                        {t('potions.card.use')}
                      </Button>
                    )}
                  </div>

                  <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                    {t('potions.card.created', potion.createdAt.toLocaleDateString('pt-BR'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {selectedPotion && (
        <Modal isOpen={showModal} onClose={closeModal} title={t('potions.details.title')}>
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
                {selectedPotion.potion.nome}
              </h1>

              <div className="flex justify-center gap-3">
                <div
                  className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${
                    selectedPotion.potion.raridade === 'Comum'
                      ? 'bg-totoro-green/20 text-totoro-green'
                      : selectedPotion.potion.raridade === 'Incomum'
                        ? 'bg-totoro-blue/20 text-totoro-blue'
                        : 'bg-totoro-orange/20 text-totoro-orange'
                  }`}
                >
                  {selectedPotion.potion.raridade}
                </div>
                <div
                  className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/40 shadow-sm ${POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].classes}`}
                >
                  {t(POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].label)}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-border/40 relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-3 relative z-10">
                {t('potions.details.desc.arcane')}
              </h4>
              <p className="text-sm text-foreground leading-relaxed italic relative z-10">
                &quot;{selectedPotion.potion.descricao}&quot;
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1">
                    {t('potions.details.status')}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      selectedPotion.quantity > 0
                        ? 'bg-totoro-green/10 text-totoro-green'
                        : 'bg-totoro-gray/10 text-totoro-gray'
                    }`}
                  >
                    {selectedPotion.quantity > 0
                      ? t('potions.card.available', selectedPotion.quantity)
                      : t('potions.card.exhausted')}
                  </span>
                </div>

                {selectedPotion.quantity > 0 && (
                  <Button
                    onClick={() => {
                      handleUsePotion(selectedPotion.id);
                      closeModal();
                    }}
                    variant="primary"
                    size="md"
                    className="!rounded-2xl !font-bold"
                  >
                    {t('potions.card.useNow')}
                  </Button>
                )}
              </div>

              {selectedPotion.used && selectedPotion.usedAt && (
                <div className="mt-4 pt-4 border-t border-totoro-blue/5 text-[10px] text-totoro-gray/50 font-bold uppercase tracking-widest relative z-10 text-center">
                  {t('potions.details.lastUse', selectedPotion.usedAt.toLocaleDateString('pt-BR'))}
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-totoro-blue/60 uppercase tracking-[0.2em] mb-4 relative z-10 text-center">
                {t('potions.result.scores')}
              </h4>
              <div className="grid grid-cols-3 gap-6 relative z-10">
                {/* Combat Score */}
                <div
                  className={`text-center transition-all duration-300 ${
                    selectedPotion.recipe.winningAttribute === 'combat'
                      ? 'scale-110 opacity-100'
                      : 'scale-90 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                      selectedPotion.recipe.winningAttribute === 'combat'
                        ? 'text-totoro-orange'
                        : 'text-totoro-orange/60'
                    }`}
                  >
                    Cbt
                  </div>
                  <div
                    className={`text-3xl font-black font-mono relative inline-block ${
                      selectedPotion.recipe.winningAttribute === 'combat'
                        ? 'text-totoro-orange drop-shadow-lg'
                        : 'text-totoro-orange/60'
                    }`}
                  >
                    {selectedPotion.recipe.combatScore}
                    {selectedPotion.recipe.winningAttribute === 'combat' && (
                      <div className="absolute -top-3 -right-3 text-xs">👑</div>
                    )}
                  </div>
                  {selectedPotion.recipe.winningAttribute === 'combat' && (
                    <div className="mt-1 h-1 w-full bg-totoro-orange rounded-full opacity-50"></div>
                  )}
                </div>

                {/* Utility Score */}
                <div
                  className={`text-center transition-all duration-300 ${
                    selectedPotion.recipe.winningAttribute === 'utility'
                      ? 'scale-110 opacity-100'
                      : 'scale-90 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                      selectedPotion.recipe.winningAttribute === 'utility'
                        ? 'text-totoro-blue'
                        : 'text-totoro-blue/60'
                    }`}
                  >
                    Utl
                  </div>
                  <div
                    className={`text-3xl font-black font-mono relative inline-block ${
                      selectedPotion.recipe.winningAttribute === 'utility'
                        ? 'text-totoro-blue drop-shadow-lg'
                        : 'text-totoro-blue/60'
                    }`}
                  >
                    {selectedPotion.recipe.utilityScore}
                    {selectedPotion.recipe.winningAttribute === 'utility' && (
                      <div className="absolute -top-3 -right-3 text-xs">👑</div>
                    )}
                  </div>
                  {selectedPotion.recipe.winningAttribute === 'utility' && (
                    <div className="mt-1 h-1 w-full bg-totoro-blue rounded-full opacity-50"></div>
                  )}
                </div>

                {/* Whimsy Score */}
                <div
                  className={`text-center transition-all duration-300 ${
                    selectedPotion.recipe.winningAttribute === 'whimsy'
                      ? 'scale-110 opacity-100'
                      : 'scale-90 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                      selectedPotion.recipe.winningAttribute === 'whimsy'
                        ? 'text-totoro-yellow'
                        : 'text-totoro-yellow/60'
                    }`}
                  >
                    Why
                  </div>
                  <div
                    className={`text-3xl font-black font-mono relative inline-block ${
                      selectedPotion.recipe.winningAttribute === 'whimsy'
                        ? 'text-totoro-yellow drop-shadow-lg'
                        : 'text-totoro-yellow/60'
                    }`}
                  >
                    {selectedPotion.recipe.whimsyScore}
                    {selectedPotion.recipe.winningAttribute === 'whimsy' && (
                      <div className="absolute -top-3 -right-3 text-xs">👑</div>
                    )}
                  </div>
                  {selectedPotion.recipe.winningAttribute === 'whimsy' && (
                    <div className="mt-1 h-1 w-full bg-totoro-yellow rounded-full opacity-50"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => handleDeletePotion(selectedPotion.id)}
                variant="ghost"
                className="flex-1 !text-totoro-orange hover:!bg-totoro-orange/10 !rounded-2xl !font-bold"
              >
                {t('ui.actions.delete')}
              </Button>
              <Button
                onClick={closeModal}
                variant="secondary"
                className="flex-1 !rounded-2xl !font-bold"
              >
                {t('ui.actions.close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
