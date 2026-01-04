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

  async updateHeartbeat(): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    try {
      const publicRef = doc(db, 'public_users', userId);
      await updateDoc(publicRef, {
        lastSeen: Timestamp.now()
      });
    } catch (error) {
      logger.warn('Error updating heartbeat, trying to ensure profile exists...', error);
      const user = authService.getCurrentUser();
      if (user) {
        await this.ensurePublicProfile({
           uid: user.uid,
           displayName: user.displayName || 'User',
           email: user.email || '',
           photoURL: user.photoURL
        });
      }
    }
  }

  subscribeToFriends(callback: (friends: Friend[]) => void): Unsubscribe {
    const userId = this.getUserId();
    if (!userId) return () => {};

    const friendsRef = collection(db, 'friends');
    const q = query(friendsRef, where('participants', 'array-contains', userId));

    return onSnapshot(
      q,
      async (snapshot) => {
        // 1. Basic list from the friendship documents
        const friendsBasic = snapshot.docs.map((doc) => {
          const data = doc.data();
          const friendId = data.participants.find((p: string) => p !== userId);
          const friendData = data.users[friendId];
          return {
             friendshipId: doc.id,
             friendId,
             ...friendData,
             addedAt: (data.createdAt as Timestamp).toDate()
          };
        });

        if (friendsBasic.length === 0) {
          callback([]);
          return;
        }

        // 2. Fetch latest status from public_users to get real 'lastSeen'
        // Firestore 'in' query is limited to 10. For this utility app, 
        // we'll batch if needed or just take the first 10 for safety in this iteration,
        // but for a robust solution we might simple getDocs for all ids.
        
        const friendIds = friendsBasic.map(f => f.friendId);
        const usersRef = collection(db, 'public_users');
        
        // Strategy: We will fetch the public profiles to get the LATEST info
        // Not using realtime listener for public_users to avoid N listeners.
        // We will do a one-time fetch on every friends-list update (which is rare)
        // AND we could ideally poll or user a heartbeat, but for now let's just fetch once.
        // To make it "Live", the UI should probably re-fetch or we implement a listener.
        
        // Better Strategy for "Realmente da pra saber":
        // Subscribe to keys of the friends that are currently displayed?
        // Let's simple do a getDocs for now.
        
        try {
            // Processing in chunks of 10 for 'in' query limit
            const chunks = [];
            for (let i = 0; i < friendIds.length; i += 10) {
                chunks.push(friendIds.slice(i, i + 10));
            }

            const publicProfilesMap = new Map();
            
            for (const chunk of chunks) {
                const qStatus = query(usersRef, where('uid', 'in', chunk));
                const snapStatus = await getDocs(qStatus);
                snapStatus.forEach(doc => {
                    publicProfilesMap.set(doc.id, doc.data());
                });
            }

            const now = new Date();
            const fiveMinutes = 5 * 60 * 1000;

            const friends: Friend[] = friendsBasic.map(f => {
                const publicProfile = publicProfilesMap.get(f.friendId);
                let status: 'online' | 'offline' = 'offline';
                
                if (publicProfile?.lastSeen) {
                    const lastSeenDate = (publicProfile.lastSeen as Timestamp).toDate();
                    const diff = now.getTime() - lastSeenDate.getTime();
                    if (diff < fiveMinutes) {
                        status = 'online';
                    }
                }

                return {
                    userId: f.friendId,
                    displayName: publicProfile?.displayName || f.displayName, // Prefer public profile most recent name
                    email: publicProfile?.email || f.email,
                    photoURL: publicProfile?.photoURL || f.photoURL,
                    addedAt: f.addedAt,
                    status
                } as Friend;
            });

            callback(friends);
        } catch (error) {
            logger.error('Error fetching friend statuses:', error);
            // Fallback to basic data if status fetch fails
            callback(friendsBasic.map(f => ({
                userId: f.friendId,
                displayName: f.displayName,
                email: f.email,
                photoURL: f.photoURL,
                addedAt: f.addedAt,
                status: 'offline'
            } as Friend)));
        }
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

  async removeFriend(friendId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    try {
      const friendsRef = collection(db, 'friends');
      const q = query(
        friendsRef,
        where('participants', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      
      const friendshipDoc = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(friendId);
      });

      if (friendshipDoc) {
        await runTransaction(db, async (transaction) => {
          transaction.delete(friendshipDoc.ref);
        });
      }
    } catch (error) {
      logger.error('Error removing friend:', error);
      throw error;
    }
  }

  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    const fromUserId = this.getUserId();
    if (!fromUserId) throw new Error('Not authenticated');

    await runTransaction(db, async (transaction) => {
      // 1. Prepare data and perform Sender Reads
      const senderOps = items.map((item) => {
        const senderCollectionPath =
          item.type === 'ingredient'
            ? `users/${fromUserId}/collectedIngredients`
            : `users/${fromUserId}/createdPotions`;
        const ref = doc(db, senderCollectionPath, item.id);
        return { item, ref };
      });

      const senderDocs = await Promise.all(
        senderOps.map(({ ref }) => transaction.get(ref))
      );

      // 2. Validate and Resolve Receiver Targets
      const transferPayloads = [];

      for (let i = 0; i < senderOps.length; i++) {
        const { item, ref: senderRef } = senderOps[i];
        const senderDoc = senderDocs[i];

        if (!senderDoc.exists()) {
          throw new Error(`Item ${item.name} not found in inventory`);
        }

        const sData = senderDoc.data();
        if (sData.quantity < item.quantity) {
          throw new Error(`Not enough quantity for ${item.name}`);
        }

        const receiverCollectionPath =
          item.type === 'ingredient'
            ? `users/${toUserId}/collectedIngredients`
            : `users/${toUserId}/createdPotions`;

        let receiverRef;

        if (item.type === 'ingredient') {
           const definitionId = sData.ingredient.id;
           const receiverColRef = collection(db, receiverCollectionPath);
           const q = query(
             receiverColRef,
             where('ingredient.id', '==', definitionId),
             where('used', '==', false)
           );
           // Non-transactional query to find candidate for stacking
           const receiverSnap = await getDocs(q); 
           if (!receiverSnap.empty) {
             receiverRef = receiverSnap.docs[0].ref;
           } else {
             receiverRef = doc(collection(db, receiverCollectionPath));
           }
        } else {
           // Potions always create new entry (or adjust logic if stacking desired)
           receiverRef = doc(collection(db, receiverCollectionPath));
        }
        
        transferPayloads.push({
            item,
            senderRef,
            senderData: sData,
            receiverRef
        });
      }

      // 3. Perform Receiver Reads
      const receiverDocs = await Promise.all(
          transferPayloads.map(({ receiverRef }) => transaction.get(receiverRef))
      );

      // 4. Perform Writes
      for (let i = 0; i < transferPayloads.length; i++) {
          const { item, senderRef, senderData, receiverRef } = transferPayloads[i];
          const receiverDoc = receiverDocs[i];

          // Update Sender
          const newSenderQty = senderData.quantity - item.quantity;
          if (newSenderQty <= 0) {
              transaction.delete(senderRef);
          } else {
              transaction.update(senderRef, { quantity: newSenderQty });
          }

          // Update Receiver
          if (receiverDoc.exists()) {
              const rData = receiverDoc.data();
              transaction.update(receiverRef, { quantity: rData.quantity + item.quantity });
          } else {
               const newItemData = {
                ...senderData,
                quantity: item.quantity,
                collectedAt: Timestamp.now(),
                used: false,
                usedAt: null
               };
               transaction.set(receiverRef, newItemData);
          }
      }

      // Record Trade
      const tradeRef = doc(collection(db, 'trades'));
      transaction.set(tradeRef, {
        fromUserId,
        toUserId,
        items: items,
        timestamp: Timestamp.now(),
        status: 'completed'
      });
    });
  }
}

export const socialService = new SocialService();
