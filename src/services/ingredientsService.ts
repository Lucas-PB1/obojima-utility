import {
  Ingredient,
  IngredientsData,
  CommonIngredientsData,
  UncommonIngredientsData,
  RareIngredient,
  UniqueIngredientData,
  RegionKey,
  RegionData
} from '@/types/ingredients';

class IngredientsService {
  private ingredientsData: Record<string, IngredientsData> = {};
  private commonIngredients: Record<string, CommonIngredientsData> = {};
  private uncommonIngredients: Record<string, UncommonIngredientsData> = {};
  private rareIngredients: Record<string, { ingredients: RareIngredient[] }> = {};
  private uniqueIngredients: Record<string, { ingredients: UniqueIngredientData[] }> = {};

  private async loadData<T>(url: string, cache: Record<string, T>, language: string): Promise<T> {
    if (cache[language]) return cache[language];
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Fallback to 'pt' if specific lang fails, or throw
            if (language !== 'pt') {
                const fallbackUrl = url.replace(`/data/${language}/`, '/data/pt/');
                const fallbackResponse = await fetch(fallbackUrl);
                if (fallbackResponse.ok) {
                    const data = await fallbackResponse.json();
                    cache[language] = data; // Cache fallback as current lang to avoid refetch
                    return data;
                }
            }
            throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        cache[language] = data;
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  async loadIngredientsData(language: string = 'pt'): Promise<IngredientsData> {
    return this.loadData(
      `/data/${language}/ingredients/ingredients-by-region.json`,
      this.ingredientsData,
      language
    );
  }

  async loadCommonIngredients(language: string = 'pt'): Promise<CommonIngredientsData> {
    return this.loadData(
      `/data/${language}/ingredients/common/common-ingredients.json`,
      this.commonIngredients,
      language
    );
  }

  async loadUncommonIngredients(language: string = 'pt'): Promise<UncommonIngredientsData> {
    return this.loadData(
      `/data/${language}/ingredients/uncommon/uncommon-ingredients.json`,
      this.uncommonIngredients,
      language
    );
  }

  async loadRareIngredients(language: string = 'pt'): Promise<{ ingredients: RareIngredient[] }> {
    return this.loadData(
      `/data/${language}/ingredients/rare/rare-ingredients.json`,
      this.rareIngredients,
      language
    );
  }

  async loadUniqueIngredients(language: string = 'pt'): Promise<{ ingredients: UniqueIngredientData[] }> {
    const data = await this.loadIngredientsData(language);
    // Note: Assuming unique_rare_ingredients exists in the JSON structure. 
    // If not present in JSON, this will fail. Usage of safe navigation or partial implementation might be safer if unsure.
    this.uniqueIngredients[language] = { ingredients: data.unique_rare_ingredients?.ingredients || [] };
    return this.uniqueIngredients[language];
  }

  async getRegionData(region: RegionKey, language: string = 'pt'): Promise<RegionData | null> {
    const data = await this.loadIngredientsData(language);
    return data.regions[region] || null;
  }

  async getIngredientById(
    id: number,
    language: string = 'pt',
    rarity?: 'comum' | 'incomum' | 'raro' | 'unico'
  ): Promise<Ingredient | null> {
    if (rarity === 'comum') {
      const commonData = await this.loadCommonIngredients(language);
      const commonIngredient = commonData.ingredients.find((ing) => ing.id === id);
      return commonIngredient ? { ...commonIngredient, raridade: 'comum' } : null;
    }

    if (rarity === 'incomum') {
      const uncommonData = await this.loadUncommonIngredients(language);
      const uncommonIngredient = uncommonData.ingredients.find((ing) => ing.id === id);
      return uncommonIngredient ? { ...uncommonIngredient, raridade: 'incomum' } : null;
    }

    if (rarity === 'raro') {
      const rareData = await this.loadRareIngredients(language);
      const rareIngredient = rareData.ingredients.find((ing) => ing.id === id);
      return rareIngredient ? { ...rareIngredient, raridade: 'raro' } : null;
    }

    if (rarity === 'unico') {
      const uniqueData = await this.loadUniqueIngredients(language);
      const uniqueIngredient = uniqueData.ingredients.find((ing) => ing.id === id);
      if (uniqueIngredient) {
        return {
          id: uniqueIngredient.id,
          nome: uniqueIngredient.nome,
          combat: 20,
          utility: 20,
          whimsy: 20,
          descricao: `${uniqueIngredient.circunstancia}. Localização: ${uniqueIngredient.localizacao}`,
          raridade: 'unico'
        };
      }
      return null;
    }

    const commonData = await this.loadCommonIngredients(language);
    const commonIngredient = commonData.ingredients.find((ing) => ing.id === id);
    if (commonIngredient) return { ...commonIngredient, raridade: 'comum' };

    const uncommonData = await this.loadUncommonIngredients(language);
    const uncommonIngredient = uncommonData.ingredients.find((ing) => ing.id === id);
    if (uncommonIngredient) return { ...uncommonIngredient, raridade: 'incomum' };

    const rareData = await this.loadRareIngredients(language);
    const rareIngredient = rareData.ingredients.find((ing) => ing.id === id);
    if (rareIngredient) return { ...rareIngredient, raridade: 'raro' };

    const uniqueData = await this.loadUniqueIngredients(language);
    const uniqueIngredient = uniqueData.ingredients.find((ing) => ing.id === id);
    if (uniqueIngredient) {
      return {
        id: uniqueIngredient.id,
        nome: uniqueIngredient.nome,
        combat: 20,
        utility: 20,
        whimsy: 20,
        descricao: `${uniqueIngredient.circunstancia}. Localização: ${uniqueIngredient.localizacao}`,
        raridade: 'unico'
      };
    }

    return null;
  }

  async getRandomIngredientFromRegion(
    region: RegionKey,
    rarity: 'comum' | 'incomum' | 'raro' | 'unico',
    language: string = 'pt'
  ): Promise<Ingredient | null> {
    const regionData = await this.getRegionData(region, language);
    if (!regionData) return null;

    const ingredientList =
      rarity === 'comum' ? regionData.common.ingredients : regionData.uncommon.ingredients;

    if (ingredientList.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * ingredientList.length);
    const selectedIngredient = ingredientList[randomIndex];

    return await this.getIngredientById(selectedIngredient.id, language);
  }

  async getRandomUncommonIngredientFromAnyRegion(language: string = 'pt'): Promise<Ingredient | null> {
    const uncommonData = await this.loadUncommonIngredients(language);
    if (uncommonData.ingredients.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * uncommonData.ingredients.length);
    return { ...uncommonData.ingredients[randomIndex], raridade: 'incomum' };
  }

  async getRandomRareIngredient(language: string = 'pt'): Promise<Ingredient | null> {
    const rareData = await this.loadRareIngredients(language);
    if (rareData.ingredients.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * rareData.ingredients.length);
    return { ...rareData.ingredients[randomIndex], raridade: 'raro' };
  }

  async getRandomUniqueIngredient(language: string = 'pt'): Promise<Ingredient | null> {
    const uniqueData = await this.loadUniqueIngredients(language);
    if (uniqueData.ingredients.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * uniqueData.ingredients.length);
    const uniqueDataItem = uniqueData.ingredients[randomIndex];

    return {
      id: uniqueDataItem.id,
      nome: uniqueDataItem.nome,
      combat: 20,
      utility: 20,
      whimsy: 20,
      descricao: `${uniqueDataItem.circunstancia}. Localização: ${uniqueDataItem.localizacao}`,
      raridade: 'unico'
    };
  }

  private static readonly REGION_NAMES: Record<string, Record<RegionKey, string>> = {
    pt: {
        'Coastal Highlands': 'Terras Altas Costeiras',
        'Gale Fields': 'Campos de Vendaval',
        'Gift of Shuritashi': 'Dom de Shuritashi',
        'Land of Hot Water': 'Terra da Água Quente',
        'Mount Arbora': 'Monte Arbora',
        'Shallows': 'Raso',
        'Brackwater Wetlands': 'Pântanos de Água Salobra'
    },
    en: {
        'Coastal Highlands': 'Coastal Highlands',
        'Gale Fields': 'Gale Fields',
        'Gift of Shuritashi': 'Gift of Shuritashi',
        'Land of Hot Water': 'Land of Hot Water',
        'Mount Arbora': 'Mount Arbora',
        'Shallows': 'Shallows',
        'Brackwater Wetlands': 'Brackwater Wetlands'
    },
    es: {
        'Coastal Highlands': 'Tierras Altas Costeras',
        'Gale Fields': 'Campos de Vendaval',
        'Gift of Shuritashi': 'Don de Shuritashi',
        'Land of Hot Water': 'Tierra de Agua Caliente',
        'Mount Arbora': 'Monte Arbora',
        'Shallows': 'Bajíos',
        'Brackwater Wetlands': 'Humedales de Agua Estancada'
    }
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

  getRegionDisplayName(region: RegionKey, language: string = 'pt'): string {
    const lang = (IngredientsService.REGION_NAMES[language]) ? language : 'pt';
    return IngredientsService.REGION_NAMES[lang][region] || region;
  }

  getRegionKeys(): RegionKey[] {
    return IngredientsService.REGION_KEYS;
  }

  calculateDC(
    rarity: 'comum' | 'incomum',
    isNative: boolean = true
  ): { dc: number; range: string } {
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
