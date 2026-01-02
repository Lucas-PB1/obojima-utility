'use client';
import { CreatedPotion } from '@/types/ingredients';
import { PotionFilterType } from '@/constants/potions';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { potionService } from '@/services/potionService';

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
    recent: 0,
    progress: {
      total: { collected: 0, total: 0, percentage: 0 },
      combat: { collected: 0, total: 0 },
      utility: { collected: 0, total: 0 },
      whimsy: { collected: 0, total: 0 }
    }
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
      
      // Calculate progress stats
      const totalPotionsData = await potionService.getTotalPotionsCount();
      
      // Count unique potions collected by ID from created potions
      // Note: CreatedPotion contains 'recipe' which contains 'resultingPotion'
      const uniquePotions = new Set<string>();
      const uniqueCombat = new Set<string>();
      const uniqueUtility = new Set<string>();
      const uniqueWhimsy = new Set<string>();

      potions.forEach(potion => {
        // ID format: id-winningAttribute to distinguish variations if needed, 
        // or just ID if we only care about base potion type.
        // Usually potion ID is enough to identify the type.
        // But let's stick to consistent logic with Recipes.
        const potionId = `${potion.recipe.resultingPotion.id}-${potion.recipe.winningAttribute}`;
        uniquePotions.add(potionId);
        
        if (potion.recipe.winningAttribute === 'combat') uniqueCombat.add(potionId);
        if (potion.recipe.winningAttribute === 'utility') uniqueUtility.add(potionId);
        if (potion.recipe.winningAttribute === 'whimsy') uniqueWhimsy.add(potionId);
      });

      setStats({
        ...statsData,
        progress: {
          total: {
            collected: uniquePotions.size,
            total: totalPotionsData.total,
            percentage: Math.round((uniquePotions.size / totalPotionsData.total) * 100)
          },
          combat: {
            collected: uniqueCombat.size,
            total: totalPotionsData.combat
          },
          utility: {
            collected: uniqueUtility.size,
            total: totalPotionsData.utility
          },
          whimsy: {
            collected: uniqueWhimsy.size,
            total: totalPotionsData.whimsy
          }
        }
      });
    };
    loadStats();
  }, [potions]);

  const loadPotions = useCallback(async () => {
    const allPotions = await firebaseCreatedPotionService.getAllCreatedPotions();
    setPotions(allPotions);
  }, []);

  const filteredPotions = useMemo(() => {
    const result = potions.filter((potion) => {
      if (filter === 'all') return true;
      if (filter === 'available') return potion.quantity > 0;
      if (filter === 'used') return potion.used;
      return true;
    });

    return result.sort((a, b) => {
      // Sort by Category Order
      const categoryOrder = { combat: 1, utility: 2, whimsy: 3 };
      const catA = categoryOrder[a.recipe.winningAttribute as keyof typeof categoryOrder] || 99;
      const catB = categoryOrder[b.recipe.winningAttribute as keyof typeof categoryOrder] || 99;
      
      if (catA !== catB) return catA - catB;
      
      // Sort by ID (Number)
      return a.potion.id - b.potion.id;
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
