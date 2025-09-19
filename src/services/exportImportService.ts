import { CollectedIngredient, ForageAttempt, PotionRecipe, CreatedPotion } from '../types/ingredients';

export interface ExportData {
  ingredients: CollectedIngredient[];
  attempts: ForageAttempt[];
  recipes: PotionRecipe[];
  createdPotions: CreatedPotion[];
  exportDate: string;
  version: string;
}

interface UnknownData {
  [key: string]: unknown;
}

class ExportImportService {
  private readonly VERSION = '1.0.0';

  /**
   * Exporta todos os dados do sistema para um arquivo TXT
   */
  public exportAllData(): void {
    const data: ExportData = {
      ingredients: this.getIngredients(),
      attempts: this.getAttempts(),
      recipes: this.getRecipes(),
      createdPotions: this.getCreatedPotions(),
      exportDate: new Date().toISOString(),
      version: this.VERSION
    };

    const content = this.formatDataAsText(data);
    this.downloadFile(content, 'obojima-backup-completo.txt');
  }

  /**
   * Exporta todos os dados do sistema para um arquivo JSON (para importação)
   */
  public exportAllDataAsJSON(): void {
    const data: ExportData = {
      ingredients: this.getIngredients(),
      attempts: this.getAttempts(),
      recipes: this.getRecipes(),
      createdPotions: this.getCreatedPotions(),
      exportDate: new Date().toISOString(),
      version: this.VERSION
    };

    const content = JSON.stringify(data, null, 2);
    this.downloadFile(content, 'obojima-backup-completo.json');
  }

  /**
   * Exporta apenas ingredientes para um arquivo TXT
   */
  public exportIngredients(): void {
    const ingredients = this.getIngredients();
    const content = this.formatIngredientsAsText(ingredients);
    this.downloadFile(content, 'obojima-ingredientes.txt');
  }

  /**
   * Exporta apenas ingredientes para um arquivo JSON
   */
  public exportIngredientsAsJSON(): void {
    const ingredients = this.getIngredients();
    const data = {
      ingredients,
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      type: 'ingredients'
    };
    const content = JSON.stringify(data, null, 2);
    this.downloadFile(content, 'obojima-ingredientes.json');
  }

  /**
   * Exporta apenas poções criadas para um arquivo TXT
   */
  public exportCreatedPotions(): void {
    const potions = this.getCreatedPotions();
    const content = this.formatCreatedPotionsAsText(potions);
    this.downloadFile(content, 'obojima-pocoes-criadas.txt');
  }

  /**
   * Exporta apenas poções criadas para um arquivo JSON
   */
  public exportCreatedPotionsAsJSON(): void {
    const potions = this.getCreatedPotions();
    const data = {
      createdPotions: potions,
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      type: 'createdPotions'
    };
    const content = JSON.stringify(data, null, 2);
    this.downloadFile(content, 'obojima-pocoes-criadas.json');
  }

  /**
   * Exporta apenas receitas para um arquivo TXT
   */
  public exportRecipes(): void {
    const recipes = this.getRecipes();
    const content = this.formatRecipesAsText(recipes);
    this.downloadFile(content, 'obojima-receitas.txt');
  }

  /**
   * Exporta apenas receitas para um arquivo JSON
   */
  public exportRecipesAsJSON(): void {
    const recipes = this.getRecipes();
    const data = {
      recipes,
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      type: 'recipes'
    };
    const content = JSON.stringify(data, null, 2);
    this.downloadFile(content, 'obojima-receitas.json');
  }

  /**
   * Exporta apenas logs de forrageamento para um arquivo TXT
   */
  public exportLogs(): void {
    const attempts = this.getAttempts();
    const content = this.formatLogsAsText(attempts);
    this.downloadFile(content, 'obojima-logs.txt');
  }

  /**
   * Exporta apenas logs de forrageamento para um arquivo JSON
   */
  public exportLogsAsJSON(): void {
    const attempts = this.getAttempts();
    const data = {
      attempts,
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      type: 'logs'
    };
    const content = JSON.stringify(data, null, 2);
    this.downloadFile(content, 'obojima-logs.json');
  }

