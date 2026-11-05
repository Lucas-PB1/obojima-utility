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
  /** Admin actions performed on this account, newest first. */
  adminLog?: AdminAuditEntry[];
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

export type AdminAuditAction =
  | 'user.update'
  | 'user.role'
  | 'user.disable'
  | 'user.enable'
  | 'user.gold'
  | 'user.delete'
  | 'user.sessions'
  | 'user.notify'
  | 'item.grant'
  | 'item.update'
  | 'item.delete'
  | 'report.status'
  | 'users.sync'
  | 'maintenance.run';

export interface AdminAuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: AdminAuditAction;
  targetUid?: string | null;
  targetName?: string | null;
  summary: string;
  createdAt: string;
}

export interface AdminReportRow extends Omit<UserReport, 'createdAt'> {
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  resolutionNote?: string | null;
  reporterName: string;
  reportedName: string;
}

export type AdminItemType = 'ingredient' | 'potion';

export interface AdminGrantPayload {
  type: AdminItemType;
  /** Catalog entry: an Ingredient for ingredients, a Potion for potions. */
  item: { id: number; nome: string; raridade?: string; [key: string]: unknown };
  category?: 'combat' | 'utility' | 'whimsy';
  quantity: number;
  notify?: boolean;
}
