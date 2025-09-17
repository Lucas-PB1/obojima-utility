export interface Ingredient {
  id: number;
  nome_ingles: string;
  nome_portugues: string;
  combat: number;
  utility: number;
  whimsy: number;
  descricao: string;
}

export interface IngredientByRegion {
  nome: string;
  id: number;
}

export interface RegionData {
  descricao: string;
  comum: {
    dado: string;
    ingredientes: IngredientByRegion[];
  };
  incomum: {
    dado: string;
    ingredientes: IngredientByRegion[];
  };
}

export interface IngredientsData {
  descricao: string;
  regioes: {
    [key: string]: RegionData;
  };
  ingredientes_especiais: {
    descricao: string;
    categoria: string;
    dado: string;
    ingredientes: Array<{
      nome_ingles: string;
      nome_portugues: string;
      id: number;
      circunstancia: string;
      localizacao: string;
    }>;
  };
  ingredientes_raros: {
    descricao: string;
    categoria: string;
    dado: string;
    ingredientes: Array<{
      nome_ingles: string;
      nome_portugues: string;
      id: number;
      regioes: string[];
      circunstancia: string;
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
  ingredientes: Ingredient[];
}

export interface UncommonIngredientsData {
  total: number;
  descricao: string;
  ingredientes: Ingredient[];
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
  rarity: 'comum' | 'incomum';
}

export interface CollectedIngredient {
  id: string;
  ingredient: Ingredient;
  quantity: number;
  collectedAt: Date;
  used: boolean;
  usedAt?: Date;
  forageAttemptId: string;
}
