// Configurações do jogo - pode ser facilmente modificado aqui
export const GAME_CONFIG = {
  // Limite de tentativas por dia
  DAILY_FORAGE_LIMIT: 3,
  
  // Configurações de dificuldade
  DIFFICULTY: {
    COMUM_NATIVO: { min: 10, max: 15 },
    INCOMUM_NATIVO: { min: 16, max: 20 },
    INCOMUM_NAO_NATIVO: { min: 21, max: 25 }
  },
  
  // Configurações de dados
  DICE: {
    BONUS_DICE_TYPES: ['d4', 'd6', 'd8', 'd10', 'd12'] as const,
    MAX_BONUS_QUANTITY: 10
  },
  
  // Configurações de armazenamento
  STORAGE: {
    INGREDIENTS_KEY: 'obojima_collected_ingredients',
    ATTEMPTS_KEY: 'obojima_forage_attempts',
    SETTINGS_KEY: 'obojima_settings',
    DAILY_LIMITS_KEY: 'obojima_daily_limits'
  }
} as const;

// Função para verificar se o limite diário foi atingido
export function isDailyLimitReached(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const today = new Date().toDateString();
    const limits = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.DAILY_LIMITS_KEY) || '{}');
    
    return limits[today] >= GAME_CONFIG.DAILY_FORAGE_LIMIT;
  } catch (error) {
    console.error('Erro ao verificar limite diário:', error);
    return false;
  }
}

// Função para incrementar o contador diário
export function incrementDailyCounter(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const today = new Date().toDateString();
    const limits = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.DAILY_LIMITS_KEY) || '{}');
    
    limits[today] = (limits[today] || 0) + 1;
    localStorage.setItem(GAME_CONFIG.STORAGE.DAILY_LIMITS_KEY, JSON.stringify(limits));
  } catch (error) {
    console.error('Erro ao incrementar contador diário:', error);
  }
}

// Função para obter tentativas restantes hoje
export function getRemainingAttemptsToday(): number {
  if (typeof window === 'undefined') return GAME_CONFIG.DAILY_FORAGE_LIMIT;
  
  try {
    const today = new Date().toDateString();
    const limits = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.DAILY_LIMITS_KEY) || '{}');
    const usedToday = limits[today] || 0;
    
    return Math.max(0, GAME_CONFIG.DAILY_FORAGE_LIMIT - usedToday);
  } catch (error) {
    console.error('Erro ao obter tentativas restantes:', error);
    return GAME_CONFIG.DAILY_FORAGE_LIMIT;
  }
}

// Função para resetar limites (útil para testes)
export function resetDailyLimits(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GAME_CONFIG.STORAGE.DAILY_LIMITS_KEY);
}
