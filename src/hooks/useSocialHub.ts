'use client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { socialService } from '@/services/socialService';
import { Friend, FriendRequest, SocialTab } from '@/types/social';
import { e2eFriends, e2eRequests, isE2EMode } from '@/lib/e2e/mockData';

export function useSocialHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [friends, setFriends] = useState<Friend[]>(isE2EMode() ? e2eFriends : []);
  const [requests, setRequests] = useState<FriendRequest[]>(isE2EMode() ? e2eRequests : []);
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isE2EMode()) return;

    const unsubscribeFriends = socialService.subscribeToFriends(setFriends);
    const unsubscribeRequests = socialService.subscribeToFriendRequests(setRequests);

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [user]);

  const handleStartChat = (friend: Friend) => {
    setActiveChatFriend(friend);
    setActiveTab('chat');
  };

  return {
    activeTab,
    setActiveTab,
    friends,
    requests,
    activeChatFriend,
    handleStartChat,
    user
  };
}
