import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FriendRequest } from '@/types/social';
import { socialService } from '@/services/socialService';
import { Button } from '@/components/ui';

interface FriendRequestListProps {
  requests: FriendRequest[];
}

export function FriendRequestList({ requests }: FriendRequestListProps) {
  const { t } = useTranslation();

  const handleRespond = async (requestId: string, accept: boolean) => {
    await socialService.respondToFriendRequest(requestId, accept);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {requests.length === 0 && (
        <div className="text-center py-10 opacity-50">
          <p>{t('social.requests.empty')}</p>
        </div>
      )}

      {requests.map((req) => (
        <div key={req.id} className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-totoro-gray">{req.fromUserName}</p>
            <p className="text-xs text-totoro-blue/50">{req.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleRespond(req.id, true)}>
              {t('social.requests.accept')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleRespond(req.id, false)}>
              {t('social.requests.reject')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
