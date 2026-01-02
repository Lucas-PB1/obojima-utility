'use client';
import { CreatedPotion } from '@/types/ingredients';
import { useState, useEffect, useCallback } from 'react';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';

export function useCreatedPotionsData() {
  const [potions, setPotions] = useState<CreatedPotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseCreatedPotionService.subscribeToCreatedPotions((potionsData) => {
      setPotions(potionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadPotions = useCallback(async () => {
    const allPotions = await firebaseCreatedPotionService.getAllCreatedPotions();
    setPotions(allPotions);
  }, []);

  const handleUsePotion = useCallback(
    async (potionId: string) => {
      const success = await firebaseCreatedPotionService.usePotion(potionId);
      if (success) {
        loadPotions();
      }
      return success;
    },
    [loadPotions]
  );

  const handleDeletePotion = useCallback(
    async (potionId: string) => {
      if (confirm('Tem certeza que deseja excluir esta poção?')) {
        await firebaseCreatedPotionService.removePotion(potionId);
        loadPotions();
      }
    },
    [loadPotions]
  );

  return {
    potions,
    loading,
    loadPotions,
    handleUsePotion,
    handleDeletePotion
  };
}
