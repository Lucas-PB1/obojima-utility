import { UserProfile } from '@/types/auth';
import {
  BlockedUser,
  ChatConversation,
  Friend,
  FriendRequest,
  SocialNotification,
  TradeTransaction,
  UserReport
} from '@/types/social';
import { CollectedIngredient, CreatedPotion, ForageAttempt } from '@/types/ingredients';

export type AdminDataMode = 'live' | 'demo';

export type AdminUserStatus = 'active' | 'disabled' | 'orphaned';

export interface AdminStats {
  totalUsers: number;
  admins: number;
  active: number;
  disabled: number;
  orphaned: number;
  openReports: number;
}

export interface AdminSocialSnapshot {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  conversations: ChatConversation[];
  blockedUsers: BlockedUser[];
  reports: UserReport[];
  notifications: SocialNotification[];
  trades: TradeTransaction[];
}

export interface AdminUserDetails {
  user: UserProfile;
  gold: number;
  ingredients: CollectedIngredient[];
  potions: CreatedPotion[];
  history: ForageAttempt[];
  social: AdminSocialSnapshot;
  audit: Array<{
    id: string;
    label: string;
    value: string;
    tone?: 'default' | 'success' | 'warning' | 'danger';
  }>;
}

export interface AdminDashboardState {
  mode: AdminDataMode;
  users: UserProfile[];
  stats: AdminStats;
}

export interface AdminMutationResult {
  success: boolean;
  message?: string;
}
