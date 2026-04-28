'use client';
import { useState, useEffect } from 'react';
import { PublicUserProfile } from '@/types/social';
import { socialService } from '@/services/socialService';
import { logger } from '@/utils/logger';

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = socialService.subscribeToSentFriendRequests((requests) => {
      setSentRequests(new Set(requests.map((request) => request.toUserId)));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setLoading(true);
        setError(null);
        try {
          const users = await socialService.searchUsers(searchTerm);
          setResults(users);
        } catch (error) {
          logger.error('Erro ao buscar usuários:', error);
          setResults([]);
          setError(error instanceof Error ? error.message : 'Erro ao buscar usuários');
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddFriend = async (userId: string) => {
    setLoadingMap((prev) => ({ ...prev, [userId]: true }));
    setError(null);
    try {
      await socialService.sendFriendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (error) {
      logger.error('Erro ao adicionar amigo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar solicitação');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingMap,
    sentRequests,
    error,
    handleAddFriend
  };
}
