'use client';
import React, { useMemo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

export function useForageResult(result: ForageAttempt | null) {
  const { settings } = useSettings();

  const regionDisplayName = useMemo(() => {
    if (!result) return '';
    return ingredientsService.getRegionDisplayName(result.region, settings.language);
  }, [result, settings.language]);

  const particles = useMemo(() => {
    if (!result?.success) return [];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      style: {
        width: Math.random() * 4 + 2 + 'px',
        height: Math.random() * 4 + 2 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 2 + 's',
        opacity: Math.random() * 0.5 + 0.3
      } as React.CSSProperties
    }));
  }, [result?.success]);

  return {
    settings,
    regionDisplayName,
    particles,
    showDoubleForage:
      settings.doubleForageTalent &&
      result?.success &&
      (result.rarity === 'comum' || result.rarity === 'incomum')
  };
}
