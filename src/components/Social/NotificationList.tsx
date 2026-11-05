import React from 'react';
import {
  ArrowLeftRight,
  Bell,
  CheckCheck,
  Info,
  MessageCircle,
  UserPlus,
  UserRoundCheck
} from 'lucide-react';
import { SocialNotification, SocialNotificationType } from '@/types/social';
import { Button } from '@/components/ui';
import { socialService } from '@/services/socialService';
import { useTranslation } from '@/hooks/useTranslation';
import { formatRelative } from '@/lib/formatDate';

interface NotificationListProps {
  notifications: SocialNotification[];
  onOpen: (notification: SocialNotification) => void;
}

const ICONS: Record<SocialNotificationType, { icon: typeof Bell; className: string }> = {
  friend_request: { icon: UserPlus, className: 'bg-totoro-blue/15 text-totoro-blue' },
  friend_accepted: { icon: UserRoundCheck, className: 'bg-totoro-green/15 text-totoro-green' },
  message: { icon: MessageCircle, className: 'bg-totoro-blue/15 text-totoro-blue' },
  trade: { icon: ArrowLeftRight, className: 'bg-totoro-yellow/20 text-totoro-orange' },
  system: { icon: Info, className: 'bg-totoro-gray/10 text-totoro-gray' }
};

export function NotificationList({ notifications, onOpen }: NotificationListProps) {
  const { t, language } = useTranslation();
  const [marking, setMarking] = React.useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAllRead = async () => {
    setMarking(true);
    try {
      await socialService.markAllNotificationsRead();
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-totoro-blue/70">
          {t('social.notifications.title')}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={markAllRead}
          disabled={unreadCount === 0 || marking}
        >
          <CheckCheck className="h-4 w-4" />
          {t('social.notifications.markAllRead')}
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="py-10 text-center text-totoro-gray/50">
          <Bell className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p>{t('social.notifications.empty')}</p>
        </div>
      ) : (
        notifications.map((notification) => {
          const { icon: Icon, className } = ICONS[notification.type] || ICONS.system;
          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => onOpen(notification)}
              className={`glass-panel flex w-full items-start gap-3 p-4 text-left transition hover:shadow-[var(--shadow-raised)] ${
                notification.read ? 'opacity-70' : 'ring-1 ring-inset ring-totoro-blue/30'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${className}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-bold text-totoro-gray">{notification.title}</p>
                  <span className="shrink-0 text-[11px] text-totoro-gray/50">
                    {formatRelative(notification.createdAt, language)}
                  </span>
                </div>
                <p className="text-sm text-totoro-gray/70">{notification.body}</p>
              </div>
              {!notification.read && (
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-totoro-blue"
                  aria-label={t('social.notifications.unread')}
                />
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
