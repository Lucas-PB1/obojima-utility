'use client';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIngredients } from '@/hooks/useIngredients';
import { socialService } from '@/services/socialService';
import { Friend, TradeItem, TradeItemType } from '@/types/social';
import { CollectedIngredient, CreatedPotion } from '@/types/ingredients';
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
  const [cart, setCart] = useState<TradeItem[]>([]);

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

  const existingItemIndex = cart.findIndex(
    (item) => item.id === selectedItemId && item.type === itemType
  );
  const quantityInCart = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;
  const maxAddable = selectedItem ? Math.max(0, selectedItem.quantity - quantityInCart) : 0;

  const addToCart = () => {
    if (!selectedItem) return;

    const existingItemIndex = cart.findIndex(
      (item) => item.id === selectedItemId && item.type === itemType
    );
    const quantityInCart = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;

    if (quantityInCart + quantity > selectedItem.quantity) {
      setMessage({
        type: 'error',
        text: t('social.trade.errorQuantityExceeds', selectedItem.quantity)
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (existingItemIndex >= 0) {
      setCart((prev) => {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
      });
    } else {
      const newItem: TradeItem = {
        type: itemType,
        id: selectedItemId,
        name:
          itemType === 'ingredient'
            ? localizeIngredient((selectedItem as CollectedIngredient).ingredient).nome
            : (selectedItem as CreatedPotion).potion.nome,
        quantity: quantity
      };
      setCart((prev) => [...prev, newItem]);
    }

    setMessage(null);
    setSelectedItemId('');
    setQuantity(1);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: t('social.trade.error') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await socialService.sendItems(friend.userId, cart);
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
    cart,
    addToCart,
    removeFromCart,
    handleSend,
    localizeIngredient,
    maxAddable
  };
}
