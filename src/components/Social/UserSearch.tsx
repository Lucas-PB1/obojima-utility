import React from 'react';
import { Check, Clock, Loader2, MessageCircle, Search, UserPlus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, UserAvatar } from '@/components/ui';
import { MIN_SEARCH_LENGTH, useUserSearch } from '@/hooks/useUserSearch';
import { useSocialData } from '@/contexts/SocialContext';
import { Friend } from '@/types/social';

interface UserSearchProps {
  onChat: (friend: Friend) => void;
}

export function UserSearch({ onChat }: UserSearchProps) {
  const { t } = useTranslation();
  const { friends, requests, sentRequests, blockedUsers } = useSocialData();
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingMap,
    error,
    handleAddFriend,
    handleAcceptRequest
  } = useUserSearch();

  const blockedIds = new Set(blockedUsers.map((blocked) => blocked.blockedUserId));
  const visibleResults = results.filter((user) => !blockedIds.has(user.uid));
  const term = searchTerm.trim();

  const renderAction = (uid: string) => {
    const friend = friends.find((item) => item.userId === uid);
    if (friend) {
      return (
        <Button size="sm" variant="outline" onClick={() => onChat(friend)}>
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t('social.search.alreadyFriends')}</span>
        </Button>
      );
    }

    const incoming = requests.find((request) => request.fromUserId === uid);
    if (incoming) {
      return (
        <Button
          size="sm"
          variant="success"
          onClick={() => handleAcceptRequest(uid, incoming.id)}
          disabled={loadingMap[uid]}
        >
          <Check className="h-4 w-4" />
          {loadingMap[uid] ? '...' : t('social.requests.accept')}
        </Button>
      );
    }

    if (sentRequests.some((request) => request.toUserId === uid)) {
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-green-100/80 px-3 py-1.5 text-xs font-bold text-green-700">
          <Clock className="h-3.5 w-3.5" />
          {t('social.search.requestSent')}
        </span>
      );
    }

    return (
      <Button size="sm" onClick={() => handleAddFriend(uid)} disabled={loadingMap[uid]}>
        <UserPlus className="h-4 w-4" />
        {loadingMap[uid] ? '...' : t('social.search.addFriend')}
      </Button>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-totoro-gray/40" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('social.search.placeholder')}
          aria-label={t('social.search.placeholder')}
          autoFocus
          className="h-12 w-full rounded-lg bg-[var(--input-bg)] pl-10 pr-10 text-sm text-totoro-gray shadow-[inset_0_0_0_1px_var(--hairline)] focus:outline-none focus:ring-2 focus:ring-totoro-blue/30"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-totoro-blue" />
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-100/80 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {term.length > 0 && term.length < MIN_SEARCH_LENGTH && (
        <p className="text-center text-sm text-totoro-gray/50">
          {t('social.search.minChars', MIN_SEARCH_LENGTH)}
        </p>
      )}

      {term.length === 0 && (
        <p className="text-center text-sm text-totoro-gray/50">{t('social.search.hint')}</p>
      )}

      {visibleResults.length === 0 && !loading && !error && term.length >= MIN_SEARCH_LENGTH && (
        <p className="text-center italic text-totoro-gray/50">{t('social.search.noResults')}</p>
      )}

      <div className="space-y-2">
        {visibleResults.map((user) => (
          <div
            key={user.uid}
            className="glass-panel flex items-center justify-between gap-3 p-3 sm:p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                src={user.photoURL}
                name={user.displayName}
                className="h-12 w-12 shrink-0"
                fallbackClassName="text-xl"
              />
              <span className="truncate font-bold text-totoro-gray">
                {user.displayName || t('admin.users.noName')}
              </span>
            </div>
            <div className="shrink-0">{renderAction(user.uid)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
