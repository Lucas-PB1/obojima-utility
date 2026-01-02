import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import MessageBubble from '@/components/Social/MessageBubble';

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
}

export default function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const { t } = useTranslation();
  const { messages, newMessage, setNewMessage, messagesEndRef, handleSend } = useChat(friend.userId);
  const myId = authService.getUserId();

  return (
    <div className="flex flex-col h-[500px] glass-panel p-0 overflow-hidden">
      <div className="bg-white/10 p-4 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-totoro-blue/20 flex items-center justify-center text-sm">
            {friend.photoURL ? (
              <Image 
                src={friend.photoURL} 
                alt={friend.displayName} 
                width={32}
                height={32}
                className="rounded-full" 
              />
            ) : (
              '👤'
            )}
          </div>
          <span className="font-bold text-totoro-gray">{friend.displayName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
        {messages.map((msg) => {
          const isMe = msg.senderId === myId;
          return (
            <MessageBubble key={msg.id} message={msg} isMe={isMe} />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/40 border-t border-white/20 flex gap-2">
        <Input
          value={newMessage}
          onChange={(val) => setNewMessage(String(val))}
          placeholder={t('social.chat.placeholder')}
          className="flex-1"
        />
        <Button type="submit" disabled={!newMessage.trim()}>
          {t('social.chat.send')}
        </Button>
      </form>
    </div>
  );
}
