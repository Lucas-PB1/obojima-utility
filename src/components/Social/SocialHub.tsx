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
  { id: 'requests', icon: UserRoundCheck },
  { id: 'notifications', icon: Bell },
  { id: 'search', icon: Search },
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
    showPushPrompt,
    handleEnablePush,
    dismissPush,
    handleStartChat,
    handleCloseChat,
    handleOpenNotification
  } = useSocialHub();

  if (activeTab === 'chat' && activeChatFriend) {
    return <ChatWindow friend={activeChatFriend} onClose={handleCloseChat} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FriendList
            friends={friends}
            onChat={handleStartChat}
            onFindFriends={() => setActiveTab('search')}
          />
        );
      case 'chats':
        return <ConversationList conversations={conversations} onChat={handleStartChat} />;
      case 'search':
        return <UserSearch onChat={handleStartChat} />;
      case 'requests':
        return <FriendRequestList requests={requests} sentRequests={sentRequests} />;
      case 'notifications':
        return <NotificationList notifications={notifications} onOpen={handleOpenNotification} />;
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
    <div className="space-y-5">
      {showPushPrompt && (
        <PushNotificationGate
          status={pushStatus}
          error={pushError}
          loading={pushLoading}
          onEnable={handleEnablePush}
          onDismiss={dismissPush}
        />
      )}

      <div
        role="tablist"
        aria-label={t('social.title')}
        className="mx-auto flex w-full max-w-4xl gap-1 overflow-x-auto rounded-lg bg-totoro-blue/5 p-1 no-scrollbar shadow-[inset_0_0_0_1px_var(--hairline)]"
      >
        {tabs.map(({ id, icon: Icon }) => {
          const badge = getBadge(id);
          const active = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(id)}
              className={`relative flex shrink-0 grow items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                active
                  ? 'bg-totoro-blue text-white shadow-md'
                  : 'text-totoro-gray/60 hover:bg-totoro-blue/10 hover:text-totoro-blue'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(`social.tabs.${id}`)}</span>
              {badge > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    active ? 'bg-white text-totoro-blue' : 'bg-red-500 text-white'
                  }`}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-h-[360px]">
        {renderContent()}
      </div>
    </div>
  );
}
