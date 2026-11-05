'use client';
import { useState, useEffect, useRef } from 'react';
import { PublicUserProfile } from '@/types/social';
import { socialService } from '@/services/socialService';
import { logger } from '@/utils/logger';

export const MIN_SEARCH_LENGTH = 3;

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    const delayDebounceFn = setTimeout(async () => {
      setError(null);
      try {
        const users = await socialService.searchUsers(term);
        // Ignore responses that arrive after the player typed something newer.
        if (requestId === requestIdRef.current) setResults(users);
      } catch (error) {
        logger.error('Erro ao buscar usuários:', error);
        if (requestId === requestIdRef.current) {
          setResults([]);
          setError(error instanceof Error ? error.message : 'Erro ao buscar usuários');
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const runAction = async (userId: string, action: () => Promise<void>) => {
    setLoadingMap((prev) => ({ ...prev, [userId]: true }));
    setError(null);
    try {
      await action();
    } catch (error) {
      logger.error('Erro na ação social:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar solicitação');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleAddFriend = (userId: string) =>
    runAction(userId, () => socialService.sendFriendRequest(userId));

  const handleAcceptRequest = (userId: string, requestId: string) =>
    runAction(userId, () => socialService.respondToFriendRequest(requestId, true));

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingMap,
    error,
    handleAddFriend,
    handleAcceptRequest
  };
}
