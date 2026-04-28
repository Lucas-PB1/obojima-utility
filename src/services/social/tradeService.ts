import { authService } from '@/services/authService';
import { TradeItem } from '@/types/social';
import { validateTradeItems } from '@/features/inventory/domain/tradeRules';
import { isE2EMode } from '@/lib/e2e/mockData';

export class TradeService {
  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    if (!toUserId) throw new Error('Invalid receiver ID');

    const validationError = validateTradeItems(items);
    if (validationError) throw new Error(validationError);

    if (isE2EMode()) return;

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
