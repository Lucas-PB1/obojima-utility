'use client';
import { UserProfile } from '@/types/auth';
import { useState, useEffect } from 'react';
import { useUserPotions } from '@/hooks/useUserPotions';
import { useUserHistory } from '@/hooks/useUserHistory';
import { useUserIngredients } from '@/hooks/useUserIngredients';
import { useIngredientsCatalog, AvailableIngredient } from '@/hooks/useIngredientsCatalog';
import { usePotionsCatalog, AvailablePotion } from '@/hooks/usePotionsCatalog';
import { useUserProfileManagement } from '@/hooks/useUserProfileManagement';

interface UseAdminUserDetailsProps {
  user: UserProfile | null;
  isOpen: boolean;
  onUpdate: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  onDelete: (uid: string, name: string) => Promise<void>;
  onClose: () => void;
}

export function useAdminUserDetails({
  user,
  isOpen,
  onUpdate,
  onDelete,
  onClose
}: UseAdminUserDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Custom Hooks
  const { availableIngredients } = useIngredientsCatalog();
  const {
    ingredients,
    loading: ingredientsLoading,
    fetchIngredients,
    handleDeleteIngredient,
    handleUpdateQuantity,
    handleAddItem,
    isAddingItem,
    setIsAddingItem,
    selectedUniqueKey,
    setSelectedUniqueKey,
    addQuantity,
    setAddQuantity,
    submitting
  } = useUserIngredients(user?.uid);

  const {
    potions,
    loading: potionsLoading,
    fetchPotions,
    handleDeletePotion,
    handleUpdateQuantity: handleUpdatePotionQuantity,
    handleAddItem: handleAddPotion,
    isAddingItem: isAddingPotion,
    setIsAddingItem: setIsAddingPotion,
    selectedUniqueKey: selectedPotionKey,
    setSelectedUniqueKey: setSelectedPotionKey,
    addQuantity: addPotionQuantity,
    setAddQuantity: setAddPotionQuantity,
    submitting: submittingPotion
  } = useUserPotions(user?.uid);
  
  const { availablePotions } = usePotionsCatalog();

  const { attempts, loading: historyLoading, fetchHistory } = useUserHistory(user?.uid);

  const { handleEditName, handleToggleStatus, handleChangeRole, handleDeleteUser } =
    useUserProfileManagement({
      user,
      onUpdate,
      onDelete,
      onClose
    });

  // Aggregate Loading State
  const loading = ingredientsLoading || potionsLoading || historyLoading;

  useEffect(() => {
    if (isOpen && user?.uid) {
      // Parallel fetching
      fetchIngredients();
      fetchPotions();
      fetchHistory();
    }
  }, [isOpen, user, fetchIngredients, fetchPotions, fetchHistory]);

  return {
    activeTab,
    setActiveTab,
    loading,

    ingredientsData: {
      availableIngredients,
      isAddingItem,
      setIsAddingItem,
      selectedUniqueKey,
      setSelectedUniqueKey,
      addQuantity,
      setAddQuantity,
      ingredients,
      handleDeleteIngredient,
      handleUpdateQuantity,
      handleAddItem: () => handleAddItem(availableIngredients),
      submitting,
      loading: ingredientsLoading
    },

    potionsData: {
      potions,
      availablePotions,
      isAddingItem: isAddingPotion,
      setIsAddingItem: setIsAddingPotion,
      selectedUniqueKey: selectedPotionKey,
      setSelectedUniqueKey: setSelectedPotionKey,
      addQuantity: addPotionQuantity,
      setAddQuantity: setAddPotionQuantity,
      handleDeletePotion,
      handleUpdateQuantity: handleUpdatePotionQuantity,
      handleAddItem: () => handleAddPotion(availablePotions),
      submitting: submittingPotion,
      loading: potionsLoading
    },

    historyData: {
      attempts
    },

    userActions: {
      handleEditName,
      handleToggleStatus,
      handleChangeRole,
      handleDeleteUser
    }
  };
}
