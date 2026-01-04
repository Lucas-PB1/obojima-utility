"use client";
import { UserProfile } from '@/types/auth';
import { useState, useEffect } from 'react';
import { socialService } from '@/services/socialService';

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setLoading(true);
        try {
          const users = await socialService.searchUsers(searchTerm);
          setResults(users);
        } catch {
          setResults([]);
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
    try {
      await socialService.sendFriendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
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
    handleAddFriend
  };
}
