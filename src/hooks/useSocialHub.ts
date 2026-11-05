'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocialData } from '@/contexts/SocialContext';
import { socialService } from '@/services/socialService';
import { Friend, SocialNotification, SocialTab } from '@/types/social';
import { isE2EMode } from '@/lib/e2e/mockData';
import { PushSetupStatus } from '@/services/social/notificationService';

const PUSH_DISMISSED_KEY = 'obojima:pushPromptDismissed';

function readPushDismissed(): boolean {
  try {
    return window.localStorage.getItem(PUSH_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useSocialHub() {
  const { user } = useAuth();
  const social = useSocialData();
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [chatReturnTab, setChatReturnTab] = useState<SocialTab>('friends');
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [pushStatus, setPushStatus] = useState<PushSetupStatus>(isE2EMode() ? 'ready' : 'checking');
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(false);

  useEffect(() => {
    setPushDismissed(readPushDismissed());
  }, []);

  useEffect(() => {
    if (!user) return;
    let disposed = false;
    socialService
      .getPushStatus()
      .then((status) => {
        if (!disposed) setPushStatus(status);
      })
      .catch(() => {
        if (!disposed) setPushStatus('unsupported');
      });
    return () => {
      disposed = true;
    };
  }, [user]);

  const handleEnablePush = async () => {
    setPushLoading(true);
    setPushError(null);
    try {
      await socialService.registerPushNotifications();
      setPushStatus(await socialService.getPushStatus());
    } catch (error) {
      setPushStatus('error');
      setPushError(error instanceof Error ? error.message : 'Erro ao ativar push');
    } finally {
      setPushLoading(false);
    }
  };

  const dismissPush = () => {
    setPushDismissed(true);
    try {
      window.localStorage.setItem(PUSH_DISMISSED_KEY, 'true');
    } catch {
      // Storage unavailable (private mode); the prompt simply returns next visit.
    }
  };

  const handleStartChat = useCallback(
    (friend: Friend) => {
      setChatReturnTab(activeTab === 'chat' ? 'chats' : activeTab);
      setActiveChatFriend(friend);
      setActiveTab('chat');
    },
    [activeTab]
  );

  const handleCloseChat = useCallback(() => {
    setActiveChatFriend(null);
    setActiveTab(chatReturnTab);
  }, [chatReturnTab]);

  /** Opens whatever a notification is about, then marks it as read. */
  const handleOpenNotification = useCallback(
    (notification: SocialNotification) => {
      if (!notification.read) {
        socialService.markNotificationRead(notification.id).catch(() => {});
      }

      if (notification.type === 'friend_request') {
        setActiveTab('requests');
        return;
      }

      if (notification.type === 'message' && notification.actorId) {
        const friend =
          social.friends.find((item) => item.userId === notification.actorId) ||
          social.conversations.find((item) => item.friend.userId === notification.actorId)?.friend;
        if (friend) {
          setChatReturnTab('notifications');
          setActiveChatFriend(friend);
          setActiveTab('chat');
          return;
        }
        setActiveTab('chats');
        return;
      }

      if (notification.type === 'friend_accepted') setActiveTab('friends');
    },
    [social.friends, social.conversations]
  );

  // Hide the prompt where it can never succeed (no browser support or no VAPID key)
  // and once the player dismisses it.
  const showPushPrompt =
    activeTab !== 'chat' &&
    !pushDismissed &&
    (pushStatus === 'permission-required' || pushStatus === 'error');

  return {
    ...social,
    activeTab,
    setActiveTab,
    activeChatFriend,
    pushStatus,
    pushError,
    pushLoading,
    showPushPrompt,
    handleEnablePush,
    dismissPush,
    handleStartChat,
    handleCloseChat,
    handleOpenNotification,
    user
  };
}
