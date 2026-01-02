import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { useTranslation } from '@/hooks/useTranslation';

// Custom Hooks
import { useIngredientsCatalog } from './useIngredientsCatalog';
import { useUserIngredients } from './useUserIngredients';
import { useUserPotions } from './useUserPotions';
import { useUserHistory } from './useUserHistory';
import { useUserProfileManagement } from './useUserProfileManagement';

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
  const { t } = useTranslation();
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
    setAddQuantity
   } = useUserIngredients(user?.uid);

  const { 
    potions, 
    loading: potionsLoading, 
    fetchPotions, 
    handleDeletePotion 
  } = useUserPotions(user?.uid);

  const { 
    attempts, 
    loading: historyLoading, 
    fetchHistory 
  } = useUserHistory(user?.uid);

  const {
    handleEditName,
    handleToggleStatus,
    handleChangeRole,
    handleDeleteUser
  } = useUserProfileManagement({
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
    },

    potionsData: {
      potions,
      handleDeletePotion,
    },

    historyData: {
      attempts,
    },

    userActions: {
      handleEditName,
      handleToggleStatus,
      handleChangeRole,
      handleDeleteUser,
    }
  };
}


