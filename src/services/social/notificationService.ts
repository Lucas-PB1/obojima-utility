import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { db, firebaseConfig, getClientMessaging } from '@/config/firebase';
import { authService } from '@/services/authService';
import { SocialNotification } from '@/types/social';
import { logger } from '@/utils/logger';
import { getDevUserId, isDevMode, setDevState, subscribeDevState } from '@/features/dev-mode';

export type PushSetupStatus =
  | 'checking'
  | 'unsupported'
  | 'missing-config'
  | 'permission-required'
  | 'denied'
  | 'ready'
  | 'error';

const PUSH_TOKEN_REGISTERED_KEY = 'obojima:fcmTokenRegistered';

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

async function requestJson(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authService.getAuthorizationHeaders()),
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Falha na ação social');
  }

  return data;
}

function getServiceWorkerUrl(): string {
  const params = new URLSearchParams();

  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return `/firebase-messaging-sw.js?${params.toString()}`;
}

export class NotificationService {
  subscribeToNotifications(callback: (notifications: SocialNotification[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.notificationsByUser[userId] || []));
    }

    const userId = authService.getUserId();
    if (!userId) return () => {};

    const q = query(
      collection(db, `users/${userId}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt)
          } as SocialNotification;
        });
        callback(notifications);
      },
      (error) => {
        logger.error('Error subscribing to notifications:', error);
        callback([]);
      }
    );
  }

  async getPushStatus(): Promise<PushSetupStatus> {
    if (isDevMode()) return 'ready';

    if (typeof window === 'undefined') return 'unsupported';
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return 'missing-config';
    if (Notification.permission === 'denied') return 'denied';
    if (Notification.permission !== 'granted') return 'permission-required';
    if (localStorage.getItem(PUSH_TOKEN_REGISTERED_KEY) !== 'true') return 'permission-required';

    const messaging = await getClientMessaging();
    return messaging ? 'ready' : 'unsupported';
  }

  async registerPushNotifications(): Promise<string> {
    if (isDevMode()) return 'dev-push-token';

    const status = await this.getPushStatus();

    if (status === 'permission-required') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permissão de push não concedida');
    } else if (status !== 'ready') {
      throw new Error(`Push indisponível: ${status}`);
    }

    const messaging = await getClientMessaging();
    if (!messaging) throw new Error('Firebase Messaging indisponível');

    const registration = await navigator.serviceWorker.register(getServiceWorkerUrl());
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) throw new Error('Token de push não gerado');

    await requestJson('/api/social/fcm-tokens', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    localStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, 'true');

    onMessage(messaging, (payload) => {
      logger.info('Notificação social recebida:', payload);
    });

    return token;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        notificationsByUser: {
          ...state.notificationsByUser,
          [userId]: (state.notificationsByUser[userId] || []).map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        }
      }));
      return;
    }

    await requestJson(`/api/social/notifications/${notificationId}`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        notificationsByUser: {
          ...state.notificationsByUser,
          [userId]: (state.notificationsByUser[userId] || []).map((notification) => ({
            ...notification,
            read: true
          }))
        }
      }));
      return;
    }

    await requestJson('/api/social/notifications', {
      method: 'PATCH'
    });
  }
}
