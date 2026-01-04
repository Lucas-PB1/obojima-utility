import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import { authService } from '@/services/authService';
import { Button, Input } from '@/components/ui';
import { useChat } from '@/hooks/useChat';
import Image from 'next/image';
import { MessageBubble } from '@/components/Social';

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
}

export function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const { t } = useTranslation();
  const { messages, newMessage, setNewMessage, messagesEndRef, handleSend } = useChat(
    friend.userId
  );
  const myId = authService.getUserId();

  return (
    <div className="flex flex-col h-[600px] glass-panel p-0 overflow-hidden relative shadow-2xl border-white/20">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto duration-300">
          <div className="relative w-10 h-10 rounded-full bg-totoro-blue/20 flex items-center justify-center text-sm shadow-inner ring-2 ring-white/20 backdrop-blur-sm">
            {friend.photoURL ? (
              <Image
                src={friend.photoURL}
                alt={friend.displayName}
                width={40}
                height={40}
                className="rounded-full object-cover w-full h-full"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
            <h3 className="font-bold text-totoro-gray text-sm leading-tight">
              {friend.displayName}
            </h3>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 w-9 p-0 rounded-full bg-white/40 text-totoro-gray hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center backdrop-blur-md pointer-events-auto"
        >
          ✕
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-16 space-y-4 bg-gradient-to-b from-white/5 to-transparent scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isMe = msg.senderId === myId;
          return <MessageBubble key={msg.id} message={msg} isMe={isMe} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-b from-transparent to-white/10 backdrop-blur-[2px]">
        <form
          onSubmit={handleSend}
          className="glass-card p-2 rounded-2xl flex gap-2 items-center shadow-lg border-white/30 bg-white/40"
        >
          <Input
            value={newMessage}
            onChange={(val) => setNewMessage(String(val))}
            placeholder={t('social.chat.placeholder')}
            className="flex-1"
            inputClassName="bg-transparent border-none shadow-none focus:ring-0 placeholder:text-totoro-gray/40 text-totoro-gray h-10 p-0"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className={`
              rounded-xl h-10 px-6 font-bold shadow-md transition-all duration-300
              ${
                !newMessage.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-totoro-blue to-blue-400 text-white hover:scale-105 btn-shimmer'
              }
            `}
          >
            {t('social.chat.send')}
          </Button>
        </form>
      </div>
    </div>
  );
}
