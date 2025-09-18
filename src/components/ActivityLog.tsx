'use client';

import React, { useState } from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { useIngredients } from '@/hooks/useIngredients';
import { StatsService } from '@/services/statsService';
import PageLayout from './ui/PageLayout';
import PageHeader from './ui/PageHeader';
import StatsGrid from './ui/StatsGrid';
import ActivityFilters from './filters/ActivityFilters';
import EmptyState from './ui/EmptyState';
import ContentCard from './ui/ContentCard';
import { ingredientsService } from '@/services/ingredientsService';

export default function ActivityLog() {
  const { attempts } = useIngredients();
  const [filteredAttempts, setFilteredAttempts] = useState<ForageAttempt[]>([]);

  const activityStats = StatsService.calculateActivityStats(filteredAttempts);
  
  const statsData = [
    { value: activityStats.totalAttempts, label: 'Total de Tentativas', color: 'emerald' as const },
    { value: `${activityStats.successRate.toFixed(1)}%`, label: 'Taxa de Sucesso', color: 'teal' as const },
    { value: activityStats.averageRoll.toFixed(1), label: 'Rolagem Média', color: 'cyan' as const },
    { value: activityStats.ingredientsCollected, label: 'Ingredientes Coletados', color: 'slate' as const }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Log de Atividades"
        subtitle="Histórico completo de suas tentativas de forrageamento"
        icon="📋"
      />

      <StatsGrid title="📊 Estatísticas do Período" stats={statsData} className="mb-8" />

      <ActivityFilters 
        attempts={attempts} 
        onFilteredAttempts={setFilteredAttempts}
      />

      <ContentCard title={`Atividades (${filteredAttempts.length})`}>
      {filteredAttempts.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Nenhuma atividade encontrada"
          description="Comece a forragear para ver suas atividades aqui!"
        />
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map(attempt => (
            <div 
              key={attempt.id}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                attempt.success 
                  ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' 
                  : 'bg-red-50 border-red-200 hover:border-red-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl ${
                      attempt.success ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {attempt.success ? '🎉' : '😞'}
                    </span>
                    <h3 className={`text-lg font-bold ${
                      attempt.success ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      {attempt.success ? 'Forrageamento Bem-sucedido' : 'Forrageamento Falhou'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attempt.rarity === 'comum' 
                        ? 'bg-emerald-200 text-emerald-700' 
                        : 'bg-teal-200 text-teal-700'
                    }`}>
                      {attempt.rarity}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Região:</span>
                      <p className="text-gray-600">
                        {ingredientsService.getRegionDisplayName(attempt.region)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Teste:</span>
                      <p className="text-gray-600 capitalize">
                        {attempt.testType === 'natureza' ? '🌱 Natureza' : '🏕️ Sobrevivência'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rolagem:</span>
                      <p className="text-gray-600">
                        {attempt.roll} (DC {attempt.dcRange})
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data:</span>
                      <p className="text-gray-600">
                        {attempt.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">
                      Mod: {attempt.modifier > 0 ? '+' : ''}{attempt.modifier}
                    </span>
                    {attempt.bonusDice && (
                      <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs">
                        {attempt.bonusDice.value}d{attempt.bonusDice.type.substring(1)}
                      </span>
                    )}
                    {attempt.advantage !== 'normal' && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                        {attempt.advantage === 'vantagem' ? '✨ Vantagem' : '⚠️ Desvantagem'}
                      </span>
                    )}
                  </div>
                </div>

                {attempt.success && attempt.ingredient && (
                  <div className="md:w-80">
                    <div className="bg-white/90 p-4 rounded-lg border border-emerald-200">
                      <h4 className="font-bold text-emerald-800 mb-2">
                        🎁 Ingrediente Coletado
                      </h4>
                      <p className="text-emerald-700 font-medium mb-2">
                        {attempt.ingredient.nome_portugues}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {attempt.ingredient.descricao.substring(0, 120)}...
                      </p>
                      <div className="flex justify-center space-x-2">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                          ⚔️ {attempt.ingredient.combat}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          🛠️ {attempt.ingredient.utility}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                          ✨ {attempt.ingredient.whimsy}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </ContentCard>
    </PageLayout>
  );
}