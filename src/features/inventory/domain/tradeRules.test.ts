import { describe, expect, it } from 'vitest';
import { canAddTradeQuantity, getMaxAddableQuantity, validateTradeItems } from './tradeRules';

describe('trade rules', () => {
  it('validates item payloads', () => {
    expect(validateTradeItems([])).toBe('No items to send');
    expect(
      validateTradeItems([{ id: 'item', name: 'Item', type: 'ingredient', quantity: 1 }])
    ).toBeNull();
    expect(
      validateTradeItems([{ id: 'item', name: 'Item', type: 'ingredient', quantity: 0 }])
    ).toMatch(/Invalid quantity/);
    expect(
      validateTradeItems([{ id: 'item', name: 'Item', type: 'gold', quantity: 1 } as never])
    ).toBe('Invalid item type');
  });

  it('calculates addable quantities', () => {
    expect(getMaxAddableQuantity(5, 2)).toBe(3);
    expect(getMaxAddableQuantity(2, 5)).toBe(0);
    expect(canAddTradeQuantity(5, 2, 3)).toBe(true);
    expect(canAddTradeQuantity(5, 2, 4)).toBe(false);
  });
});
