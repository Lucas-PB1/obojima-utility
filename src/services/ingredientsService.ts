import { 
  Ingredient, 
  IngredientsData, 
  CommonIngredientsData, 
  UncommonIngredientsData,
  RegionKey,
  RegionData 
} from '@/types/ingredients';

class IngredientsService {
  private ingredientsData: IngredientsData | null = null;
  private commonIngredients: CommonIngredientsData | null = null;
  private uncommonIngredients: UncommonIngredientsData | null = null;

  async loadIngredientsData(): Promise<IngredientsData> {
    if (!this.ingredientsData) {
      const response = await fetch('/ingredientes/ingredientes-por-regiao.json');
      this.ingredientsData = await response.json();
    }
    return this.ingredientsData!;
  }

  async loadCommonIngredients(): Promise<CommonIngredientsData> {
    if (!this.commonIngredients) {
      const response = await fetch('/ingredientes/ingredientes comums/ingredientes-comuns.json');
      this.commonIngredients = await response.json();
    }
    return this.commonIngredients!;
  }

  async loadUncommonIngredients(): Promise<UncommonIngredientsData> {
    if (!this.uncommonIngredients) {
      const response = await fetch('/ingredientes/ingredientes incomuns/ingredientes-incomuns.json');
      this.uncommonIngredients = await response.json();
    }
    return this.uncommonIngredients!;
  }

  async getRegionData(region: RegionKey): Promise<RegionData | null> {
    const data = await this.loadIngredientsData();
    return data.regioes[region] || null;
  }

  async getIngredientById(id: number): Promise<Ingredient | null> {
    // Primeiro tenta nos ingredientes comuns
    const commonData = await this.loadCommonIngredients();
    const commonIngredient = commonData.ingredientes.find(ing => ing.id === id);
    if (commonIngredient) return commonIngredient;

    // Depois tenta nos incomuns
    const uncommonData = await this.loadUncommonIngredients();
    const uncommonIngredient = uncommonData.ingredientes.find(ing => ing.id === id);
    if (uncommonIngredient) return uncommonIngredient;

    return null;
  }

  async getRandomIngredientFromRegion(
    region: RegionKey, 
    rarity: 'comum' | 'incomum'
  ): Promise<Ingredient | null> {
    const regionData = await this.getRegionData(region);
    if (!regionData) return null;

    const ingredientList = rarity === 'comum' 
      ? regionData.comum.ingredientes 
      : regionData.incomum.ingredientes;

    if (ingredientList.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * ingredientList.length);
    const selectedIngredient = ingredientList[randomIndex];
    
    return await this.getIngredientById(selectedIngredient.id);
  }

  getRegionDisplayName(region: RegionKey): string {
    const regionNames: Record<RegionKey, string> = {
      'Coastal Highlands': 'Terras Altas Costeiras',
      'Gale Fields': 'Campos de Vendaval',
      'Gift of Shuritashi': 'Dom de Shuritashi',
      'Land of Hot Water': 'Terra da Água Quente',
      'Mount Arbora': 'Monte Arbora',
      'Shallows': 'Raso',
      'Brackwater Wetlands': 'Pântanos de Água Salobra'
    };
    return regionNames[region];
  }

  getRegionKeys(): RegionKey[] {
    return [
      'Coastal Highlands',
      'Gale Fields', 
      'Gift of Shuritashi',
      'Land of Hot Water',
      'Mount Arbora',
      'Shallows',
      'Brackwater Wetlands'
    ];
  }

  calculateDC(rarity: 'comum' | 'incomum', isNative: boolean = true): number {
    if (rarity === 'comum' && isNative) {
      return Math.floor(Math.random() * 6) + 10; // DC 10-15
    } else if (rarity === 'incomum' && isNative) {
      return Math.floor(Math.random() * 5) + 16; // DC 16-20
    } else if (rarity === 'incomum' && !isNative) {
      return Math.floor(Math.random() * 5) + 21; // DC 21-25
    }
    return 15; // Fallback
  }
}

export const ingredientsService = new IngredientsService();
