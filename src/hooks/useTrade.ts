import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend, TradeItem, TradeItemType } from '@/types/social';
import { socialService } from '@/services/socialService';
import { useIngredients } from '@/hooks/useIngredients';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';
import { useCreatedPotionCollection } from '@/hooks/useCreatedPotionCollection';

export function useTrade(friend: Friend, onClose: () => void) {
  const { t } = useTranslation();
  const { ingredients } = useIngredients();
  const { localizeIngredient } = useLocalizedIngredients();
  const { potions } = useCreatedPotionCollection();

  const [itemType, setItemType] = useState<TradeItemType>('ingredient');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableIngredients = ingredients.filter((i) => !i.used && i.quantity > 0);
  const availablePotions = potions.filter((p) => !p.used && p.quantity > 0);

  const getSelectedItem = () => {
    if (itemType === 'ingredient') {
      return availableIngredients.find((i) => i.id === selectedItemId);
    } else {
      return availablePotions.find((p) => p.id === selectedItemId);
    }
  };

  const selectedItem = getSelectedItem();

  const handleSend = async () => {
    if (!selectedItem) {
      setMessage({ type: 'error', text: t('social.trade.error') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const tradeItem: TradeItem = {
        type: itemType,
        id: selectedItemId,
        name:
          itemType === 'ingredient'
            ? localizeIngredient((selectedItem as { ingredient: any }).ingredient).nome
            : (selectedItem as { potion: { nome: string } }).potion.nome,
        quantity: quantity
      };

      await socialService.sendItem(friend.userId, tradeItem);
      setMessage({ type: 'success', text: t('social.trade.success') });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Trade error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : t('social.trade.error') 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    itemType,
    setItemType,
    selectedItemId,
    setSelectedItemId,
    quantity,
    setQuantity,
    loading,
    message,
    availableIngredients,
    availablePotions,
    selectedItem,
    handleSend,
    localizeIngredient
  };
}