  /**
   * Importa dados de um arquivo TXT ou JSON
   */
  public async importData(file: File): Promise<{ success: boolean; message: string; data?: ExportData }> {
    try {
      const content = await this.readFileContent(file);
      const data = this.parseTextData(content);
      
      if (!data) {
        return { success: false, message: 'Formato de arquivo inválido. Use arquivos JSON exportados pelo sistema.' };
      }

      // Validar versão
      if (data.version !== this.VERSION) {
        return { success: false, message: `Versão incompatível. Esperado: ${this.VERSION}, Recebido: ${data.version}` };
      }

      // Importar dados
      this.importIngredients(data.ingredients);
      this.importAttempts(data.attempts);
      this.importRecipes(data.recipes);
      this.importCreatedPotions(data.createdPotions);

      return { 
        success: true, 
        message: `Dados importados com sucesso! ${data.ingredients.length} ingredientes, ${data.attempts.length} logs, ${data.recipes.length} receitas, ${data.createdPotions.length} poções.`,
        data 
      };
    } catch (error) {
      return { success: false, message: `Erro ao importar dados: ${error}` };
    }
  }

  /**
   * Importa dados específicos (ingredientes, poções, etc.)
   */
  public async importSpecificData(file: File, expectedType: string): Promise<{ success: boolean; message: string }> {
    try {
      const content = await this.readFileContent(file);
      const data = JSON.parse(content);
      
      const validation = this.isValidSpecificData(data);
      if (!validation.isValid) {
        return { success: false, message: 'Formato de arquivo inválido' };
      }

      // Verificar se o tipo corresponde ao esperado
      if (validation.type !== expectedType && validation.type !== 'complete') {
        return { success: false, message: `Tipo de arquivo incorreto. Esperado: ${expectedType}, Recebido: ${validation.type}` };
      }

      // Validar versão
      if (data.version !== this.VERSION) {
        return { success: false, message: `Versão incompatível. Esperado: ${this.VERSION}, Recebido: ${data.version}` };
      }

      // Importar dados específicos
      if (validation.type === 'complete') {
        this.importIngredients(data.ingredients);
        this.importAttempts(data.attempts);
        this.importRecipes(data.recipes);
        this.importCreatedPotions(data.createdPotions);
        return { 
          success: true, 
          message: `Backup completo importado! ${data.ingredients.length} ingredientes, ${data.attempts.length} logs, ${data.recipes.length} receitas, ${data.createdPotions.length} poções.`
        };
      } else if (validation.type === 'ingredients') {
        this.importIngredients(data.ingredients);
        return { success: true, message: `${data.ingredients.length} ingredientes importados com sucesso!` };
      } else if (validation.type === 'createdPotions') {
        this.importCreatedPotions(data.createdPotions);
        return { success: true, message: `${data.createdPotions.length} poções importadas com sucesso!` };
      } else if (validation.type === 'recipes') {
        this.importRecipes(data.recipes);
        return { success: true, message: `${data.recipes.length} receitas importadas com sucesso!` };
      } else if (validation.type === 'logs') {
        this.importAttempts(data.attempts);
        return { success: true, message: `${data.attempts.length} logs importados com sucesso!` };
      }

      return { success: false, message: 'Tipo de dados não reconhecido' };
    } catch (error) {
      return { success: false, message: `Erro ao importar dados: ${error}` };
    }
  }

  /**
   * Formata todos os dados como texto
   */
  private formatDataAsText(data: ExportData): string {
    let content = '';
    
    content += '=== OBOJIMA UTILITIES - BACKUP COMPLETO ===\n';
    content += `Data de Exportação: ${new Date(data.exportDate).toLocaleString('pt-BR')}\n`;
    content += `Versão: ${data.version}\n\n`;

    // Ingredientes
    content += '=== INGREDIENTES COLETADOS ===\n';
    content += this.formatIngredientsAsText(data.ingredients);
    content += '\n\n';

    // Logs
    content += '=== LOGS DE FORRAGEAMENTO ===\n';
    content += this.formatLogsAsText(data.attempts);
    content += '\n\n';

    // Receitas
    content += '=== RECEITAS DE POÇÕES ===\n';
    content += this.formatRecipesAsText(data.recipes);
    content += '\n\n';

    // Poções Criadas
    content += '=== POÇÕES CRIADAS ===\n';
    content += this.formatCreatedPotionsAsText(data.createdPotions);

    return content;
  }

