export type UserPresenceStatus = 'online' | 'offline';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled';

export type SocialNotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'message'
  | 'trade'
  | 'system';

export type ReportReason = 'spam' | 'abuse' | 'harassment' | 'trade' | 'other';

export interface PublicUserProfile {
  uid: string;
  displayName: string | null;
  searchName?: string;
  photoURL?: string | null;
  lastSeen?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  status?: UserPresenceStatus;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhotoURL?: string | null;
  toUserId: string;
  toUserName?: string;
  toUserPhotoURL?: string | null;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
  respondedAt?: Date | null;
}

export interface Friend {
  friendshipId?: string;
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string | null;
  addedAt: Date;
  status: UserPresenceStatus;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read?: boolean;
  readBy?: string[];
}

export interface ChatConversation {
  id: string;
  friend: Friend;
  participants: string[];
  updatedAt: Date;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  } | null;
  unreadCount: number;
}

export interface SocialNotification {
  id: string;
  recipientId: string;
  actorId?: string | null;
  actorName?: string | null;
  type: SocialNotificationType;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: Date;
  data?: Record<string, string>;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  displayName: string;
  photoURL?: string | null;
  createdAt: Date;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: Date;
}

export type TradeItemType = 'potion' | 'ingredient';

export interface TradeItem {
  type: TradeItemType;
  id: string;
  name: string;
  quantity: number;
  image?: string;
  rarity?: string;
}

export interface TradeTransaction {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  participants: string[];
  items: TradeItem[];
  timestamp: Date;
  status: 'completed';
}

export type SocialTab =
  | 'friends'
  | 'search'
  | 'requests'
  | 'chats'
  | 'notifications'
  | 'blocked'
  | 'chat';
