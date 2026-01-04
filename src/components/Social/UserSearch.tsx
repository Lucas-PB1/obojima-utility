import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, Input } from '@/components/ui';
import { useUserSearch } from '@/hooks/useUserSearch';
import Image from 'next/image';

export function UserSearch() {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, results, loading, loadingMap, sentRequests, handleAddFriend } =
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
          <div
            key={user.uid}
            className="glass-panel p-5 flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:border-totoro-blue/30"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full bg-totoro-blue/10 flex items-center justify-center text-2xl shadow-sm ring-2 ring-white/40 group-hover:ring-totoro-blue/30 transition-all duration-300">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={56}
                    height={56}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <span className="opacity-70">👤</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-totoro-gray group-hover:text-totoro-blue transition-colors duration-300">
                  {user.displayName || t('admin.users.noName')}
                </span>
                <span className="text-sm text-totoro-gray/60">{user.email}</span>
              </div>
            </div>
            {sentRequests.has(user.uid) ? (
              <span className="text-xs font-bold text-green-600 bg-green-100/80 px-4 py-1.5 rounded-full border border-green-200 backdrop-blur-sm">
                {t('social.search.requestSent')}
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() => handleAddFriend(user.uid)}
                disabled={loadingMap[user.uid]}
                className="opacity-90 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                {loadingMap[user.uid] ? '...' : t('social.search.addFriend')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
