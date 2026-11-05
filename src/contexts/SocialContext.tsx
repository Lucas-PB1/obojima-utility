'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { socialService } from '@/services/socialService';
import {
  BlockedUser,
  ChatConversation,
  Friend,
  FriendRequest,
  SocialNotification
} from '@/types/social';
import { e2eFriends, e2eRequests, isE2EMode } from '@/lib/e2e/mockData';

interface SocialData {
  friends: Friend[];
  requests: FriendRequest[];
  sentRequests: FriendRequest[];
  conversations: ChatConversation[];
  notifications: SocialNotification[];
  blockedUsers: BlockedUser[];
  unreadNotifications: number;
  unreadChats: number;
  /** Everything that needs the player's attention in the social area. */
  attentionCount: number;
  onlineFriends: number;
}

const SocialContext = createContext<SocialData | null>(null);

/**
 * Keeps one set of realtime social subscriptions for the whole app shell, so the
 * navigation badge, the progression system and the Social Hub share the same data.
 */
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>(isE2EMode() ? e2eFriends : []);
  const [requests, setRequests] = useState<FriendRequest[]>(isE2EMode() ? e2eRequests : []);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribers = [
      socialService.subscribeToFriends(setFriends),
      socialService.subscribeToFriendRequests(setRequests),
      socialService.subscribeToSentFriendRequests(setSentRequests),
      socialService.subscribeToConversations(setConversations),
      socialService.subscribeToNotifications(setNotifications),
      socialService.subscribeToBlockedUsers(setBlockedUsers)
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user]);

  const value = useMemo<SocialData>(() => {
    const unreadNotifications = notifications.filter((notification) => !notification.read).length;
    const unreadChats = conversations.reduce(
      (total, conversation) => total + conversation.unreadCount,
      0
    );

    return {
      friends,
      requests,
      sentRequests,
      conversations,
      notifications,
      blockedUsers,
      unreadNotifications,
      unreadChats,
      // Message and friend-request notifications are already counted by the chat
      // unread counters and the pending request list, so don't count them twice.
      attentionCount:
        requests.length +
        unreadChats +
        notifications.filter(
          (notification) =>
            !notification.read &&
            notification.type !== 'message' &&
            notification.type !== 'friend_request'
        ).length,
      onlineFriends: friends.filter((friend) => friend.status === 'online').length
    };
  }, [friends, requests, sentRequests, conversations, notifications, blockedUsers]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocialData(): SocialData {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocialData must be used inside <SocialProvider>');
  return context;
}
