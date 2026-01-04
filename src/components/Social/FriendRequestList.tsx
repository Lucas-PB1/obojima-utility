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
  const [loadingMap, setLoadingMap] = React.useState<Record<string, boolean>>({});
  const [rejectId, setRejectId] = React.useState<string | null>(null);

  const handleRespond = async (requestId: string, accept: boolean) => {
    if (!accept && rejectId !== requestId) {
      setRejectId(requestId);
      return;
    }

    setLoadingMap((prev) => ({ ...prev, [requestId]: true }));
    try {
      await socialService.respondToFriendRequest(requestId, accept);
      setRejectId(null);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [requestId]: false }));
    }
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
          <div className="flex gap-2 items-center">
            {rejectId === req.id ? (
              <>
                <span className="text-xs text-red-500 font-bold mr-2">
                  {t('social.requests.confirmReject')}
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleRespond(req.id, false)}
                  disabled={loadingMap[req.id]}
                >
                  {loadingMap[req.id] ? '...' : t('common.confirm')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => handleRespond(req.id, true)}
                  disabled={loadingMap[req.id]}
                >
                  {loadingMap[req.id] ? '...' : t('social.requests.accept')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRespond(req.id, false)}
                  disabled={loadingMap[req.id]}
                >
                  {t('social.requests.reject')}
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
