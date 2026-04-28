import React from 'react';
import { ShieldBan } from 'lucide-react';
import { BlockedUser } from '@/types/social';
import { Button, UserAvatar } from '@/components/ui';
import { socialService } from '@/services/socialService';
import { useTranslation } from '@/hooks/useTranslation';

interface BlockedUsersListProps {
  blockedUsers: BlockedUser[];
}

export function BlockedUsersList({ blockedUsers }: BlockedUsersListProps) {
  const { t } = useTranslation();

  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-10 text-totoro-gray/50">
        <ShieldBan className="mx-auto mb-3 h-8 w-8 opacity-50" />
        <p>{t('social.blocked.empty')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {blockedUsers.map((blockedUser) => (
        <div key={blockedUser.id} className="glass-panel flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={blockedUser.photoURL}
              name={blockedUser.displayName}
              className="h-11 w-11"
            />
            <div>
              <p className="font-bold text-totoro-gray">{blockedUser.displayName}</p>
              <p className="text-xs text-totoro-gray/50">
                {t('social.blocked.since')} {blockedUser.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => socialService.unblockUser(blockedUser.blockedUserId)}
          >
            {t('social.blocked.unblock')}
          </Button>
        </div>
      ))}
    </div>
  );
}