  /**
   * Formata ingredientes como texto
   */
  private formatIngredientsAsText(ingredients: CollectedIngredient[]): string {
    if (ingredients.length === 0) {
      return 'Nenhum ingrediente coletado.\n';
    }

    let content = `Total: ${ingredients.length} ingredientes\n\n`;
    
    ingredients.forEach((ingredient, index) => {
      content += `${index + 1}. ${ingredient.ingredient.nome_portugues} (${ingredient.ingredient.nome_ingles})\n`;
      content += `   Quantidade: ${ingredient.quantity}\n`;
      content += `   Status: ${ingredient.used ? 'Usado' : 'Disponível'}\n`;
      content += `   Coletado em: ${new Date(ingredient.collectedAt).toLocaleString('pt-BR')}\n`;
      content += `   Combat: ${ingredient.ingredient.combat} | Utility: ${ingredient.ingredient.utility} | Whimsy: ${ingredient.ingredient.whimsy}\n`;
      content += `   Descrição: ${ingredient.ingredient.descricao}\n`;
      if (ingredient.usedAt) {
        content += `   Usado em: ${new Date(ingredient.usedAt).toLocaleString('pt-BR')}\n`;
      }
      content += '\n';
    });

    return content;
  }

  /**
   * Formata poções criadas como texto
   */
  private formatCreatedPotionsAsText(potions: CreatedPotion[]): string {
    if (potions.length === 0) {
      return 'Nenhuma poção criada.\n';
    }

    let content = `Total: ${potions.length} poções criadas\n\n`;
    
    potions.forEach((potion, index) => {
      content += `${index + 1}. ${potion.potion.nome_portugues} (${potion.potion.nome_ingles})\n`;
      content += `   Raridade: ${potion.potion.raridade}\n`;
      content += `   Quantidade: ${potion.quantity}\n`;
      content += `   Status: ${potion.used ? 'Usada' : 'Disponível'}\n`;
      content += `   Categoria: ${potion.recipe.winningAttribute}\n`;
      content += `   Scores: Combat ${potion.recipe.combatScore} | Utility ${potion.recipe.utilityScore} | Whimsy ${potion.recipe.whimsyScore}\n`;
      content += `   Criada em: ${new Date(potion.createdAt).toLocaleString('pt-BR')}\n`;
      content += `   Descrição: ${potion.potion.descricao}\n`;
      if (potion.usedAt) {
        content += `   Usada em: ${new Date(potion.usedAt).toLocaleString('pt-BR')}\n`;
      }
      content += '\n';
    });

    return content;
  }

  /**
   * Formata receitas como texto
   */
  private formatRecipesAsText(recipes: PotionRecipe[]): string {
    if (recipes.length === 0) {
      return 'Nenhuma receita criada.\n';
    }

    let content = `Total: ${recipes.length} receitas\n\n`;
    
    recipes.forEach((recipe, index) => {
      content += `${index + 1}. ${recipe.resultingPotion.nome_portugues} (${recipe.resultingPotion.nome_ingles})\n`;
      content += `   Raridade: ${recipe.resultingPotion.raridade}\n`;
      content += `   Categoria: ${recipe.winningAttribute}\n`;
      content += `   Scores: Combat ${recipe.combatScore} | Utility ${recipe.utilityScore} | Whimsy ${recipe.whimsyScore}\n`;
      content += `   Criada em: ${new Date(recipe.createdAt).toLocaleString('pt-BR')}\n`;
      content += `   Ingredientes:\n`;
      recipe.ingredients.forEach((ing, i) => {
        content += `     ${i + 1}. ${ing.nome_portugues} (${ing.nome_ingles}) - C:${ing.combat} U:${ing.utility} W:${ing.whimsy}\n`;
      });
      content += `   Descrição: ${recipe.resultingPotion.descricao}\n\n`;
    });

    return content;
  }

  /**
   * Formata logs como texto
   */
  private formatLogsAsText(attempts: ForageAttempt[]): string {
    if (attempts.length === 0) {
      return 'Nenhum log de forrageamento.\n';
    }

    let content = `Total: ${attempts.length} tentativas\n\n`;
    
    attempts.forEach((attempt, index) => {
      content += `${index + 1}. ${new Date(attempt.timestamp).toLocaleString('pt-BR')}\n`;
      content += `   Região: ${attempt.region}\n`;
      content += `   Tipo de Teste: ${attempt.testType}\n`;
      content += `   Modificador: ${attempt.modifier}\n`;
      content += `   Vantagem: ${attempt.advantage}\n`;
      content += `   DC: ${attempt.dc} (${attempt.dcRange})\n`;
      content += `   Resultado: ${attempt.roll}\n`;
      content += `   Sucesso: ${attempt.success ? 'Sim' : 'Não'}\n`;
      content += `   Raridade: ${attempt.rarity}\n`;
      if (attempt.ingredient) {
        content += `   Ingrediente: ${attempt.ingredient.nome_portugues}\n`;
      }
      content += '\n';
    });

    return content;
  }

