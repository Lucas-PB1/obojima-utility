import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, Input } from '@/components/ui';
import { useUserSearch } from '@/hooks/useUserSearch';
import Image from 'next/image';

export function UserSearch() {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, results, loading, sentRequests, handleAddFriend } =
    useUserSearch();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(String(e))}
          placeholder={t('social.search.placeholder')}
          className="flex-1"
        />
      </div>

      <div className="space-y-4">
        {results.length === 0 && !loading && searchTerm.length >= 3 && (
          <p className="text-center text-totoro-gray/50 italic">{t('social.search.noResults')}</p>
        )}

        {results.map((user) => (
          <div key={user.uid} className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-totoro-blue/10 flex items-center justify-center text-lg">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
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
