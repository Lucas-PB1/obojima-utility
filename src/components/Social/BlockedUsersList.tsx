import React from 'react';
import { ShieldBan } from 'lucide-react';
import { BlockedUser } from '@/types/social';
import { Button, UserAvatar } from '@/components/ui';
import { socialService } from '@/services/socialService';
import { useTranslation } from '@/hooks/useTranslation';
import { getLocale } from '@/lib/formatDate';

interface BlockedUsersListProps {
  blockedUsers: BlockedUser[];
}

export function BlockedUsersList({ blockedUsers }: BlockedUsersListProps) {
  const { t, language } = useTranslation();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleUnblock = async (blockedUserId: string) => {
    setLoadingId(blockedUserId);
    setError(null);
    try {
      await socialService.unblockUser(blockedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('social.error.generic'));
    } finally {
      setLoadingId(null);
    }
  };

  if (blockedUsers.length === 0) {
    return (
      <div className="py-10 text-center text-totoro-gray/50">
        <ShieldBan className="mx-auto mb-3 h-8 w-8 opacity-50" />
        <p>{t('social.blocked.empty')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {error && (
        <div className="rounded-lg bg-red-100/80 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      {blockedUsers.map((blockedUser) => (
        <div
          key={blockedUser.id}
          className="glass-panel flex items-center justify-between gap-3 p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              src={blockedUser.photoURL}
              name={blockedUser.displayName}
              className="h-11 w-11 shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate font-bold text-totoro-gray">{blockedUser.displayName}</p>
              <p className="text-xs text-totoro-gray/50">
                {t('social.blocked.since')}{' '}
                {blockedUser.createdAt.toLocaleDateString(getLocale(language))}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUnblock(blockedUser.blockedUserId)}
            disabled={loadingId === blockedUser.blockedUserId}
          >
            {loadingId === blockedUser.blockedUserId ? '...' : t('social.blocked.unblock')}
          </Button>
        </div>
      ))}
    </div>
  );
}
