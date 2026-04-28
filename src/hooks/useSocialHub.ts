'use client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useMemo } from 'react';
import { socialService } from '@/services/socialService';
import {
  BlockedUser,
  ChatConversation,
  Friend,
  FriendRequest,
  SocialNotification,
  SocialTab
} from '@/types/social';
import { e2eFriends, e2eRequests, isE2EMode } from '@/lib/e2e/mockData';
import { PushSetupStatus } from '@/services/social/notificationService';

export function useSocialHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [friends, setFriends] = useState<Friend[]>(isE2EMode() ? e2eFriends : []);
  const [requests, setRequests] = useState<FriendRequest[]>(isE2EMode() ? e2eRequests : []);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [pushStatus, setPushStatus] = useState<PushSetupStatus>(isE2EMode() ? 'ready' : 'checking');
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isE2EMode()) return;

    let disposed = false;
    socialService.getPushStatus().then((status) => {
      if (!disposed) setPushStatus(status);
    });

    const unsubscribeFriends = socialService.subscribeToFriends(setFriends);
    const unsubscribeRequests = socialService.subscribeToFriendRequests(setRequests);
    const unsubscribeSentRequests = socialService.subscribeToSentFriendRequests(setSentRequests);
    const unsubscribeConversations = socialService.subscribeToConversations(setConversations);
    const unsubscribeNotifications = socialService.subscribeToNotifications(setNotifications);
    const unsubscribeBlockedUsers = socialService.subscribeToBlockedUsers(setBlockedUsers);

    return () => {
      disposed = true;
      unsubscribeFriends();
      unsubscribeRequests();
      unsubscribeSentRequests();
      unsubscribeConversations();
      unsubscribeNotifications();
      unsubscribeBlockedUsers();
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

  const handleStartChat = (friend: Friend) => {
    setActiveChatFriend(friend);
    setActiveTab('chat');
  };

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );
  const unreadChats = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [conversations]
  );

  return {
    activeTab,
    setActiveTab,
    friends,
    requests,
    sentRequests,
    conversations,
    notifications,
    blockedUsers,
    activeChatFriend,
    unreadNotifications,
    unreadChats,
    pushStatus,
    pushError,
    pushLoading,
    handleEnablePush,
    handleStartChat,
    user
  };
}
