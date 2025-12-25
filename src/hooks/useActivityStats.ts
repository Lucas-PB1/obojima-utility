import { useState, useCallback } from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { StatsService } from '@/services/statsService';

export function useActivityStats() {
  const [filteredAttempts, setFilteredAttempts] = useState<ForageAttempt[]>([]);

  const activityStats = StatsService.calculateActivityStats(filteredAttempts);

  const handleClearLogs = useCallback((clearAttempts: () => void) => {
    if (confirm('Isso irá limpar todos os logs de forrageamento. Tem certeza?')) {
      clearAttempts();
    }
  }, []);

  const statsData = [
    {
      value: activityStats.totalAttempts,
      label: 'Total de Tentativas',
      color: 'totoro-green' as const
    },
    {
      value: `${activityStats.successRate.toFixed(1)}%`,
      label: 'Taxa de Sucesso',
      color: 'totoro-blue' as const
    },
    {
      value: activityStats.averageRoll.toFixed(1),
      label: 'Rolagem Média',
      color: 'totoro-yellow' as const
    },
    {
      value: activityStats.ingredientsCollected,
      label: 'Ingredientes Coletados',
      color: 'totoro-gray' as const
    }
  ];

  return {
    filteredAttempts,
    setFilteredAttempts,
    activityStats,
    statsData,
    handleClearLogs
  };
}
