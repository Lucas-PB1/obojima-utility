import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { socialService } from '@/services/socialService';
import { Friend, FriendRequest, SocialTab } from '@/types/social';

export function useSocialHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribeFriends = socialService.subscribeToFriends(setFriends);
    const unsubscribeRequests = socialService.subscribeToFriendRequests(setRequests);

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [user?.uid]);

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
