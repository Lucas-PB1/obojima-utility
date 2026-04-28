import React from 'react';
import { Bell, MessageCircle, Search, ShieldBan, UserRoundCheck, UsersRound } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SocialTab } from '@/types/social';
import {
  BlockedUsersList,
  ChatWindow,
  ConversationList,
  FriendList,
  FriendRequestList,
  NotificationList,
  PushNotificationGate,
  UserSearch
} from '@/components/Social';
import { useSocialHub } from '@/hooks/useSocialHub';

const tabs: Array<{ id: SocialTab; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'friends', icon: UsersRound },
  { id: 'chats', icon: MessageCircle },
  { id: 'search', icon: Search },
  { id: 'requests', icon: UserRoundCheck },
  { id: 'notifications', icon: Bell },
  { id: 'blocked', icon: ShieldBan }
];

export function SocialHub() {
  const { t } = useTranslation();
  const {
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
    handleStartChat
  } = useSocialHub();

  if (pushStatus !== 'ready' && activeTab !== 'chat') {
    return (
      <PushNotificationGate
        status={pushStatus}
        error={pushError}
        loading={pushLoading}
        onEnable={handleEnablePush}
      />
    );
  }

  const renderContent = () => {
    if (activeTab === 'chat' && activeChatFriend) {
      return <ChatWindow friend={activeChatFriend} onClose={() => setActiveTab('chats')} />;
    }

    switch (activeTab) {
      case 'friends':
        return <FriendList friends={friends} onChat={handleStartChat} />;
      case 'chats':
        return <ConversationList conversations={conversations} onChat={handleStartChat} />;
      case 'search':
        return <UserSearch />;
      case 'requests':
        return <FriendRequestList requests={requests} sentRequests={sentRequests} />;
      case 'notifications':
        return <NotificationList notifications={notifications} />;
      case 'blocked':
        return <BlockedUsersList blockedUsers={blockedUsers} />;
      default:
        return null;
    }
  };

  const getBadge = (tab: SocialTab) => {
    if (tab === 'requests') return requests.length;
    if (tab === 'notifications') return unreadNotifications;
    if (tab === 'chats') return unreadChats;
    return 0;
  };

  return (
    <div className="space-y-6">
      {activeTab !== 'chat' && (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-2 rounded-lg bg-white/5 p-1 sm:grid-cols-3 lg:grid-cols-6">
          {tabs.map(({ id, icon: Icon }) => {
            const badge = getBadge(id);
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  relative flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all
                  ${
                    activeTab === id
                      ? 'bg-totoro-blue text-white shadow-md'
                      : 'text-totoro-gray/60 hover:bg-white/10 hover:text-totoro-blue'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{t(`social.tabs.${id}`)}</span>
                {badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  );
}
