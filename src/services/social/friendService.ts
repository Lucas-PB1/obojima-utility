import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { Friend, FriendRequest } from '@/types/social';

export class FriendService {
  private getUserId(): string | null {
    return authService.getUserId();
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

        // 2. Fetch latest status from public_users
        const friendIds = friendsBasic.map((f) => f.friendId);
        const usersRef = collection(db, 'public_users');

        try {
          const chunks = [];
          for (let i = 0; i < friendIds.length; i += 10) {
            chunks.push(friendIds.slice(i, i + 10));
          }

          const publicProfilesMap = new Map();

          for (const chunk of chunks) {
            const qStatus = query(usersRef, where('uid', 'in', chunk));
            const snapStatus = await getDocs(qStatus);
            snapStatus.forEach((doc) => {
              publicProfilesMap.set(doc.id, doc.data());
            });
          }

          const now = new Date();
          const fiveMinutes = 5 * 60 * 1000;

          const friends: Friend[] = friendsBasic.map((f) => {
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
              displayName: publicProfile?.displayName || f.displayName,
              email: publicProfile?.email || f.email,
              photoURL: publicProfile?.photoURL || f.photoURL,
              addedAt: f.addedAt,
              status
            } as Friend;
          });

          callback(friends);
        } catch (error) {
          logger.error('Error fetching friend statuses:', error);
          callback(
            friendsBasic.map(
              (f) =>
                ({
                  userId: f.friendId,
                  displayName: f.displayName,
                  email: f.email,
                  photoURL: f.photoURL,
                  addedAt: f.addedAt,
                  status: 'offline'
                }) as Friend
            )
          );
        }
      },
      (error) => {
        logger.error('Error subscribing to friends:', error);
      }
    );
  }

  async removeFriend(friendId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    try {
      const friendsRef = collection(db, 'friends');
      const q = query(friendsRef, where('participants', 'array-contains', userId));
      const snapshot = await getDocs(q);

      const friendshipDoc = snapshot.docs.find((doc) => {
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
}
