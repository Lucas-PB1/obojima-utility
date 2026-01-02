import { useState, useCallback } from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { firebaseStorageService } from '@/services/firebaseStorageService';

export function useUserHistory(userId: string | undefined) {
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await firebaseStorageService.getForageAttempts(userId);
      setAttempts(data);
    } catch (error) {
      console.error('Error fetching history', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    attempts,
    loading,
    fetchHistory
  };
}
