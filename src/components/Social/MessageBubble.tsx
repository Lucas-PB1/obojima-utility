import React from 'react';
import { ChatMessage } from '@/types/social';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          className={`
            px-5 py-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm
            ${
              isMe
                ? 'bg-gradient-to-br from-totoro-blue to-blue-500 text-white rounded-br-none border border-blue-400/30'
                : 'bg-white/80 text-totoro-gray rounded-bl-none border border-white/50 glass-card'
            }
          `}
        >
          {message.content}
        </div>
        <span
          className={`text-[10px] opacity-60 px-1 ${
            isMe ? 'text-right text-totoro-gray/80' : 'text-left text-totoro-gray/80'
          }`}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}
