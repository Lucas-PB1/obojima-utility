export interface Ingredient {
  id: number;
  nome: string;
  combat: number;
  utility: number;
  whimsy: number;
  descricao: string;
  raridade?: 'comum' | 'incomum' | 'raro' | 'unico';
}

export interface IngredientByRegion {
  nome: string;
  id: number;
}

export interface RareIngredient {
  id: number;
  nome: string;
  combat: number;
  utility: number;
  whimsy: number;
  descricao: string;
  raridade: 'raro';
}

export interface UniqueIngredient {
  id: number;
  nome: string;
  combat: number;
  utility: number;
  whimsy: number;
  descricao: string;
  raridade: 'unico';
}

export interface UniqueIngredientData {
  id: number;
  nome: string;
  circunstancia: string;
  localizacao: string;
}

export interface RegionData {
  descricao: string;
  common: {
    dice: string;
    ingredients: IngredientByRegion[];
  };
  uncommon: {
    dice: string;
    ingredients: IngredientByRegion[];
  };
}

export interface IngredientsData {
  descricao: string;
  regions: {
    [key: string]: RegionData;
  };
  special_ingredients: {
    descricao: string;
    categoria: string;
    dado: string;
    ingredients: Array<{
      nome: string;
      id: number;
      circunstancia: string;
      localizacao: string;
    }>;
  };
  rare_ingredients: {
    descricao: string;
    categoria: string;
    dado: string;
    ingredients: Array<{
      nome: string;
      id: number;
      regioes: string[];
      circunstancia: string;
    }>;
  };
  unique_rare_ingredients: {
    descricao: string;
    categoria: string;
    dado: string;
    ingredients: Array<{
      nome: string;
      id: number;
      circunstancia: string;
      localizacao: string;
    }>;
  };
  total_regioes: number;
  estatisticas: {
    total_ingredientes_comum: number;
    total_ingredientes_incomum: number;
    total_ingredientes_especiais: number;
    total_ingredientes_raros: number;
    total_ingredientes_unicos: number;
  };
}

export interface CommonIngredientsData {
  total: number;
  descricao: string;
  ingredients: Ingredient[];
}

export interface UncommonIngredientsData {
  total: number;
  descricao: string;
  ingredients: Ingredient[];
}

export type RegionKey =
  | 'Coastal Highlands'
  | 'Gale Fields'
  | 'Gift of Shuritashi'
  | 'Land of Hot Water'
  | 'Mount Arbora'
  | 'Shallows'
  | 'Brackwater Wetlands';

export type TestType = 'natureza' | 'sobrevivencia';

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export type AdvantageType = 'normal' | 'vantagem' | 'desvantagem';

export interface ForageAttempt {
  id: string;
  timestamp: Date;
  region: RegionKey;
  testType: TestType;
  modifier: number;
  bonusDice?: {
    type: DiceType;
    value: number;
  };
  advantage: AdvantageType;
  dc: number;
  dcRange: string;
  roll: number;
  success: boolean;
  ingredient?: Ingredient;
  rarity: 'comum' | 'incomum' | 'raro' | 'unico';
}

export interface CollectedIngredient {
  id: string;
  ingredient: Ingredient;
  quantity: number;
  collectedAt: Date;
  used: boolean;
  usedAt?: Date;
  forageAttemptId: string;
  [key: string]: unknown;
}

export interface Potion {
  id: number;
  nome: string;
  raridade: string;
  descricao: string;
}

export interface PotionCategory {
  total: number;
  descricao: string;
  pocoes: Potion[];
}

export interface PotionRecipe {
  id: string;
  ingredients: Ingredient[];
  combatScore: number;
  utilityScore: number;
  whimsyScore: number;
  winningAttribute: 'combat' | 'utility' | 'whimsy';
  resultingPotion: Potion;
  createdAt: Date;
}

export interface CreatedPotion {
  id: string;
  potion: Potion;
  recipe: PotionRecipe;
  quantity: number;
  createdAt: Date;
  used: boolean;
  usedAt?: Date;
}

export interface PotionBrewingResult {
  recipe: PotionRecipe;
  success: boolean;
  message: string;
  cauldronBonus?: boolean;
  remainsPotion?: Potion;
  potionBrewerSuccess?: boolean;
  secondPotion?: Potion;
  percentageRoll?: number;
}
