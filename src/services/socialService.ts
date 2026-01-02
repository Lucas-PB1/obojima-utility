import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  setDoc,
  runTransaction,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { Friend, FriendRequest, ChatMessage, TradeItem } from '@/types/social';
import { UserProfile } from '@/types/auth';

class SocialService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getUserId(): string | null {
    return authService.getUserId();
  }

  async ensurePublicProfile(
    user: Pick<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>
  ): Promise<void> {
    if (!this.isClient() || !user.uid) return;

    const publicRef = doc(db, 'public_users', user.uid);
    await setDoc(
      publicRef,
      {
        uid: user.uid,
        displayName: user.displayName,
        searchName: (user.displayName || '').toLowerCase(),
        email: user.email,
        photoURL: user.photoURL,
        lastSeen: Timestamp.now()
      },
      { merge: true }
    );
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    console.log(`[SocialService] searchUsers triggered with: ${searchTerm}`);
    if (!this.isClient() || !searchTerm || searchTerm.length < 3) return [];

    try {
      const usersRef = collection(db, 'public_users');
      const termLowerCase = searchTerm.toLowerCase();

      // Busca por nome (prefixo)
      const nameQuery = query(
        usersRef,
        where('searchName', '>=', termLowerCase),
        where('searchName', '<=', termLowerCase + '\uf8ff'),
        orderBy('searchName'),
        limit(10)
      );

      // Busca por email (prefixo)
      const emailQuery = query(
        usersRef,
        where('email', '>=', termLowerCase),
        where('email', '<=', termLowerCase + '\uf8ff'),
        orderBy('email'),
        limit(10)
      );

      // Fallback: Busca por displayName (case-sensitive, para usuários antigos sem searchName)
      const displayQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        orderBy('displayName'),
        limit(10)
      );

      const [nameSnapshot, emailSnapshot, displaySnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery),
        getDocs(displayQuery)
      ]);

      const usersMap = new Map<string, UserProfile>();

      nameSnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      emailSnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      displaySnapshot.docs.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
      });

      return Array.from(usersMap.values()).slice(0, 10);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async sendFriendRequest(toUserId: string): Promise<void> {
    const fromUserId = this.getUserId();
    if (!fromUserId) throw new Error('Not authenticated');
    if (fromUserId === toUserId) throw new Error('Você não pode adicionar a si mesmo.');

    try {
      const requestsRef = collection(db, 'friendRequests');

      const q = query(
        requestsRef,
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) throw new Error('Request already pending');

      const currentUser = authService.getCurrentUser();
      const fromUserName = currentUser?.displayName || currentUser?.email || 'Unknown';

      await addDoc(requestsRef, {
        fromUserId,
        fromUserName,
        toUserId,
        status: 'pending',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      logger.error('Error sending friend request:', error);
      throw error;
    }
  }

  subscribeToFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    const userId = this.getUserId();
    if (!userId) return () => {};

    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: (doc.data().createdAt as Timestamp).toDate()
            }) as FriendRequest
        );
        callback(requests);
      },
      (error) => {
        logger.error('Error subscribing to friend requests:', error);
      }
    );
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<void> {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const docSnap = await getDoc(requestRef);
      if (!docSnap.exists()) throw new Error('Request not found');

      const requestData = docSnap.data() as FriendRequest;

      if (accept) {
        await runTransaction(db, async (transaction) => {
          const uid1 =
            requestData.fromUserId < requestData.toUserId
              ? requestData.fromUserId
              : requestData.toUserId;
          const uid2 =
            requestData.fromUserId < requestData.toUserId
              ? requestData.toUserId
              : requestData.fromUserId;
          const friendshipId = `${uid1}_${uid2}`;
          const friendRef = doc(db, 'friends', friendshipId);

          const senderPublicRef = doc(db, 'public_users', requestData.fromUserId);
          const receiverPublicRef = doc(db, 'public_users', requestData.toUserId);

          const [senderSnap, receiverSnap] = await Promise.all([
            transaction.get(senderPublicRef),
            transaction.get(receiverPublicRef)
          ]);

          const senderData = senderSnap.exists()
            ? senderSnap.data()
            : {
                uid: requestData.fromUserId,
                displayName: requestData.fromUserName || 'Unknown',
                email: 'hidden',
                photoURL: null
              };

          const friendshipData = {
            participants: [requestData.fromUserId, requestData.toUserId],
            createdAt: Timestamp.now(),
            users: {
              [requestData.fromUserId]: senderData,
              [requestData.toUserId]: receiverSnap.exists()
                ? receiverSnap.data()
                : { uid: requestData.toUserId, displayName: 'User' }
            }
          };

          transaction.set(friendRef, friendshipData, { merge: true });
          transaction.update(requestRef, { status: 'accepted' });
        });
      } else {
        await updateDoc(requestRef, { status: 'rejected' });
      }
    } catch (error) {
      logger.error('Error responding to request:', error);
      throw error;
    }
  }

  subscribeToFriends(callback: (friends: Friend[]) => void): Unsubscribe {
    const userId = this.getUserId();
    if (!userId) return () => {};

    const friendsRef = collection(db, 'friends');
    const q = query(friendsRef, where('participants', 'array-contains', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const friends: Friend[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const friendId = data.participants.find((p: string) => p !== userId);
          const friendData = data.users[friendId];

          return {
            userId: friendId,
            displayName: friendData?.displayName || 'Unknown',
            email: friendData?.email || '',
            photoURL: friendData?.photoURL,
            addedAt: (data.createdAt as Timestamp).toDate(),
            status: 'offline'
          } as Friend;
        });
        callback(friends);
      },
      (error) => {
        logger.error('Error subscribing to friends:', error);
      }
    );
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

  async sendItem(toUserId: string, item: TradeItem): Promise<void> {
    const fromUserId = this.getUserId();
    if (!fromUserId) throw new Error('Not authenticated');

    const senderCollectionPath =
      item.type === 'ingredient'
        ? `users/${fromUserId}/collectedIngredients`
        : `users/${fromUserId}/createdPotions`;

    const receiverCollectionPath =
      item.type === 'ingredient'
        ? `users/${toUserId}/collectedIngredients`
        : `users/${toUserId}/createdPotions`;

    const senderDocRef = doc(db, senderCollectionPath, item.id);

    const senderDocSnap = await getDoc(senderDocRef);
    if (!senderDocSnap.exists()) throw new Error('Item not found in inventory');

    const senderData = senderDocSnap.data();
    const definitionId =
      item.type === 'ingredient' ? senderData.ingredient.id : senderData.recipe?.id;

    let receiverDocRef;

    if (item.type === 'ingredient') {
      const receiverColRef = collection(db, receiverCollectionPath);
      const q = query(
        receiverColRef,
        where('ingredient.id', '==', definitionId),
        where('used', '==', false)
      );
      const receiverSnap = await getDocs(q);
      if (!receiverSnap.empty) {
        receiverDocRef = receiverSnap.docs[0].ref;
      } else {
        receiverDocRef = doc(collection(db, receiverCollectionPath));
      }
    } else {
      receiverDocRef = doc(collection(db, receiverCollectionPath));
    }

    await runTransaction(db, async (transaction) => {
      const senderDoc = await transaction.get(senderDocRef);
      const receiverDoc = await transaction.get(receiverDocRef);

      if (!senderDoc.exists()) throw new Error('Item disappeared');

      const sData = senderDoc.data();
      if (sData.quantity < item.quantity) throw new Error('Not enough quantity');

      const newSenderQty = sData.quantity - item.quantity;
      if (newSenderQty <= 0) {
        transaction.delete(senderDocRef);
      } else {
        transaction.update(senderDocRef, { quantity: newSenderQty });
      }

      if (receiverDoc.exists()) {
        const rData = receiverDoc.data();
        transaction.update(receiverDocRef, { quantity: rData.quantity + item.quantity });
      } else {
        const newItemData = {
          ...sData,
          quantity: item.quantity,
          collectedAt: Timestamp.now(),
          used: false,
          usedAt: null
        };
        transaction.set(receiverDocRef, newItemData);
      }

      const tradeRef = doc(collection(db, 'trades'));
      transaction.set(tradeRef, {
        fromUserId,
        toUserId,
        item: item,
        timestamp: Timestamp.now(),
        status: 'completed'
      });
    });
  }
}

export const socialService = new SocialService();
