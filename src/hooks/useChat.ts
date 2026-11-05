'use client';
import { ChatMessage } from '@/types/social';
import { socialService } from '@/services/socialService';
import { authService } from '@/services/authService';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useChat(friendId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastIncomingIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    lastIncomingIdRef.current = null;
    const unsubscribe = socialService.subscribeToMessages(friendId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [friendId]);

  // Mark as read on open and whenever a new message from the friend arrives while
  // the chat is open; otherwise the unread badge keeps growing during a conversation.
  useEffect(() => {
    const myId = authService.getUserId();
    const lastIncoming = [...messages].reverse().find((message) => message.senderId !== myId);
    const marker = lastIncoming?.id || 'open';
    if (lastIncomingIdRef.current === marker) return;
    lastIncomingIdRef.current = marker;
    socialService.markChatRead(friendId).catch(() => {});
  }, [friendId, messages]);

  // Scroll only the message list. scrollIntoView() scrolled the whole page on
  // mobile and pushed the chat header off screen.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await socialService.sendMessage(friendId, content.trim());
    },
    [friendId]
  );

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    const draft = newMessage;
    setSending(true);
    setError(null);
    setNewMessage('');
    try {
      await sendMessage(draft);
    } catch (error) {
      setNewMessage(draft);
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
    scrollContainerRef,
    handleSend
  };
}
