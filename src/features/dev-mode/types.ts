import { UserProfile } from '@/types/auth';
import {
  CollectedIngredient,
  CreatedPotion,
  ForageAttempt,
  PotionRecipe
} from '@/types/ingredients';
import {
  BlockedUser,
  ChatConversation,
  ChatMessage,
  Friend,
  FriendRequest,
  PublicUserProfile,
  SocialNotification,
  TradeTransaction,
  UserReport
} from '@/types/social';

export interface DevSettings {
  defaultModifier: number | '';
  defaultBonusDice: { type: string; value: number } | null;
  doubleForageTalent: boolean;
  cauldronBonus: boolean;
  potionBrewerTalent: boolean;
  potionBrewerLevel: number;
  gold: number;
  language?: 'pt' | 'en' | 'es';
  defaultRegion?: string;
  defaultTestType?: 'natureza' | 'sobrevivencia';
}

export interface DevState {
  version: number;
  activeUserId: string;
  users: UserProfile[];
  publicUsers: PublicUserProfile[];
  settingsByUser: Record<string, DevSettings>;
  ingredientsByUser: Record<string, CollectedIngredient[]>;
  attemptsByUser: Record<string, ForageAttempt[]>;
  recipesByUser: Record<string, PotionRecipe[]>;
  potionsByUser: Record<string, CreatedPotion[]>;
  friendsByUser: Record<string, Friend[]>;
  incomingRequestsByUser: Record<string, FriendRequest[]>;
  sentRequestsByUser: Record<string, FriendRequest[]>;
  conversationsByUser: Record<string, ChatConversation[]>;
  messagesByConversation: Record<string, ChatMessage[]>;
  notificationsByUser: Record<string, SocialNotification[]>;
  blockedByUser: Record<string, BlockedUser[]>;
  reports: UserReport[];
  trades: TradeTransaction[];
}
