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

  private async loadData<T>(url: string, cache: T | null): Promise<T> {
    if (cache) return cache;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async loadIngredientsData(): Promise<IngredientsData> {
    this.ingredientsData = await this.loadData('/ingredientes/ingredientes-por-regiao.json', this.ingredientsData);
    return this.ingredientsData;
  }

  async loadCommonIngredients(): Promise<CommonIngredientsData> {
    this.commonIngredients = await this.loadData('/ingredientes/ingredientes comums/ingredientes-comuns.json', this.commonIngredients);
    return this.commonIngredients;
  }

  async loadUncommonIngredients(): Promise<UncommonIngredientsData> {
    this.uncommonIngredients = await this.loadData('/ingredientes/ingredientes incomuns/ingredientes-incomuns.json', this.uncommonIngredients);
    return this.uncommonIngredients;
  }

  async getRegionData(region: RegionKey): Promise<RegionData | null> {
    const data = await this.loadIngredientsData();
    return data.regioes[region] || null;
  }

  async getIngredientById(id: number): Promise<Ingredient | null> {
    const commonData = await this.loadCommonIngredients();
    const commonIngredient = commonData.ingredientes.find(ing => ing.id === id);
    if (commonIngredient) return commonIngredient;

    const uncommonData = await this.loadUncommonIngredients();
    return uncommonData.ingredientes.find(ing => ing.id === id) || null;
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

  private static readonly REGION_NAMES: Record<RegionKey, string> = {
    'Coastal Highlands': 'Terras Altas Costeiras',
    'Gale Fields': 'Campos de Vendaval',
    'Gift of Shuritashi': 'Dom de Shuritashi',
    'Land of Hot Water': 'Terra da Água Quente',
    'Mount Arbora': 'Monte Arbora',
    'Shallows': 'Raso',
    'Brackwater Wetlands': 'Pântanos de Água Salobra'
  };

  private static readonly REGION_KEYS: RegionKey[] = [
    'Coastal Highlands',
    'Gale Fields', 
    'Gift of Shuritashi',
    'Land of Hot Water',
    'Mount Arbora',
    'Shallows',
    'Brackwater Wetlands'
  ];

  getRegionDisplayName(region: RegionKey): string {
    return IngredientsService.REGION_NAMES[region];
  }

  getRegionKeys(): RegionKey[] {
    return IngredientsService.REGION_KEYS;
  }

  calculateDC(rarity: 'comum' | 'incomum', isNative: boolean = true): { dc: number; range: string } {
    if (rarity === 'comum' && isNative) {
      const dc = Math.floor(Math.random() * 6) + 10;
      return { dc, range: '10-15' };
    }
    
    if (rarity === 'incomum' && isNative) {
      const dc = Math.floor(Math.random() * 5) + 16;
      return { dc, range: '16-20' };
    }
    
    if (rarity === 'incomum' && !isNative) {
      const dc = Math.floor(Math.random() * 5) + 21;
      return { dc, range: '21-25' };
    }
    
    return { dc: 15, range: '10-15' };
  }
}

export const ingredientsService = new IngredientsService();
