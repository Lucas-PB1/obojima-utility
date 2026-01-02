import { useState, useEffect } from 'react';
import { socialService } from '@/services/socialService';
import { UserProfile } from '@/types/auth';

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
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
    await socialService.sendFriendRequest(userId);
    setSentRequests((prev) => new Set(prev).add(userId));
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    sentRequests,
    handleAddFriend
  };
}
