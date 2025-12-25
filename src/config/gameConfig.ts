export const GAME_CONFIG = {
  DAILY_FORAGE_LIMIT: 3,

  DIFFICULTY: {
    COMUM_NATIVO: { min: 10, max: 15 },
    INCOMUM_NATIVO: { min: 16, max: 20 },
    INCOMUM_NAO_NATIVO: { min: 21, max: 25 }
  },

  DICE: {
    BONUS_DICE_TYPES: ['d4', 'd6', 'd8', 'd10', 'd12'] as const,
    MAX_BONUS_QUANTITY: 10
  }
} as const;
