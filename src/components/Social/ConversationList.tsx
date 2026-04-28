import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatConversation, Friend } from '@/types/social';
import { Button, UserAvatar } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

interface ConversationListProps {
  conversations: ChatConversation[];
  onChat: (friend: Friend) => void;
}

export function ConversationList({ conversations, onChat }: ConversationListProps) {
  const { t } = useTranslation();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-10 text-totoro-gray/50">
        <MessageCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
        <p>{t('social.chats.empty')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="glass-panel w-full p-4 transition hover:scale-[1.01] hover:shadow-[var(--shadow-raised)]"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                src={conversation.friend.photoURL}
                name={conversation.friend.displayName}
                className="h-12 w-12 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold text-totoro-gray">
                    {conversation.friend.displayName}
                  </h3>
                  {conversation.unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-totoro-gray/60">
                  {conversation.lastMessage?.content || t('social.chats.noMessages')}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onChat(conversation.friend)}>
              {t('social.chat.open')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
