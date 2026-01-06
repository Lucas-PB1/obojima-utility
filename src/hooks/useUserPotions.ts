'use client';
import { useState, useCallback } from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { AvailablePotion } from './usePotionsCatalog';

export function useUserPotions(userId: string | undefined) {
  const { t } = useTranslation();
  const [potions, setPotions] = useState<CreatedPotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUniqueKey, setSelectedUniqueKey] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState(1);

  const fetchPotions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await firebaseCreatedPotionService.getAllCreatedPotions(userId);
      setPotions(data);
    } catch (error) {
      console.error('Error fetching potions', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleDeletePotion = async (id: string, name: string) => {
    if (!userId) return;
    if (confirm(t('admin.modal.actions.remove_potion_confirm', name))) {
      try {
        await firebaseCreatedPotionService.removePotion(id, userId);
        setPotions((prev) => prev.filter((p) => p.id !== id));
      } catch {
        console.error(t('admin.modal.actions.remove_potion_error'));
      }
    }
  };

  const handleUpdateQuantity = async (id: string, current: number, change: number) => {
    if (!userId) return;
    try {
      await firebaseCreatedPotionService.updatePotionQuantity(id, change, userId);

      // Optimistic update
      setPotions((prev) =>
        prev
          .map((p) => {
            if (p.id === id) {
              return { ...p, quantity: (p.quantity || 0) + change };
            }
            return p;
          })
          .filter((p) => p.quantity > 0)
      );
    } catch (err) {
      console.error('Failed to update quantity', err);
      fetchPotions(); // Revert on error
    }
  };

  const handleAddItem = async (availablePotions: AvailablePotion[]) => {
    if (!userId) return;
    const potionToAdd = availablePotions.find((p) => p.uniqueKey === selectedUniqueKey);
    if (!potionToAdd) return;

    setSubmitting(true);
    try {
      // Check if user already has this specific potion (by ID of the resulting potion and winning attribute)
      // Since "Standard" potions have a specific ID in the json, we can check that.
      // However, "CreatedPotion" entries are unique.

      // Strategy: Look for an existing potion with same resultingPotion.id and winningAttribute.
      const existing = potions.find(
        (p) =>
          p.recipe.resultingPotion.id === potionToAdd.id &&
          p.recipe.winningAttribute === potionToAdd.winningAttribute
      );

      if (existing) {
        await firebaseCreatedPotionService.updatePotionQuantity(existing.id, addQuantity, userId);
      } else {
        // Create new
        const recipe = {
          id: '', // Will be generated
          ingredients: [],
          combatScore: 0,
          utilityScore: 0,
          whimsyScore: 0,
          winningAttribute: potionToAdd.winningAttribute,
          resultingPotion: potionToAdd,
          createdAt: new Date()
        };

        await firebaseCreatedPotionService.addCreatedPotion(recipe, userId, addQuantity);
      }

      await fetchPotions();

      setIsAddingItem(false);
      setSelectedUniqueKey('');
      setAddQuantity(1);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    potions,
    loading,
    fetchPotions,
    handleDeletePotion,
    handleUpdateQuantity,
    handleAddItem,
    isAddingItem,
    setIsAddingItem,
    selectedUniqueKey,
    setSelectedUniqueKey,
    addQuantity,
    setAddQuantity,
    submitting
  };
}
