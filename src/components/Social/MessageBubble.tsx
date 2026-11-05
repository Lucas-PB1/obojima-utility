import React from 'react';
import { ChatMessage } from '@/types/social';
import { useTranslation } from '@/hooks/useTranslation';
import { formatTime } from '@/lib/formatDate';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const { language } = useTranslation();

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[70%] ${isMe ? 'items-end' : ''}`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-lg px-4 py-2.5 text-sm shadow-[var(--shadow-soft)] ${
            isMe
              ? 'rounded-br-none bg-totoro-blue text-white'
              : 'rounded-bl-none bg-[var(--surface-raised)] text-totoro-gray ring-1 ring-inset ring-[color:var(--hairline)]'
          }`}
        >
          {message.content}
        </div>
        <span className="px-1 text-[10px] text-totoro-gray/50">
          {formatTime(message.timestamp, language)}
        </span>
      </div>
    </div>
  );
}
