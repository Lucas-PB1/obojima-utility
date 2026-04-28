import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  setDoc
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

  private async ensureChat(chatId: string, userId: string, friendId: string): Promise<void> {
    await setDoc(
      doc(db, 'chats', chatId),
      {
        participants: [userId, friendId],
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );
  }

  subscribeToMessages(friendId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    const userId = this.getUserId();
    if (!userId) return () => {};

    const chatId = this.getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    let disposed = false;
    let unsubscribe: Unsubscribe | null = null;

    this.ensureChat(chatId, userId, friendId)
      .then(() => {
        if (disposed) return;

        unsubscribe = onSnapshot(
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
            callback([]);
          }
        );
      })
      .catch((error) => {
        logger.error('Error preparing chat subscription:', error);
        callback([]);
      });

    return () => {
      disposed = true;
      if (unsubscribe) unsubscribe();
    };
  }

  async sendMessage(friendId: string, content: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    const chatId = this.getChatId(userId, friendId);
    await this.ensureChat(chatId, userId, friendId);

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
