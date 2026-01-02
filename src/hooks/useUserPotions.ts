import { useState, useCallback } from 'react';
import { CreatedPotion } from '@/types/ingredients';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { useTranslation } from '@/hooks/useTranslation';

export function useUserPotions(userId: string | undefined) {
  const { t } = useTranslation();
  const [potions, setPotions] = useState<CreatedPotion[]>([]);
  const [loading, setLoading] = useState(false);

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
      } catch (error) {
        alert(t('admin.modal.actions.remove_potion_error'));
      }
    }
  };

  return {
    potions,
    loading,
    fetchPotions,
    handleDeletePotion
  };
}
