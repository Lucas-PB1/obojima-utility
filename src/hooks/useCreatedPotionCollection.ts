'use client';
import { CreatedPotion } from '@/types/ingredients';
import { useState, useCallback } from 'react';
import { useCreatedPotionsData } from './useCreatedPotionsData';
import { usePotionFilter } from './usePotionFilter';
import { usePotionCollectionStats } from './usePotionCollectionStats';

export function useCreatedPotionCollection() {
  const { 
    potions, 
    handleUsePotion, 
    handleDeletePotion, 
    loadPotions 
  } = useCreatedPotionsData();

  const { filteredPotions, filter, setFilter } = usePotionFilter(potions);
  const { stats, statsData } = usePotionCollectionStats(potions);

  const [selectedPotion, setSelectedPotion] = useState<CreatedPotion | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handlePotionClick = useCallback((potion: CreatedPotion) => {
    setSelectedPotion(potion);
    setShowModal(true);
  }, []);

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
    statsData,
    handlePotionClick,
    handleUsePotion,
    handleDeletePotion,
    loadPotions
  };
}
