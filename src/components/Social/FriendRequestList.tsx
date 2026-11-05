import React from 'react';
import { Inbox, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { FriendRequest } from '@/types/social';
import { socialService } from '@/services/socialService';
import { Button, UserAvatar } from '@/components/ui';
import { formatRelative } from '@/lib/formatDate';

interface FriendRequestListProps {
  requests: FriendRequest[];
  sentRequests: FriendRequest[];
}

export function FriendRequestList({ requests, sentRequests }: FriendRequestListProps) {
  const { t, language } = useTranslation();
  const [loadingMap, setLoadingMap] = React.useState<Record<string, boolean>>({});
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const run = async (requestId: string, action: () => Promise<void>) => {
    setLoadingMap((prev) => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      await action();
      setRejectId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('social.error.generic'));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRespond = (requestId: string, accept: boolean) => {
    if (!accept && rejectId !== requestId) {
      setRejectId(requestId);
      return;
    }
    void run(requestId, () => socialService.respondToFriendRequest(requestId, accept));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-100/80 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-totoro-blue/70">
          <Inbox className="h-4 w-4" />
          {t('social.requests.received')}
          {requests.length > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] tracking-normal text-white">
              {requests.length}
            </span>
          )}
        </h3>
        {requests.length === 0 ? (
          <p className="rounded-lg bg-white/5 p-4 text-sm text-totoro-gray/50 shadow-[inset_0_0_0_1px_var(--hairline)]">
            {t('social.requests.empty')}
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  src={req.fromUserPhotoURL}
                  name={req.fromUserName}
                  className="h-11 w-11 shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-totoro-gray">{req.fromUserName}</p>
                  <p className="text-xs text-totoro-gray/50">
                    {t('social.requests.wantsToBeFriend')} ·{' '}
                    {formatRelative(req.createdAt, language)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {rejectId === req.id ? (
                  <>
                    <span className="mr-1 text-xs font-bold text-red-500">
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
                      variant="ghost"
                      onClick={() => handleRespond(req.id, false)}
                      disabled={loadingMap[req.id]}
                    >
                      {t('social.requests.reject')}
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleRespond(req.id, true)}
                      disabled={loadingMap[req.id]}
                    >
                      {loadingMap[req.id] ? '...' : t('social.requests.accept')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-totoro-blue/70">
          <Send className="h-4 w-4" />
          {t('social.requests.sent')}
        </h3>
        {sentRequests.length === 0 ? (
          <p className="rounded-lg bg-white/5 p-4 text-sm text-totoro-gray/50 shadow-[inset_0_0_0_1px_var(--hairline)]">
            {t('social.requests.sentEmpty')}
          </p>
        ) : (
          sentRequests.map((req) => (
            <div key={req.id} className="glass-panel flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  src={req.toUserPhotoURL}
                  name={req.toUserName}
                  className="h-10 w-10 shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-totoro-gray">
                    {req.toUserName || t('admin.users.noName')}
                  </p>
                  <p className="text-xs text-totoro-gray/50">
                    {t('social.requests.waiting')} · {formatRelative(req.createdAt, language)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void run(req.id, () => socialService.cancelFriendRequest(req.id))}
                disabled={loadingMap[req.id]}
              >
                {loadingMap[req.id] ? '...' : t('social.requests.cancel')}
              </Button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
