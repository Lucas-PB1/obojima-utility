import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getChatId } from '@/features/social/domain/socialRules';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { ChatConversation, ChatMessage, Friend } from '@/types/social';
import {
  createDevId,
  getDevState,
  getDevUserId,
  isDevMode,
  setDevState,
  subscribeDevState
} from '@/features/dev-mode';

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

async function requestJson(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authService.getAuthorizationHeaders()),
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Falha na ação social');
  }

  return data;
}

export class ChatService {
  private getUserId(): string | null {
    return authService.getUserId();
  }

  subscribeToConversations(callback: (conversations: ChatConversation[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.conversationsByUser[userId] || []));
    }

    const userId = this.getUserId();
    if (!userId) return () => {};

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));

    return onSnapshot(
      q,
      async (snapshot) => {
        const rows = snapshot.docs.map((doc) => {
          const data = doc.data();
          const friendId = data.participants.find((participant: string) => participant !== userId);
          return {
            id: doc.id,
            friendId,
            participants: data.participants as string[],
            updatedAt: toDate(data.updatedAt),
            lastMessage: data.lastMessage
              ? {
                  content: data.lastMessage.content,
                  senderId: data.lastMessage.senderId,
                  timestamp: toDate(data.lastMessage.timestamp)
                }
              : null,
            unreadCount: Number(data.unreadCounts?.[userId] || 0)
          };
        });

        if (rows.length === 0) {
          callback([]);
          return;
        }

        const friendIds = rows.map((row) => row.friendId).filter(Boolean);
        const publicProfilesMap = new Map<string, Record<string, unknown>>();

        for (let i = 0; i < friendIds.length; i += 10) {
          const chunk = friendIds.slice(i, i + 10);
          const snap = await getDocs(
            query(collection(db, 'public_users'), where('uid', 'in', chunk))
          );
          snap.forEach((doc) => publicProfilesMap.set(doc.id, doc.data()));
        }

        const now = new Date();
        const fiveMinutes = 5 * 60 * 1000;
        const conversations = rows
          .map((row) => {
            const profile = publicProfilesMap.get(row.friendId) || {};
            let status: 'online' | 'offline' = 'offline';
            const lastSeen = profile.lastSeen;
            if (lastSeen instanceof Timestamp) {
              const diff = now.getTime() - lastSeen.toDate().getTime();
              if (diff < fiveMinutes) status = 'online';
            }

            const friend: Friend = {
              userId: row.friendId,
              displayName: String(profile.displayName || 'User'),
              photoURL: (profile.photoURL as string | null | undefined) || null,
              addedAt: row.updatedAt,
              status,
              unreadCount: row.unreadCount
            };

            return {
              id: row.id,
              friend,
              participants: row.participants,
              updatedAt: row.updatedAt,
              lastMessage: row.lastMessage,
              unreadCount: row.unreadCount
            } as ChatConversation;
          })
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        callback(conversations);
      },
      (error) => {
        logger.error('Error subscribing to conversations:', error);
        callback([]);
      }
    );
  }

  subscribeToMessages(friendId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      const conversation = (getDevState().conversationsByUser[userId] || []).find((item) =>
        item.participants.includes(friendId)
      );
      const conversationId = conversation?.id || getChatId(userId, friendId);
      return subscribeDevState((state) =>
        callback(state.messagesByConversation[conversationId] || [])
      );
    }

    const userId = this.getUserId();
    if (!userId) return () => {};

    const chatId = getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: toDate(data.timestamp)
            } as ChatMessage;
          })
          .reverse();
        callback(messages);
      },
      (error) => {
        logger.error('Error subscribing to messages:', error);
        callback([]);
      }
    );
  }

  async sendMessage(friendId: string, content: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      const state = getDevState();
      const friendUser = state.users.find((user) => user.uid === friendId);
      const existing = (state.conversationsByUser[userId] || []).find((item) =>
        item.participants.includes(friendId)
      );
      const conversationId = existing?.id || getChatId(userId, friendId);
      const message: ChatMessage = {
        id: createDevId('message'),
        senderId: userId,
        receiverId: friendId,
        content,
        timestamp: new Date(),
        read: false
      };
      const conversation: ChatConversation = {
        id: conversationId,
        friend: existing?.friend || {
          userId: friendId,
          displayName: friendUser?.displayName || 'User',
          email: friendUser?.email || undefined,
          photoURL: friendUser?.photoURL,
          addedAt: new Date(),
          status: 'online'
        },
        participants: [userId, friendId],
        updatedAt: new Date(),
        unreadCount: 0,
        lastMessage: { content, senderId: userId, timestamp: new Date() }
      };

      setDevState((current) => ({
        ...current,
        conversationsByUser: {
          ...current.conversationsByUser,
          [userId]: [
            conversation,
            ...(current.conversationsByUser[userId] || []).filter(
              (item) => item.id !== conversationId
            )
          ]
        },
        messagesByConversation: {
          ...current.messagesByConversation,
          [conversationId]: [...(current.messagesByConversation[conversationId] || []), message]
        }
      }));
      return;
    }

    const userId = this.getUserId();
    if (!userId) throw new Error('Not authenticated');

    await requestJson('/api/social/messages', {
      method: 'POST',
      body: JSON.stringify({ friendId, content })
    });
  }

  async markChatRead(friendId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        conversationsByUser: {
          ...state.conversationsByUser,
          [userId]: (state.conversationsByUser[userId] || []).map((conversation) =>
            conversation.participants.includes(friendId)
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        }
      }));
      return;
    }

    await requestJson(`/api/social/chats/${friendId}/read`, {
      method: 'PATCH'
    });
  }
}