  /**
   * Faz download de um arquivo
   */
  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Lê o conteúdo de um arquivo
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Parseia dados de texto
   */
  private parseTextData(content: string): ExportData | null {
    try {
      // Tentar parsear como JSON primeiro (formato estruturado)
      if (content.trim().startsWith('{')) {
        const data = JSON.parse(content);
        // Validar se tem a estrutura esperada
        if (this.isValidExportData(data)) {
          return data;
        }
      }

      // Tentar parsear formato de texto simples
      return this.parseTextFormat();
    } catch (error) {
      console.error('Erro ao parsear dados:', error);
      return null;
    }
  }

  /**
   * Valida se os dados têm a estrutura esperada
   */
  private isValidExportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    const dataObj = data as UnknownData;
    return (
      Array.isArray(dataObj.ingredients) &&
      Array.isArray(dataObj.attempts) &&
      Array.isArray(dataObj.recipes) &&
      Array.isArray(dataObj.createdPotions) &&
      typeof dataObj.version === 'string' &&
      typeof dataObj.exportDate === 'string'
    );
  }

  /**
   * Valida se os dados são de um tipo específico (ingredientes, poções, etc.)
   */
  private isValidSpecificData(data: unknown): { isValid: boolean; type?: string } {
    if (!data || typeof data !== 'object') {
      return { isValid: false };
    }

    const dataObj = data as UnknownData;

    // Verificar se é backup completo
    if (this.isValidExportData(data)) {
      return { isValid: true, type: 'complete' };
    }

    // Verificar tipos específicos
    if (Array.isArray(dataObj.ingredients) && dataObj.type === 'ingredients') {
      return { isValid: true, type: 'ingredients' };
    }
    if (Array.isArray(dataObj.createdPotions) && dataObj.type === 'createdPotions') {
      return { isValid: true, type: 'createdPotions' };
    }
    if (Array.isArray(dataObj.recipes) && dataObj.type === 'recipes') {
      return { isValid: true, type: 'recipes' };
    }
    if (Array.isArray(dataObj.attempts) && dataObj.type === 'logs') {
      return { isValid: true, type: 'logs' };
    }

    return { isValid: false };
  }

  /**
   * Parseia formato de texto simples (básico)
   */
  private parseTextFormat(): ExportData | null {
    // Por enquanto, retorna null para formato de texto
    // Em uma implementação futura, poderia parsear o formato TXT
    console.warn('Formato de texto simples não suportado para importação. Use arquivos JSON.');
    return null;
  }

  /**
   * Métodos para obter dados dos serviços
   */
  private getIngredients(): CollectedIngredient[] {
    try {
      const stored = localStorage.getItem('obojima_collected_ingredients');
      if (!stored) return [];
      return JSON.parse(stored).map((item: CollectedIngredient) => ({
        ...item,
        collectedAt: new Date(item.collectedAt),
        usedAt: item.usedAt ? new Date(item.usedAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  private getAttempts(): ForageAttempt[] {
    try {
      const stored = localStorage.getItem('obojima_forage_attempts');
      if (!stored) return [];
      return JSON.parse(stored).map((item: ForageAttempt) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch {
      return [];
    }
  }

  private getRecipes(): PotionRecipe[] {
    try {
      const stored = localStorage.getItem('obojima_potion_recipes');
      if (!stored) return [];
      return JSON.parse(stored).map((item: PotionRecipe) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private getCreatedPotions(): CreatedPotion[] {
    try {
      const stored = localStorage.getItem('obojima_created_potions');
      if (!stored) return [];
      return JSON.parse(stored).map((item: CreatedPotion) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        usedAt: item.usedAt ? new Date(item.usedAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  /**
   * Métodos para importar dados
   */
  private importIngredients(ingredients: CollectedIngredient[]): void {
    localStorage.setItem('obojima_collected_ingredients', JSON.stringify(ingredients));
  }

  private importAttempts(attempts: ForageAttempt[]): void {
    localStorage.setItem('obojima_forage_attempts', JSON.stringify(attempts));
  }

  private importRecipes(recipes: PotionRecipe[]): void {
    localStorage.setItem('obojima_potion_recipes', JSON.stringify(recipes));
  }

  private importCreatedPotions(potions: CreatedPotion[]): void {
    localStorage.setItem('obojima_created_potions', JSON.stringify(potions));
  }
}

export const exportImportService = new ExportImportService();
