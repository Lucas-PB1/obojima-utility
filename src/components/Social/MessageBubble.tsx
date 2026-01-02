import React from 'react';
import { ChatMessage } from '@/types/social';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] px-4 py-2 rounded-2xl text-sm
          ${isMe 
            ? "bg-totoro-blue text-white rounded-br-none" 
            : "bg-white shadow-sm text-totoro-gray rounded-bl-none"
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
}
