import React from 'react';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { ChatConversation, Friend } from '@/types/social';
import { UserAvatar } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/authService';
import { formatRelative } from '@/lib/formatDate';

interface ConversationListProps {
  conversations: ChatConversation[];
  onChat: (friend: Friend) => void;
}

export function ConversationList({ conversations, onChat }: ConversationListProps) {
  const { t, language } = useTranslation();
  const myId = authService.getUserId();

  if (conversations.length === 0) {
    return (
      <div className="py-10 text-center text-totoro-gray/50">
        <MessageCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
        <p>{t('social.chats.empty')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      {conversations.map((conversation) => {
        const unread = conversation.unreadCount > 0;
        const last = conversation.lastMessage;
        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onChat(conversation.friend)}
            aria-label={`${t('social.chat.open')}: ${conversation.friend.displayName}`}
            className={`glass-panel flex w-full items-center gap-3 p-3 text-left transition hover:shadow-[var(--shadow-raised)] sm:p-4 ${
              unread ? 'ring-1 ring-inset ring-totoro-blue/30' : ''
            }`}
          >
            <div className="relative shrink-0">
              <UserAvatar
                src={conversation.friend.photoURL}
                name={conversation.friend.displayName}
                className="h-12 w-12"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-[color:var(--surface-raised)] ${
                  conversation.friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={`truncate text-totoro-gray ${unread ? 'font-black' : 'font-bold'}`}>
                  {conversation.friend.displayName}
                </h3>
                {last && (
                  <span className="shrink-0 text-[11px] text-totoro-gray/50">
                    {formatRelative(last.timestamp, language)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`truncate text-sm ${unread ? 'font-semibold text-totoro-gray' : 'text-totoro-gray/60'}`}
                >
                  {last
                    ? `${last.senderId === myId ? `${t('social.chats.you')}: ` : ''}${last.content}`
                    : t('social.chats.noMessages')}
                </p>
                {unread ? (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                    {conversation.unreadCount}
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-totoro-gray/30" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
