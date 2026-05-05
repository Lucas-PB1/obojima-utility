import { AdminUserDetails } from '../types';
import { buildAdminStats } from '../domain/adminRules';
import { UserProfile } from '@/types/auth';
import { getDevState } from '@/features/dev-mode';

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const adminDemoUsers: UserProfile[] = [
  {
    uid: 'demo-admin',
    email: 'admin@obojima.demo',
    displayName: 'Mika Admin',
    photoURL: null,
    role: 'admin',
    createdAt: lastWeek.toISOString(),
    lastLogin: now.toISOString(),
    isAuthActive: true,
    disabled: false
  },
  {
    uid: 'demo-player-1',
    email: 'lina@obojima.demo',
    displayName: 'Lina Forager',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: yesterday.toISOString(),
    isAuthActive: true,
    disabled: false
  },
  {
    uid: 'demo-player-2',
    email: 'taro@obojima.demo',
    displayName: 'Taro Potionmaker',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: lastWeek.toISOString(),
    isAuthActive: true,
    disabled: true
  },
  {
    uid: 'demo-orphan',
    email: 'old-account@obojima.demo',
    displayName: 'Conta Antiga',
    photoURL: null,
    role: 'user',
    createdAt: lastWeek.toISOString(),
    lastLogin: undefined,
    isAuthActive: false,
    disabled: false
  }
];

export function createDemoDetails(user = adminDemoUsers[1]): AdminUserDetails {
  return {
    user,
    gold: getDevState().settingsByUser[user.uid]?.gold || 0,
    ingredients: [
      {
        id: 'demo-ing-1',
        ingredient: {
          id: 101,
          nome: 'Folha da Lua',
          combat: 1,
          utility: 4,
          whimsy: 3,
          descricao: 'Ingrediente de teste do modo demo.',
          raridade: 'comum'
        },
        quantity: 4,
        collectedAt: yesterday,
        used: false,
        forageAttemptId: 'demo-attempt-1'
      },
      {
        id: 'demo-ing-2',
        ingredient: {
          id: 202,
          nome: 'Raiz Faiscante',
          combat: 3,
          utility: 2,
          whimsy: 5,
          descricao: 'Ingrediente raro de teste.',
          raridade: 'raro'
        },
        quantity: 1,
        collectedAt: lastWeek,
        used: true,
        usedAt: yesterday,
        forageAttemptId: 'demo-attempt-2'
      }
    ],
    potions: [
      {
        id: 'demo-potion-1',
        quantity: 2,
        createdAt: yesterday,
        recipe: {
          id: 'demo-recipe-1',
          ingredients: [],
          combatScore: 1,
          utilityScore: 7,
          whimsyScore: 2,
          winningAttribute: 'utility',
          createdAt: yesterday,
          resultingPotion: {
            id: 301,
            nome: 'Poção de Caminho Claro',
            descricao: 'Poção demo para validar UI admin.',
            raridade: 'incomum'
          }
        },
        potion: {
          id: 301,
          nome: 'Poção de Caminho Claro',
          descricao: 'Poção demo para validar UI admin.',
          raridade: 'incomum'
        },
        used: false
      }
    ],
    history: [
      {
        id: 'demo-attempt-1',
        timestamp: yesterday,
        region: 'Gale Fields',
        testType: 'natureza',
        modifier: 2,
        advantage: 'normal',
        dc: 12,
        dcRange: '12',
        roll: 18,
        success: true,
        rarity: 'comum',
        ingredient: {
          id: 101,
          nome: 'Folha da Lua',
          combat: 1,
          utility: 4,
          whimsy: 3,
          descricao: 'Ingrediente de teste do modo demo.',
          raridade: 'comum'
        }
      },
      {
        id: 'demo-attempt-2',
        timestamp: lastWeek,
        region: 'Mount Arbora',
        testType: 'sobrevivencia',
        modifier: 0,
        advantage: 'desvantagem',
        dc: 14,
        dcRange: '14',
        roll: 6,
        success: false,
        rarity: 'raro'
      }
    ],
    social: {
      friends: [
        {
          friendshipId: 'demo-friendship',
          userId: 'demo-admin',
          displayName: 'Mika Admin',
          email: 'admin@obojima.demo',
          photoURL: null,
          addedAt: lastWeek,
          status: 'online',
          unreadCount: 2
        }
      ],
      incomingRequests: [],
      outgoingRequests: [
        {
          id: 'demo-request',
          fromUserId: user.uid,
          fromUserName: user.displayName || 'User',
          toUserId: 'demo-orphan',
          toUserName: 'Conta Antiga',
          status: 'pending',
          createdAt: yesterday
        }
      ],
      conversations: [
        {
          id: 'demo-chat',
          participants: [user.uid, 'demo-admin'],
          updatedAt: now,
          unreadCount: 2,
          friend: {
            userId: 'demo-admin',
            displayName: 'Mika Admin',
            addedAt: lastWeek,
            status: 'online'
          },
          lastMessage: {
            content: 'Mensagem demo para conferir a área social.',
            senderId: 'demo-admin',
            timestamp: now
          }
        }
      ],
      blockedUsers: [
        {
          id: 'demo-block',
          blockerId: user.uid,
          blockedUserId: 'demo-player-2',
          displayName: 'Taro Potionmaker',
          photoURL: null,
          createdAt: yesterday
        }
      ],
      reports: [
        {
          id: 'demo-report',
          reporterId: 'demo-admin',
          reportedUserId: user.uid,
          reason: 'trade',
          details: 'Troca marcada para revisão no modo demo.',
          status: 'open',
          createdAt: yesterday
        }
      ],
      notifications: [
        {
          id: 'demo-notification',
          recipientId: user.uid,
          actorId: 'demo-admin',
          actorName: 'Mika Admin',
          type: 'system',
          title: 'Aviso do sistema',
          body: 'Notificação demo para validar suporte.',
          read: false,
          createdAt: yesterday
        }
      ],
      trades: [
        {
          id: 'demo-trade',
          fromUserId: user.uid,
          fromUserName: user.displayName || 'User',
          toUserId: 'demo-admin',
          participants: [user.uid, 'demo-admin'],
          items: [{ type: 'ingredient', id: 'moonleaf', name: 'Folha da Lua', quantity: 1 }],
          timestamp: yesterday,
          status: 'completed'
        }
      ]
    },
    audit: [
      { id: 'mode', label: 'Modo', value: 'Demo local', tone: 'warning' },
      { id: 'created', label: 'Criado em', value: user.createdAt || '-', tone: 'default' },
      { id: 'login', label: 'Último login', value: user.lastLogin || '-', tone: 'default' }
    ]
  };
}

export const adminDemoDashboard = {
  mode: 'demo' as const,
  users: getDevState().users.length ? getDevState().users : adminDemoUsers,
  stats: buildAdminStats(getDevState().users.length ? getDevState().users : adminDemoUsers, [
    createDemoDetails()
  ])
};
