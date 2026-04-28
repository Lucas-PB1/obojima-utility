import { TradeItem } from '@/types/social';

export function validateTradeItems(items: TradeItem[]): string | null {
  if (!items.length) return 'No items to send';

  for (const item of items) {
    if (!item.id || !item.name || !item.type) return 'Invalid item data';
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return `Invalid quantity for ${item.name}`;
    }
  }

  return null;
}

export function getMaxAddableQuantity(stockQuantity: number, quantityInCart: number): number {
  return Math.max(0, stockQuantity - quantityInCart);
}

export function canAddTradeQuantity(
  stockQuantity: number,
  quantityInCart: number,
  requestedQuantity: number
): boolean {
  return requestedQuantity > 0 && quantityInCart + requestedQuantity <= stockQuantity;
}
