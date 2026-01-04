import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { ChatMessage } from '@/types/social';

export class ChatService {
  private getUserId(): string | null {
    return authService.getUserId();
  }

  private getChatId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  subscribeToMessages(friendId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    const userId = this.getUserId();
    if (!userId) return () => {};

    const chatId = this.getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              timestamp: (doc.data().timestamp as Timestamp).toDate()
            }) as ChatMessage
        );
        callback(messages);
      },
      (error) => {
        logger.error('Error subscribing to messages:', error);
      }
    );
  }

  async sendMessage(friendId: string, content: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    const chatId = this.getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);

    await addDoc(messagesRef, {
      senderId: userId,
      receiverId: friendId,
      content,
      timestamp: Timestamp.now(),
      read: false
    });
  }
}
