import { useState, useCallback } from 'react';
import { CollectedIngredient, Ingredient } from '@/types/ingredients';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { useTranslation } from '@/hooks/useTranslation';
import { AvailableIngredient } from './useIngredientsCatalog';

export function useUserIngredients(userId: string | undefined) {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedUniqueKey, setSelectedUniqueKey] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState(1);

  const fetchIngredients = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await firebaseStorageService.getCollectedIngredients(userId);
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!userId) return;
    if (confirm(t('admin.modal.actions.remove_ingredient_confirm', name))) {
      try {
        await firebaseStorageService.removeCollectedIngredient(id, userId);
        setIngredients((prev) => prev.filter((i) => i.id !== id));
      } catch (error) {
        alert(t('admin.modal.actions.remove_ingredient_error'));
      }
    }
  };

  const handleUpdateQuantity = async (id: string, currentQty: number, change: number) => {
    if (!userId) return;
    const newQty = currentQty + change;
    if (newQty <= 0) {
      handleDeleteIngredient(id, 'Item');
      return;
    }
    try {
      await firebaseStorageService.updateCollectedIngredient(id, { quantity: newQty }, userId);
      setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
    } catch(error) {
        console.error('Error updating quantity', error);
    }
  };

  const handleAddItem = async (availableIngredients: AvailableIngredient[]) => {
    if (!selectedUniqueKey || !userId) return;

    const ingredientToAdd = availableIngredients.find((i) => i.uniqueKey === selectedUniqueKey);
    if (!ingredientToAdd) return;

    try {
      const cleanIngredient: Ingredient = {
        id: ingredientToAdd.id,
        nome: ingredientToAdd.nome,
        combat: ingredientToAdd.combat,
        utility: ingredientToAdd.utility,
        whimsy: ingredientToAdd.whimsy,
        descricao: ingredientToAdd.descricao,
        raridade: ingredientToAdd.raridade
      };

      const newIngredient: CollectedIngredient = {
        id: '',
        ingredient: cleanIngredient,
        quantity: addQuantity,
        collectedAt: new Date(),
        used: false,
        forageAttemptId: 'admin-add'
      };

      await firebaseStorageService.addCollectedIngredient(newIngredient, userId);
      
      // Re-fetch to ensure sync and get IDs
      const updatedIngredients = await firebaseStorageService.getCollectedIngredients(userId);
      setIngredients(updatedIngredients);

      setIsAddingItem(false);
      setSelectedUniqueKey('');
      setAddQuantity(1);
    } catch (error) {
      alert(t('admin.modal.actions.add_error'));
    }
  };

  return {
    ingredients,
    loading,
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
  };
}
