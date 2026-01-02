import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { socialService } from '@/services/socialService';
import Button from '@/components/ui/Button';
import { UserProfile } from '@/types/auth';

export default function UserSearch() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.error('[UserSearch] handleSearch triggered with:', searchTerm);

    if (!searchTerm.trim()) {
      console.error('[UserSearch] Search term empty');
      return;
    }

    setLoading(true);
    try {
      console.error('[UserSearch] Calling socialService.searchUsers...');
      const users = await socialService.searchUsers(searchTerm);
      console.error('[UserSearch] Got results:', users);
      setResults(users);
    } catch (error) {
      console.error('[UserSearch] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await socialService.sendFriendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (error) {
      console.error('Error sending request', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('social.search.placeholder')}
          className="flex-1 bg-white/50 border border-totoro-blue/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-totoro-blue/50"
        />
        <Button type="submit" disabled={loading || searchTerm.length < 3}>
          {t('social.tabs.search')}
        </Button>
      </form>

      <div className="space-y-4">
        {results.length === 0 && !loading && searchTerm.length >= 3 && (
          <p className="text-center text-totoro-gray/50 italic">{t('social.search.noResults')}</p>
        )}

        {results.map((user) => (
          <div key={user.uid} className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-totoro-blue/10 flex items-center justify-center text-lg">
                {user.photoURL ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="rounded-full"
                    />
                  </>
                ) : (
                  '👤'
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-totoro-gray">
                  {user.displayName || t('admin.users.noName')}
                </span>
                <span className="text-xs text-totoro-blue/60">{user.email}</span>
              </div>
            </div>
            {sentRequests.has(user.uid) ? (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                {t('social.search.requestSent')}
              </span>
            ) : (
              <Button size="sm" onClick={() => handleAddFriend(user.uid)}>
                {t('social.search.addFriend')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
