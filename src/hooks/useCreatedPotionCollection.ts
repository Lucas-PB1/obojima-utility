'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { PotionFilterType } from '@/constants/potions';

export function useCreatedPotionCollection() {
  const [potions, setPotions] = useState<CreatedPotion[]>([]);
  const [selectedPotion, setSelectedPotion] = useState<CreatedPotion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<PotionFilterType>('all');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    used: 0,
    byCategory: { combat: 0, utility: 0, whimsy: 0 },
    recent: 0
  });

  useEffect(() => {
    const unsubscribe = firebaseCreatedPotionService.subscribeToCreatedPotions((potionsData) => {
      setPotions(potionsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await firebaseCreatedPotionService.getPotionStats();
      setStats(statsData);
    };
    loadStats();
  }, [potions]);

  const loadPotions = useCallback(async () => {
    const allPotions = await firebaseCreatedPotionService.getAllCreatedPotions();
    setPotions(allPotions);
  }, []);

  const filteredPotions = useMemo(() => {
    return potions.filter((potion) => {
      if (filter === 'all') return true;
      if (filter === 'available') return potion.quantity > 0;
      if (filter === 'used') return potion.used;
      return true;
    });
  }, [potions, filter]);

  const handlePotionClick = useCallback((potion: CreatedPotion) => {
    setSelectedPotion(potion);
    setShowModal(true);
  }, []);

  const handleUsePotion = useCallback(
    async (potionId: string) => {
      const success = await firebaseCreatedPotionService.usePotion(potionId);
      if (success) {
        loadPotions();
      }
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

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    potions,
    filteredPotions,
    selectedPotion,
    showModal,
    closeModal,
    filter,
    setFilter,
    stats,
    handlePotionClick,
    handleUsePotion,
    handleDeletePotion,
    loadPotions
  };
}
