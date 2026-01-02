import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { socialService } from '@/services/socialService';
import { Friend, FriendRequest } from '@/types/social';
import UserSearch from '@/components/Social/UserSearch';
import FriendList from '@/components/Social/FriendList';
import FriendRequestList from '@/components/Social/FriendRequestList';
import ChatWindow from '@/components/Social/ChatWindow';

type SocialTab = 'friends' | 'search' | 'requests' | 'chat';

export default function SocialHub() {
  const { t } = useTranslation();
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
  }, [user]);

  const handleStartChat = (friend: Friend) => {
    setActiveChatFriend(friend);
    setActiveTab('chat');
  };

  const renderContent = () => {
    if (activeTab === 'chat' && activeChatFriend) {
      return <ChatWindow friend={activeChatFriend} onClose={() => setActiveTab('friends')} />;
    }

    switch (activeTab) {
      case 'friends':
        return <FriendList friends={friends} onChat={handleStartChat} />;
      case 'search':
        return <UserSearch />;
      case 'requests':
        return <FriendRequestList requests={requests} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Tabs */}
      {activeTab !== 'chat' && (
        <div className="flex space-x-2 bg-white/5 p-1 rounded-xl w-fit mx-auto">
          {(['friends', 'search', 'requests'] as SocialTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                   px-4 py-2 rounded-lg text-sm font-bold transition-all
                   ${
                     activeTab === tab
                       ? 'bg-totoro-blue text-white shadow-md'
                       : 'text-totoro-gray/60 hover:text-totoro-blue hover:bg-white/10'
                   }
                 `}
            >
              <span className="relative">
                {t(`social.tabs.${tab}`)}
                {tab === 'requests' && requests.length > 0 && (
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  );
}
