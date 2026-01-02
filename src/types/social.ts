export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Friend {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  addedAt: Date;
  status: 'online' | 'offline';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
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
  fromUserName: string;
  toUserId: string;
  items: TradeItem[];
  timestamp: Date;
  status: 'completed';
}

export type SocialTab = 'friends' | 'search' | 'requests' | 'chat';
