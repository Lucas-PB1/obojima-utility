import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { SocialNotification } from '@/types/social';
import { Button } from '@/components/ui';
import { socialService } from '@/services/socialService';
import { useTranslation } from '@/hooks/useTranslation';

interface NotificationListProps {
  notifications: SocialNotification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const { t } = useTranslation();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAllRead = async () => {
    await socialService.markAllNotificationsRead();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-totoro-blue/60">
          {t('social.notifications.title')}
        </h3>
        <Button size="sm" variant="ghost" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4" />
          {t('social.notifications.markAllRead')}
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-totoro-gray/50">
          <Bell className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p>{t('social.notifications.empty')}</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => socialService.markNotificationRead(notification.id)}
            className={`glass-panel w-full p-4 text-left transition hover:shadow-[var(--shadow-raised)] ${
              notification.read ? 'opacity-70' : 'ring-1 ring-inset ring-totoro-blue/30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-totoro-gray">{notification.title}</p>
                <p className="text-sm text-totoro-gray/70">{notification.body}</p>
              </div>
              <span className="text-xs text-totoro-gray/40">
                {notification.createdAt.toLocaleDateString()}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
