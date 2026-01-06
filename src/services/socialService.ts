import { Unsubscribe } from 'firebase/firestore';
import { Friend, FriendRequest, ChatMessage, TradeItem } from '@/types/social';
import { UserProfile } from '@/types/auth';

import { ProfileService } from './social/profileService';
import { FriendService } from './social/friendService';
import { ChatService } from './social/chatService';
import { TradeService } from './social/tradeService';

class SocialService {
  private profile = new ProfileService();
  private friend = new FriendService();
  private chat = new ChatService();
  private trade = new TradeService();

  // --- Profile Service Delegates ---

  async ensurePublicProfile(
    user: Pick<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>
  ): Promise<void> {
    return this.profile.ensurePublicProfile(user);
  }

  async getPublicProfile(uid: string): Promise<UserProfile | null> {
    return this.profile.getPublicProfile(uid);
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    return this.profile.searchUsers(searchTerm);
  }

  async updateHeartbeat(): Promise<void> {
    return this.profile.updateHeartbeat();
  }

  // --- Friend Service Delegates ---

  async sendFriendRequest(toUserId: string): Promise<void> {
    return this.friend.sendFriendRequest(toUserId);
  }

  subscribeToFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    return this.friend.subscribeToFriendRequests(callback);
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<void> {
    return this.friend.respondToFriendRequest(requestId, accept);
  }

  subscribeToFriends(callback: (friends: Friend[]) => void): Unsubscribe {
    return this.friend.subscribeToFriends(callback);
  }

  async removeFriend(friendId: string): Promise<void> {
    return this.friend.removeFriend(friendId);
  }

  // --- Chat Service Delegates ---

  subscribeToMessages(friendId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    return this.chat.subscribeToMessages(friendId, callback);
  }

  async sendMessage(friendId: string, content: string): Promise<void> {
    return this.chat.sendMessage(friendId, content);
  }

  // --- Trade Service Delegates ---

  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    return this.trade.sendItems(toUserId, items);
  }
}

export const socialService = new SocialService();
