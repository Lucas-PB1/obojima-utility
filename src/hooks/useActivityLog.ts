'use client';

import { useState, useMemo } from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { useIngredients } from '@/hooks/useIngredients';
import { StatsService } from '@/services/statsService';

export function useActivityLog() {
  const { attempts, refreshData } = useIngredients();
  const [filteredAttempts, setFilteredAttempts] = useState<ForageAttempt[]>([]);

  const activityStats = useMemo(() => 
    StatsService.calculateActivityStats(filteredAttempts),
    [filteredAttempts]
  );

  const statsData = useMemo(() => [
    { value: activityStats.totalAttempts, label: 'Total de Tentativas', color: 'totoro-green' as const },
    { value: `${activityStats.successRate.toFixed(1)}%`, label: 'Taxa de Sucesso', color: 'totoro-blue' as const },
    { value: activityStats.averageRoll.toFixed(1), label: 'Rolagem Média', color: 'totoro-yellow' as const },
    { value: activityStats.ingredientsCollected, label: 'Ingredientes Coletados', color: 'totoro-gray' as const }
  ], [activityStats]);

  return {
    attempts,
    filteredAttempts,
    setFilteredAttempts,
    statsData,
    refreshData
  };
}
