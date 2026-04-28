'use client';
import { ChatMessage } from '@/types/social';
import { socialService } from '@/services/socialService';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useChat(friendId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = socialService.subscribeToMessages(friendId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    socialService.markChatRead(friendId).catch(() => {});

    return () => unsubscribe();
  }, [friendId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await socialService.sendMessage(friendId, content);
    },
    [friendId]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    error,
    newMessage,
    setNewMessage,
    messagesEndRef,
    handleSend
  };
}
