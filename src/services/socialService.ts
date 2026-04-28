import { Unsubscribe } from 'firebase/firestore';
import {
  BlockedUser,
  ChatConversation,
  ChatMessage,
  Friend,
  FriendRequest,
  PublicUserProfile,
  ReportReason,
  SocialNotification,
  TradeItem
} from '@/types/social';
import { UserProfile } from '@/types/auth';

import { ProfileService } from './social/profileService';
import { FriendService } from './social/friendService';
import { ChatService } from './social/chatService';
import { TradeService } from './social/tradeService';
import { NotificationService, PushSetupStatus } from './social/notificationService';

class SocialService {
  private profile = new ProfileService();
  private friend = new FriendService();
  private chat = new ChatService();
  private trade = new TradeService();
  private notification = new NotificationService();

  // --- Profile Service Delegates ---

  async ensurePublicProfile(
    user: Pick<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>
  ): Promise<void> {
    return this.profile.ensurePublicProfile(user);
  }

  async getPublicProfile(uid: string): Promise<PublicUserProfile | null> {
    return this.profile.getPublicProfile(uid);
  }

  async searchUsers(searchTerm: string): Promise<PublicUserProfile[]> {
    return this.profile.searchUsers(searchTerm);
  }

  async updateHeartbeat(): Promise<void> {
    return this.profile.updateHeartbeat();
  }

  // --- Friend Service Delegates ---

  async sendFriendRequest(toUserId: string): Promise<void> {
    return this.friend.sendFriendRequest(toUserId);
  }

  async cancelFriendRequest(requestId: string): Promise<void> {
    return this.friend.cancelFriendRequest(requestId);
  }

  subscribeToFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    return this.friend.subscribeToFriendRequests(callback);
  }

  subscribeToSentFriendRequests(callback: (requests: FriendRequest[]) => void): Unsubscribe {
    return this.friend.subscribeToSentFriendRequests(callback);
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

  subscribeToBlockedUsers(callback: (blockedUsers: BlockedUser[]) => void): Unsubscribe {
    return this.friend.subscribeToBlockedUsers(callback);
  }

  async blockUser(blockedUserId: string): Promise<void> {
    return this.friend.blockUser(blockedUserId);
  }

  async unblockUser(blockedUserId: string): Promise<void> {
    return this.friend.unblockUser(blockedUserId);
  }

  async reportUser(reportedUserId: string, reason: ReportReason, details = ''): Promise<void> {
    return this.friend.reportUser(reportedUserId, reason, details);
  }

  // --- Chat Service Delegates ---

  subscribeToConversations(callback: (conversations: ChatConversation[]) => void): Unsubscribe {
    return this.chat.subscribeToConversations(callback);
  }

  subscribeToMessages(friendId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    return this.chat.subscribeToMessages(friendId, callback);
  }

  async sendMessage(friendId: string, content: string): Promise<void> {
    return this.chat.sendMessage(friendId, content);
  }

  async markChatRead(friendId: string): Promise<void> {
    return this.chat.markChatRead(friendId);
  }

  // --- Trade Service Delegates ---

  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    return this.trade.sendItems(toUserId, items);
  }

  // --- Notification Service Delegates ---

  subscribeToNotifications(callback: (notifications: SocialNotification[]) => void): Unsubscribe {
    return this.notification.subscribeToNotifications(callback);
  }

  async getPushStatus(): Promise<PushSetupStatus> {
    return this.notification.getPushStatus();
  }

  async registerPushNotifications(): Promise<string> {
    return this.notification.registerPushNotifications();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.notification.markNotificationRead(notificationId);
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.notification.markAllNotificationsRead();
  }
}

export const socialService = new SocialService();
