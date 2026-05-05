import {
  collection,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  Unsubscribe,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import { BlockedUser, Friend, FriendRequest, ReportReason } from '@/types/social';
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

export class FriendService {
  private getUserId(): string | null {
    return authService.getUserId();
  }

  async sendFriendRequest(toUserId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      const fromUser = getDevState().users.find((user) => user.uid === userId);
      const toUser = getDevState().users.find((user) => user.uid === toUserId);
      const request: FriendRequest = {
        id: createDevId('friend-request'),
        fromUserId: userId,
        fromUserName: fromUser?.displayName || 'User',
        fromUserPhotoURL: fromUser?.photoURL,
        toUserId,
        toUserName: toUser?.displayName || 'User',
        toUserPhotoURL: toUser?.photoURL,
        status: 'pending',
        createdAt: new Date()
      };
      setDevState((state) => ({
        ...state,
        sentRequestsByUser: {
          ...state.sentRequestsByUser,
          [userId]: [request, ...(state.sentRequestsByUser[userId] || [])]
        },
        incomingRequestsByUser: {
          ...state.incomingRequestsByUser,
          [toUserId]: [request, ...(state.incomingRequestsByUser[toUserId] || [])]
        }
      }));
      return;
    }

    if (!this.getUserId()) throw new Error('Not authenticated');
    await requestJson('/api/social/friend-requests', {
      method: 'POST',
      body: JSON.stringify({ toUserId })
    });
  }

  async cancelFriendRequest(requestId: string): Promise<void> {
    if (isDevMode()) {
      setDevState((state) => ({
        ...state,
        sentRequestsByUser: Object.fromEntries(
          Object.entries(state.sentRequestsByUser).map(([uid, rows]) => [
            uid,
            rows.filter((request) => request.id !== requestId)
          ])
        ),
        incomingRequestsByUser: Object.fromEntries(
          Object.entries(state.incomingRequestsByUser).map(([uid, rows]) => [
            uid,
            rows.filter((request) => request.id !== requestId)
          ])
        )
      }));
      return;
    }

    await requestJson(`/api/social/friend-requests/${requestId}`, {
      method: 'DELETE'
    });
  }

  subscribeToFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.incomingRequestsByUser[userId] || []));
    }

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
        const requests = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
            respondedAt: data.respondedAt ? toDate(data.respondedAt) : null
          } as FriendRequest;
        });
        callback(requests);
      },
      (error) => {
        logger.error('Error subscribing to friend requests:', error);
      }
    );
  }

  subscribeToSentFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.sentRequestsByUser[userId] || []));
    }

    const userId = this.getUserId();
    if (!userId) return () => {};

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
            respondedAt: data.respondedAt ? toDate(data.respondedAt) : null
          } as FriendRequest;
        });
        callback(requests);
      },
      (error) => {
        logger.error('Error subscribing to sent friend requests:', error);
      }
    );
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => {
        const request = (state.incomingRequestsByUser[userId] || []).find(
          (item) => item.id === requestId
        );
        const nextState = {
          ...state,
          incomingRequestsByUser: {
            ...state.incomingRequestsByUser,
            [userId]: (state.incomingRequestsByUser[userId] || []).filter(
              (item) => item.id !== requestId
            )
          }
        };
        if (!accept || !request) return nextState;
        const friendUser = state.users.find((user) => user.uid === request.fromUserId);
        const me = state.users.find((user) => user.uid === userId);
        return {
          ...nextState,
          friendsByUser: {
            ...nextState.friendsByUser,
            [userId]: [
              {
                friendshipId: createDevId('friendship'),
                userId: request.fromUserId,
                displayName: friendUser?.displayName || request.fromUserName,
                email: friendUser?.email || undefined,
                photoURL: friendUser?.photoURL,
                addedAt: new Date(),
                status: 'online'
              },
              ...(nextState.friendsByUser[userId] || [])
            ],
            [request.fromUserId]: [
              {
                friendshipId: createDevId('friendship'),
                userId,
                displayName: me?.displayName || 'User',
                email: me?.email || undefined,
                photoURL: me?.photoURL,
                addedAt: new Date(),
                status: 'online'
              },
              ...(nextState.friendsByUser[request.fromUserId] || [])
            ]
          }
        };
      });
      return;
    }

    await requestJson(`/api/social/friend-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: accept ? 'accept' : 'reject' })
    });
  }

  subscribeToFriends(callback: (friends: Friend[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.friendsByUser[userId] || []));
    }

    const userId = this.getUserId();
    if (!userId) return () => {};

    const friendsRef = collection(db, 'friends');
    const q = query(friendsRef, where('participants', 'array-contains', userId));

    return onSnapshot(
      q,
      async (snapshot) => {
        const friendsBasic = snapshot.docs.map((doc) => {
          const data = doc.data();
          const friendId = data.participants.find((p: string) => p !== userId);
          const friendData = data.users?.[friendId] || {};
          return {
            friendshipId: doc.id,
            friendId,
            ...friendData,
            addedAt: toDate(data.createdAt)
          };
        });

        if (friendsBasic.length === 0) {
          callback([]);
          return;
        }

        const friendIds = friendsBasic.map((f) => f.friendId);
        const usersRef = collection(db, 'public_users');

        try {
          const chunks = [];
          for (let i = 0; i < friendIds.length; i += 10) {
            chunks.push(friendIds.slice(i, i + 10));
          }

          const publicProfilesMap = new Map<string, Record<string, unknown>>();

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
            const lastSeen = publicProfile?.lastSeen;

            if (lastSeen instanceof Timestamp) {
              const diff = now.getTime() - lastSeen.toDate().getTime();
              if (diff < fiveMinutes) status = 'online';
            }

            return {
              friendshipId: f.friendshipId,
              userId: f.friendId,
              displayName: String(publicProfile?.displayName || f.displayName || 'User'),
              photoURL:
                (publicProfile?.photoURL as string | null | undefined) || f.photoURL || null,
              addedAt: f.addedAt,
              status
            };
          });

          callback(friends);
        } catch (error) {
          logger.error('Error fetching friend statuses:', error);
          callback(
            friendsBasic.map((f) => ({
              friendshipId: f.friendshipId,
              userId: f.friendId,
              displayName: f.displayName || 'User',
              photoURL: f.photoURL || null,
              addedAt: f.addedAt,
              status: 'offline'
            }))
          );
        }
      },
      (error) => {
        logger.error('Error subscribing to friends:', error);
      }
    );
  }

  async removeFriend(friendId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        friendsByUser: {
          ...state.friendsByUser,
          [userId]: (state.friendsByUser[userId] || []).filter(
            (friend) => friend.userId !== friendId
          )
        }
      }));
      return;
    }

    await requestJson(`/api/social/friends/${friendId}`, {
      method: 'DELETE'
    });
  }

  subscribeToBlockedUsers(callback: (blockedUsers: BlockedUser[]) => void): Unsubscribe {
    if (isDevMode()) {
      const userId = getDevUserId();
      return subscribeDevState((state) => callback(state.blockedByUser[userId] || []));
    }

    const userId = this.getUserId();
    if (!userId) return () => {};

    const q = query(collection(db, 'blocks'), where('blockerId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const blockedUsers = snapshot.docs.map((doc) => {
          const data = doc.data();
          const blockedUser = data.blockedUser || {};
          return {
            id: doc.id,
            blockerId: data.blockerId,
            blockedUserId: data.blockedUserId,
            displayName: blockedUser.displayName || 'User',
            photoURL: blockedUser.photoURL || null,
            createdAt: toDate(data.createdAt)
          } as BlockedUser;
        });
        callback(blockedUsers);
      },
      (error) => {
        logger.error('Error subscribing to blocked users:', error);
      }
    );
  }

  async blockUser(blockedUserId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      const blocked = getDevState().users.find((user) => user.uid === blockedUserId);
      setDevState((state) => ({
        ...state,
        blockedByUser: {
          ...state.blockedByUser,
          [userId]: [
            {
              id: createDevId('block'),
              blockerId: userId,
              blockedUserId,
              displayName: blocked?.displayName || 'User',
              photoURL: blocked?.photoURL,
              createdAt: new Date()
            },
            ...(state.blockedByUser[userId] || [])
          ]
        }
      }));
      return;
    }

    await requestJson('/api/social/blocks', {
      method: 'POST',
      body: JSON.stringify({ blockedUserId })
    });
  }

  async unblockUser(blockedUserId: string): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        blockedByUser: {
          ...state.blockedByUser,
          [userId]: (state.blockedByUser[userId] || []).filter(
            (block) => block.blockedUserId !== blockedUserId
          )
        }
      }));
      return;
    }

    await requestJson(`/api/social/blocks/${blockedUserId}`, {
      method: 'DELETE'
    });
  }

  async reportUser(reportedUserId: string, reason: ReportReason, details = ''): Promise<void> {
    if (isDevMode()) {
      const userId = getDevUserId();
      setDevState((state) => ({
        ...state,
        reports: [
          {
            id: createDevId('report'),
            reporterId: userId,
            reportedUserId,
            reason,
            details,
            status: 'open',
            createdAt: new Date()
          },
          ...state.reports
        ]
      }));
      return;
    }

    await requestJson('/api/social/reports', {
      method: 'POST',
      body: JSON.stringify({ reportedUserId, reason, details })
    });
  }
}
