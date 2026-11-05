import React from 'react';
import { ArrowLeft, Loader2, MessageCircleHeart, SendHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import { authService } from '@/services/authService';
import { UserAvatar } from '@/components/ui';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from '@/components/Social';
import { formatDayLabel, isSameCalendarDay } from '@/lib/formatDate';
import { MAX_SOCIAL_MESSAGE_LENGTH } from '@/features/social/domain/socialRules';

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
}

export function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const { t, language } = useTranslation();
  const {
    messages,
    loading,
    sending,
    error,
    newMessage,
    setNewMessage,
    scrollContainerRef,
    handleSend
  } = useChat(friend.userId);
  const myId = authService.getUserId();
  const canSend = newMessage.trim().length > 0 && !sending;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-17rem)] min-h-[360px] max-w-3xl flex-col overflow-hidden rounded-lg glass-panel p-0 shadow-[var(--shadow-raised)] md:h-[640px]">
      <div className="flex items-center gap-3 px-3 py-3 subtle-divider-bottom sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-totoro-gray transition hover:bg-totoro-blue/10 hover:text-totoro-blue"
          aria-label={t('social.chat.back')}
          title={t('social.chat.back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative shrink-0">
          <UserAvatar
            src={friend.photoURL}
            name={friend.displayName}
            className="h-10 w-10 bg-totoro-blue/15"
            fallbackClassName="text-base"
          />
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-[color:var(--surface-raised)] ${
              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-bold leading-tight text-totoro-gray">
            {friend.displayName}
          </h3>
          <p className="text-xs text-totoro-gray/60">
            {t(`social.friends.status.${friend.status}`)}
          </p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
        aria-live="polite"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-totoro-gray/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-totoro-gray/60">
            <MessageCircleHeart className="h-10 w-10 text-totoro-blue/50" />
            <p className="max-w-xs text-sm">
              {t('social.chat.empty').replace('{name}', friend.displayName)}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const showDay = !previous || !isSameCalendarDay(previous.timestamp, message.timestamp);
            return (
              <React.Fragment key={message.id}>
                {showDay && (
                  <div className="flex justify-center py-1">
                    <span className="rounded-full bg-totoro-blue/10 px-3 py-1 text-[11px] font-bold text-totoro-blue/80">
                      {formatDayLabel(message.timestamp, language)}
                    </span>
                  </div>
                )}
                <MessageBubble message={message} isMe={message.senderId === myId} />
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className="px-3 pb-3 pt-2 subtle-divider-top sm:px-4">
        {error && <p className="mb-2 text-sm font-bold text-red-600">{error}</p>}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('social.chat.placeholder')}
            aria-label={t('social.chat.placeholder')}
            maxLength={MAX_SOCIAL_MESSAGE_LENGTH}
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg bg-[var(--input-bg)] px-4 py-2.5 text-sm text-totoro-gray shadow-[inset_0_0_0_1px_var(--hairline)] placeholder:text-totoro-gray/40 focus:outline-none focus:ring-2 focus:ring-totoro-blue/30"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={t('social.chat.send')}
            title={t('social.chat.send')}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-totoro-blue px-4 font-bold text-white shadow-[var(--shadow-soft)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{t('social.chat.send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
