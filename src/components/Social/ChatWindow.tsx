import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend, ChatMessage } from '@/types/social';
import { socialService } from '@/services/socialService';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
}

export default function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = authService.getUserId();

  useEffect(() => {
    const unsubscribe = socialService.subscribeToMessages(friend.userId, setMessages);
    return () => unsubscribe();
  }, [friend.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await socialService.sendMessage(friend.userId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] glass-panel p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 p-4 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-totoro-blue/20 flex items-center justify-center text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {friend.photoURL ? (
              <img src={friend.photoURL} alt={friend.displayName} className="rounded-full" />
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
        {messages.map((msg) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                           max-w-[70%] px-4 py-2 rounded-2xl text-sm
                           ${isMe ? 'bg-totoro-blue text-white rounded-br-none' : 'bg-white shadow-sm text-totoro-gray rounded-bl-none'}
                       `}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white/40 border-t border-white/20 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('social.chat.placeholder')}
          className="flex-1 bg-white border border-totoro-blue/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-totoro-blue"
        />
        <Button type="submit" disabled={!newMessage.trim()}>
          {t('social.chat.send')}
        </Button>
      </form>
    </div>
  );
}
