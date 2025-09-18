import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';

export interface BackupData {
  collectedIngredients: CollectedIngredient[];
  forageAttempts: ForageAttempt[];
  stats: Record<string, unknown>;
  exportedAt: string;
  version: string;
}

export class BackupService {
  private static readonly VERSION = '1.0.0';

  private static createDownloadLink(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  static exportData(
    ingredients: CollectedIngredient[],
    attempts: ForageAttempt[],
    stats: Record<string, unknown>
  ): void {
    const backupData: BackupData = {
      collectedIngredients: ingredients,
      forageAttempts: attempts,
      stats,
      exportedAt: new Date().toISOString(),
      version: this.VERSION
    };

    const data = JSON.stringify(backupData, null, 2);
    const filename = `obojima-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    this.createDownloadLink(data, filename);
  }

  static importData(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (!this.validateBackup(data)) {
            throw new Error('Formato de backup inválido');
          }
          
          resolve(data as BackupData);
        } catch {
          reject(new Error('Erro ao processar arquivo de backup'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  static clearAllData(): void {
    localStorage.removeItem('obojima_collected_ingredients');
    localStorage.removeItem('obojima_forage_attempts');
    localStorage.removeItem('obojima_daily_counter');
  }

  static validateBackup(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const backup = data as Record<string, unknown>;
    return (
      Array.isArray(backup.collectedIngredients) &&
      Array.isArray(backup.forageAttempts) &&
      typeof backup.exportedAt === 'string' &&
      typeof backup.version === 'string'
    );
  }
}
