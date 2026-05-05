import { DevState } from './types';
import {
  CollectedIngredient,
  CreatedPotion,
  ForageAttempt,
  Ingredient,
  PotionRecipe
} from '@/types/ingredients';
import { UserProfile } from '@/types/auth';

export const DEV_STATE_VERSION = 1;
export const DEV_ADMIN_UID = 'dev-admin';
export const DEV_PLAYER_UID = 'dev-player';
export const DEV_FRIEND_UID = 'dev-friend';

const now = new Date('2026-05-05T12:00:00.000Z');
const yesterday = new Date('2026-05-04T12:00:00.000Z');
const lastWeek = new Date('2026-04-28T12:00:00.000Z');

export const devUsers: UserProfile[] = [
  {
    uid: DEV_ADMIN_UID,
    email: 'admin@obojima.dev',
    displayName: 'Dev Admin',
    photoURL: null,
    role: 'admin',
    createdAt: lastWeek.toISOString(),
    lastLogin: now.toISOString(),
    isAuthActive: true,
    disabled: false
  },
  {
    uid: DEV_PLAYER_UID,
    email: 'player@obojima.dev',
    displayName: 'Dev Player',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: yesterday.toISOString(),
    isAuthActive: true,
    disabled: false
  },
  {
    uid: DEV_FRIEND_UID,
    email: 'friend@obojima.dev',
    displayName: 'Mesa Dev',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: now.toISOString(),
    isAuthActive: true,
    disabled: false
  },
  {
    uid: 'dev-disabled',
    email: 'disabled@obojima.dev',
    displayName: 'Conta Desativada',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: lastWeek.toISOString(),
    isAuthActive: true,
    disabled: true
  },
  {
    uid: 'dev-orphan',
    email: 'orphan@obojima.dev',
    displayName: 'Conta Órfã',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    isAuthActive: false,
    disabled: false
  }
];

export const devIngredient: Ingredient = {
  id: 101,
  nome: 'Folha de Teste',
  combat: 2,
  utility: 4,
  whimsy: 3,
  descricao: 'Um ingrediente estável para validar a experiência mobile.',
  raridade: 'comum'
};

