import { CollectedIngredient, CreatedPotion, ForageAttempt, Ingredient } from '@/types/ingredients';
import { Friend, FriendRequest } from '@/types/social';

export function isE2EMode(): boolean {
  return process.env.NEXT_PUBLIC_E2E_MODE === 'true';
}

export const e2eUser = {
  uid: 'e2e-user',
  email: 'player@example.com',
  displayName: 'E2E Player',
  photoURL: null
};

export const e2eIngredient: Ingredient = {
  id: 101,
  nome: 'Folha de Teste',
  combat: 2,
  utility: 4,
  whimsy: 3,
  descricao: 'Um ingrediente estável para validar a experiência mobile.',
  raridade: 'comum'
};

export const e2eIngredients: CollectedIngredient[] = [
  {
    id: 'e2e-ingredient-1',
    ingredient: e2eIngredient,
    quantity: 3,
    collectedAt: new Date('2026-01-01T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'e2e-attempt-1'
  },
  {
    id: 'e2e-ingredient-2',
    ingredient: {
      id: 102,
      nome: 'Raiz Clara',
      combat: 5,
      utility: 1,
      whimsy: 2,
      descricao: 'Boa para testar a criação de poções.',
      raridade: 'incomum'
    },
    quantity: 2,
    collectedAt: new Date('2026-01-02T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'e2e-attempt-2'
  },
  {
    id: 'e2e-ingredient-3',
    ingredient: {
      id: 103,
      nome: 'Orvalho Azul',
      combat: 1,
      utility: 3,
      whimsy: 5,
      descricao: 'Mantém os testes de seleção visualmente claros.',
      raridade: 'comum'
    },
    quantity: 2,
    collectedAt: new Date('2026-01-03T12:00:00.000Z'),
    used: false,
    forageAttemptId: 'e2e-attempt-3'
  }
];

export const e2eAttempts: ForageAttempt[] = [
  {
    id: 'e2e-attempt-1',
    timestamp: new Date('2026-01-01T12:00:00.000Z'),
    region: 'Coastal Highlands',
    testType: 'natureza',
    modifier: 3,
    advantage: 'normal',
    dc: 10,
    dcRange: '10-15',
    roll: 16,
    success: true,
    ingredient: e2eIngredient,
    rarity: 'comum'
  }
];

export const e2ePotions: CreatedPotion[] = [
  {
    id: 'e2e-potion-1',
    potion: {
      id: 1,
      nome: 'Poção de Teste',
      raridade: 'Comum',
      descricao: 'Uma poção mockada para validar inventário e troca.'
    },
    recipe: {
      id: 'e2e-recipe-1',
      ingredients: e2eIngredients.map((item) => item.ingredient),
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
      createdAt: new Date('2026-01-04T12:00:00.000Z')
    },
    quantity: 1,
    createdAt: new Date('2026-01-04T12:00:00.000Z'),
    used: false
  }
];

export const e2eFriends: Friend[] = [
  {
    userId: 'e2e-friend',
    displayName: 'Mesa Teste',
    email: 'friend@example.com',
    photoURL: null,
    addedAt: new Date('2026-01-05T12:00:00.000Z'),
    status: 'online'
  }
];

export const e2eRequests: FriendRequest[] = [];
