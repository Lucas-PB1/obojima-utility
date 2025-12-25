'use client';
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
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

  const statsData = [
    { value: stats.total, label: 'Total', color: 'totoro-gray' as const },
    { value: stats.available, label: 'Disponíveis', color: 'totoro-green' as const },
    { value: stats.used, label: 'Usadas', color: 'totoro-gray' as const },
    { value: stats.recent, label: 'Recentes', color: 'totoro-blue' as const }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Poções Criadas"
        subtitle="Gerencie suas poções criadas e use-as quando necessário"
        icon="🧪"
      />

      <StatsGrid title="📊 Visão Geral" stats={statsData} />

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-black text-totoro-gray tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-totoro-blue rounded-full"></span>
            Minhas Poções ({filteredPotions.length})
          </h3>

          <div className="flex flex-wrap gap-2 p-1 bg-totoro-blue/5 rounded-2xl border border-white/40 backdrop-blur-sm">
            {POTION_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === option.value
                    ? 'bg-totoro-blue text-white shadow-lg shadow-totoro-blue/20'
                    : 'text-totoro-gray/50 hover:text-totoro-blue hover:bg-white/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {filteredPotions.length === 0 ? (
          <div className="glass-panel text-totoro-gray/50 text-center py-12 rounded-3xl border border-dashed border-totoro-blue/20">
            <div className="text-4xl mb-3">🧪</div>
            <p className="text-sm font-medium">
              {filter === 'all'
                ? 'Nenhuma poção criada ainda. Vá para a aba Poções para criar sua primeira poção!'
                : filter === 'available'
                  ? 'Nenhuma poção disponível. Crie mais poções na aba Poções!'
                  : 'Nenhuma poção usada ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPotions.map((potion) => (
              <div
                key={potion.id}
                className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                onClick={() => handlePotionClick(potion)}
              >
                <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
                <div className="relative z-10 space-y-4">
                  <div>
                    <h4 className="font-serif font-bold text-totoro-gray text-lg leading-tight group-hover:text-totoro-blue transition-colors">
                      {potion.potion.nome_portugues}
                    </h4>
                    <p className="text-[10px] text-totoro-blue/60 font-semibold uppercase tracking-widest font-sans">
                      {potion.potion.nome_ingles}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div
                      className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].classes}`}
                    >
                      {POTION_CATEGORY_CONFIG[potion.recipe.winningAttribute].label}
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
                          : 'bg-totoro-gray/10 text-totoro-gray border-totoro-gray/20'
                      }`}
                    >
                      {potion.quantity > 0 ? `${potion.quantity} disponível(is)` : 'Usada'}
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
                        USAR
                      </Button>
                    )}
                  </div>

                  <div className="text-[9px] font-bold text-totoro-gray/30 uppercase tracking-[0.2em]">
                    Criada em {potion.createdAt.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {selectedPotion && (
        <Modal isOpen={showModal} onClose={closeModal} title="Detalhes da Poção">
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <h1 className="text-3xl font-serif font-bold text-totoro-gray mb-1">
                {selectedPotion.potion.nome_portugues}
              </h1>
              <p className="text-xs text-totoro-blue/60 font-semibold uppercase tracking-[0.2em] mb-4">
                {selectedPotion.potion.nome_ingles}
              </p>
              <div className="flex justify-center gap-3">
                <div
                  className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/40 shadow-sm ${
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
                  className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/40 shadow-sm ${POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].classes}`}
                >
                  {POTION_CATEGORY_CONFIG[selectedPotion.recipe.winningAttribute].label}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/40 relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-totoro-blue/60 uppercase tracking-[0.2em] mb-3 relative z-10">
                Descrição Arcana
              </h4>
              <p className="text-sm text-totoro-gray leading-relaxed italic relative z-10">
                &quot;{selectedPotion.potion.descricao}&quot;
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-[10px] font-black text-totoro-blue/60 uppercase tracking-[0.2em] mb-1">
                    Status da Unidade
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      selectedPotion.quantity > 0
                        ? 'bg-totoro-green/10 text-totoro-green'
                        : 'bg-totoro-gray/10 text-totoro-gray'
                    }`}
                  >
                    {selectedPotion.quantity > 0
                      ? `${selectedPotion.quantity} disponível(is)`
                      : 'Esgotada'}
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
                    Usar Agora
                  </Button>
                )}
              </div>

              {selectedPotion.used && selectedPotion.usedAt && (
                <div className="mt-4 pt-4 border-t border-totoro-blue/5 text-[10px] text-totoro-gray/50 font-bold uppercase tracking-widest relative z-10 text-center">
                  Último uso: {selectedPotion.usedAt.toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
              <h4 className="text-[10px] font-black text-totoro-blue/60 uppercase tracking-[0.2em] mb-4 relative z-10 text-center">
                Scores da Receita
              </h4>
              <div className="grid grid-cols-3 gap-6 relative z-10">
                <div className="text-center group">
                  <div className="text-[9px] font-bold text-totoro-orange/60 uppercase tracking-widest mb-1">
                    Cbt
                  </div>
                  <div className="text-3xl font-black text-totoro-orange font-mono">
                    {selectedPotion.recipe.combatScore}
                  </div>
                </div>
                <div className="text-center group">
                  <h4 className="text-[9px] font-bold text-totoro-blue/60 uppercase tracking-widest mb-1">
                    Utl
                  </h4>
                  <div className="text-3xl font-black text-totoro-blue font-mono">
                    {selectedPotion.recipe.utilityScore}
                  </div>
                </div>
                <div className="text-center group">
                  <h4 className="text-[9px] font-bold text-totoro-yellow/60 uppercase tracking-widest mb-1">
                    Why
                  </h4>
                  <div className="text-3xl font-black text-totoro-yellow font-mono">
                    {selectedPotion.recipe.whimsyScore}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => handleDeletePotion(selectedPotion.id)}
                variant="ghost"
                className="flex-1 !text-totoro-orange hover:!bg-totoro-orange/10 !rounded-2xl !font-bold"
              >
                🗑️ Excluir do Registro
              </Button>
              <Button onClick={closeModal} variant="secondary" className="flex-1 !rounded-2xl !font-bold">
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