export const devIngredients: CollectedIngredient[] = [
  {
    id: 'dev-ingredient-1',
    ingredient: devIngredient,
    quantity: 3,
    collectedAt: new Date('2026-05-01T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'dev-attempt-1'
  },
  {
    id: 'dev-ingredient-2',
    ingredient: {
      id: 102,
      nome: 'Raiz Clara',
      combat: 5,
      utility: 1,
      whimsy: 2,
      descricao: 'Boa para testar criação de poções.',
      raridade: 'incomum'
    },
    quantity: 2,
    collectedAt: new Date('2026-05-02T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'dev-attempt-2'
  },
  {
    id: 'dev-ingredient-3',
    ingredient: {
      id: 103,
      nome: 'Orvalho Azul',
      combat: 1,
      utility: 3,
      whimsy: 5,
      descricao: 'Mantém os testes de seleção visualmente claros.',
      raridade: 'raro'
    },
    quantity: 1,
    collectedAt: new Date('2026-05-03T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'dev-attempt-3'
  }
];

export const devAttempts: ForageAttempt[] = [
  {
    id: 'dev-attempt-1',
    timestamp: new Date('2026-05-01T12:00:00.000Z'),
    region: 'Coastal Highlands',
    testType: 'natureza',
    modifier: 3,
    advantage: 'normal',
    dc: 10,
    dcRange: '10-15',
    roll: 16,
    success: true,
    ingredient: devIngredient,
    rarity: 'comum'
  },
  {
    id: 'dev-attempt-2',
    timestamp: new Date('2026-05-02T12:00:00.000Z'),
    region: 'Gale Fields',
    testType: 'sobrevivencia',
    modifier: 1,
    advantage: 'vantagem',
    dc: 12,
    dcRange: '12-16',
    roll: 19,
    success: true,
    ingredient: devIngredients[1].ingredient,
    rarity: 'incomum'
  }
];

export const devRecipe: PotionRecipe = {
  id: 'dev-recipe-1',
  ingredients: devIngredients.map((item) => item.ingredient),
  combatScore: 8,
  utilityScore: 8,
  whimsyScore: 10,
  winningAttribute: 'whimsy',
  resultingPotion: {
    id: 1,
    nome: 'Poção de Teste',
    raridade: 'Comum',
    descricao: 'Uma poção mockada para validar inventário e troca.'
  },
  createdAt: new Date('2026-05-04T12:00:00.000Z')
};

export const devPotions: CreatedPotion[] = [
  {
    id: 'dev-potion-1',
    potion: devRecipe.resultingPotion,
    recipe: devRecipe,
    quantity: 2,
    createdAt: new Date('2026-05-04T12:00:00.000Z'),
    used: false
  }
];

export function createDevSeed(): DevState {
  return {
    version: DEV_STATE_VERSION,
    activeUserId: DEV_ADMIN_UID,
    users: devUsers,
    publicUsers: devUsers.map((user) => ({
      uid: user.uid,
      displayName: user.displayName,
      searchName: (user.displayName || '').toLowerCase(),
      photoURL: user.photoURL,
      createdAt: new Date(user.createdAt || lastWeek),
      updatedAt: now,
      lastSeen: user.uid === DEV_FRIEND_UID ? now : yesterday,
      status: user.uid === DEV_FRIEND_UID ? 'online' : 'offline'
    })),
    settingsByUser: {
      [DEV_ADMIN_UID]: {
        defaultModifier: 2,
        defaultBonusDice: null,
        doubleForageTalent: true,
        cauldronBonus: true,
        potionBrewerTalent: true,
        potionBrewerLevel: 4,
        gold: 500,
        language: 'pt',
        defaultRegion: 'Coastal Highlands',
        defaultTestType: 'natureza'
      }
    },
    ingredientsByUser: { [DEV_ADMIN_UID]: devIngredients, [DEV_PLAYER_UID]: devIngredients },
    attemptsByUser: { [DEV_ADMIN_UID]: devAttempts, [DEV_PLAYER_UID]: devAttempts },
    recipesByUser: { [DEV_ADMIN_UID]: [devRecipe], [DEV_PLAYER_UID]: [devRecipe] },
    potionsByUser: { [DEV_ADMIN_UID]: devPotions, [DEV_PLAYER_UID]: devPotions },
    friendsByUser: {
      [DEV_ADMIN_UID]: [
        {
          friendshipId: 'dev-friendship-1',
          userId: DEV_FRIEND_UID,
          displayName: 'Mesa Dev',
          email: 'friend@obojima.dev',
          photoURL: null,
          addedAt: lastWeek,
          status: 'online',
          unreadCount: 1
        }
      ]
    },
    incomingRequestsByUser: { [DEV_ADMIN_UID]: [] },
    sentRequestsByUser: { [DEV_ADMIN_UID]: [] },
    conversationsByUser: {
      [DEV_ADMIN_UID]: [
        {
          id: 'dev-chat-1',
          friend: {
            userId: DEV_FRIEND_UID,
            displayName: 'Mesa Dev',
            email: 'friend@obojima.dev',
            addedAt: lastWeek,
            status: 'online',
            unreadCount: 1
          },
          participants: [DEV_ADMIN_UID, DEV_FRIEND_UID],
          updatedAt: now,
          unreadCount: 1,
          lastMessage: {
            content: 'Mensagem dev pronta para testar chat.',
            senderId: DEV_FRIEND_UID,
            timestamp: now
          }
        }
      ]
    },
    messagesByConversation: {
      'dev-chat-1': [
        {
          id: 'dev-message-1',
          senderId: DEV_FRIEND_UID,
          receiverId: DEV_ADMIN_UID,
          content: 'Mensagem dev pronta para testar chat.',
          timestamp: now,
          read: false
        }
      ]
    },
    notificationsByUser: {
      [DEV_ADMIN_UID]: [
        {
          id: 'dev-notification-1',
          recipientId: DEV_ADMIN_UID,
          actorId: DEV_FRIEND_UID,
          actorName: 'Mesa Dev',
          type: 'message',
          title: 'Nova mensagem',
          body: 'Mensagem dev pronta para testar notificações.',
          read: false,
          createdAt: now
        }
      ]
    },
    blockedByUser: {
      [DEV_ADMIN_UID]: [
        {
          id: 'dev-block-1',
          blockerId: DEV_ADMIN_UID,
          blockedUserId: 'dev-disabled',
          displayName: 'Conta Desativada',
          photoURL: null,
          createdAt: yesterday
        }
      ]
    },
    reports: [
      {
        id: 'dev-report-1',
        reporterId: DEV_FRIEND_UID,
        reportedUserId: DEV_ADMIN_UID,
        reason: 'trade',
        details: 'Denúncia dev para validar revisão no admin.',
        status: 'open',
        createdAt: yesterday
      }
    ],
    trades: [
      {
        id: 'dev-trade-1',
        fromUserId: DEV_ADMIN_UID,
        fromUserName: 'Dev Admin',
        toUserId: DEV_FRIEND_UID,
        participants: [DEV_ADMIN_UID, DEV_FRIEND_UID],
        items: [{ type: 'ingredient', id: '101', name: 'Folha de Teste', quantity: 1 }],
        timestamp: yesterday,
        status: 'completed'
      }
    ]
  };
}
