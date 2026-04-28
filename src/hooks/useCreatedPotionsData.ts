'use client';
import { CreatedPotion } from '@/types/ingredients';
import { useState, useEffect, useCallback } from 'react';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { e2ePotions, isE2EMode } from '@/lib/e2e/mockData';

export function useCreatedPotionsData() {
  const [potions, setPotions] = useState<CreatedPotion[]>(isE2EMode() ? e2ePotions : []);
  const [loading, setLoading] = useState(!isE2EMode());

  useEffect(() => {
    if (isE2EMode()) {
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseCreatedPotionService.subscribeToCreatedPotions((potionsData) => {
      setPotions(potionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadPotions = useCallback(async () => {
    if (isE2EMode()) {
      setPotions(e2ePotions);
      return;
    }

    const allPotions = await firebaseCreatedPotionService.getAllCreatedPotions();
    setPotions(allPotions);
  }, []);

  const handleUsePotion = useCallback(
    async (potionId: string) => {
      if (isE2EMode()) {
        setPotions((prev) =>
          prev.map((potion) =>
            potion.id === potionId
              ? { ...potion, quantity: Math.max(0, potion.quantity - 1) }
              : potion
          )
        );
        return true;
      }

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
      if (isE2EMode()) {
        setPotions((prev) => prev.filter((potion) => potion.id !== potionId));
        return;
      }

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
