import { authService } from '@/services/authService';
import { TradeItem } from '@/types/social';
import { CollectedIngredient, CreatedPotion } from '@/types/ingredients';
import { validateTradeItems } from '@/features/inventory/domain/tradeRules';
import { isE2EMode } from '@/lib/e2e/mockData';
import { createDevId, DevState, getDevUserId, isDevMode, setDevState } from '@/features/dev-mode';

function transferDevItems(
  state: DevState,
  fromUserId: string,
  toUserId: string,
  items: TradeItem[]
): Pick<DevState, 'ingredientsByUser' | 'potionsByUser'> {
  let senderIngredients = [...(state.ingredientsByUser[fromUserId] || [])];
  let receiverIngredients = [...(state.ingredientsByUser[toUserId] || [])];
  let senderPotions = [...(state.potionsByUser[fromUserId] || [])];
  let receiverPotions = [...(state.potionsByUser[toUserId] || [])];
  const now = new Date();

  items.forEach((item) => {
    if (item.type === 'ingredient') {
      const senderItem = senderIngredients.find((entry) => entry.id === item.id);
      if (!senderItem || senderItem.quantity < item.quantity) {
        throw new Error(`Not enough quantity for ${item.name}`);
      }

      const nextQuantity = senderItem.quantity - item.quantity;
      senderIngredients =
        nextQuantity <= 0
          ? senderIngredients.filter((entry) => entry.id !== item.id)
          : senderIngredients.map((entry) =>
              entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry
            );

      const receiverIndex = receiverIngredients.findIndex(
        (entry) => !entry.used && entry.ingredient.id === senderItem.ingredient.id
      );

      if (receiverIndex >= 0) {
        receiverIngredients = receiverIngredients.map((entry, index) =>
          index === receiverIndex
            ? { ...entry, quantity: entry.quantity + item.quantity, used: false, usedAt: undefined }
            : entry
        );
      } else {
        const receivedItem: CollectedIngredient = {
          ...senderItem,
          id: createDevId('ingredient'),
          quantity: item.quantity,
          collectedAt: now,
          used: false,
          usedAt: undefined
        };
        receiverIngredients = [receivedItem, ...receiverIngredients];
      }

      return;
    }

    const senderItem = senderPotions.find((entry) => entry.id === item.id);
    if (!senderItem || senderItem.quantity < item.quantity) {
      throw new Error(`Not enough quantity for ${item.name}`);
    }

    const nextQuantity = senderItem.quantity - item.quantity;
    senderPotions =
      nextQuantity <= 0
        ? senderPotions.filter((entry) => entry.id !== item.id)
        : senderPotions.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry
          );

    const receivedPotion: CreatedPotion = {
      ...senderItem,
      id: createDevId('potion'),
      quantity: item.quantity,
      createdAt: now,
      used: false,
      usedAt: undefined
    };
    receiverPotions = [receivedPotion, ...receiverPotions];
  });

  return {
    ingredientsByUser: {
      ...state.ingredientsByUser,
      [fromUserId]: senderIngredients,
      [toUserId]: receiverIngredients
    },
    potionsByUser: {
      ...state.potionsByUser,
      [fromUserId]: senderPotions,
      [toUserId]: receiverPotions
    }
  };
}

export class TradeService {
  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    if (!toUserId) throw new Error('Invalid receiver ID');

    const validationError = validateTradeItems(items);
    if (validationError) throw new Error(validationError);

    if (isE2EMode() || isDevMode()) {
      const fromUserId = getDevUserId();
      setDevState((state) => ({
        ...state,
        ...transferDevItems(state, fromUserId, toUserId, items),
        trades: [
          {
            id: createDevId('trade'),
            fromUserId,
            fromUserName:
              state.users.find((user) => user.uid === fromUserId)?.displayName || 'User',
            toUserId,
            participants: [fromUserId, toUserId],
            items,
            timestamp: new Date(),
            status: 'completed'
          },
          ...state.trades
        ]
      }));
      return;
    }

    if (!authService.getUserId()) throw new Error('Not authenticated');

    const response = await fetch('/api/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authService.getAuthorizationHeaders())
      },
      body: JSON.stringify({ toUserId, items })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Trade failed');
    }
  }
}
