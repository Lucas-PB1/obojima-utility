import { ForageAttempt, CollectedIngredient } from '@/types/ingredients';

export interface ActivityStats {
  totalAttempts: number;
  successRate: number;
  averageRoll: number;
  ingredientsCollected: number;
}

export interface CollectionStats {
  totalCollected: number;
  totalUsed: number;
  totalAttempts: number;
  successRate: number;
}

export class StatsService {
  private static calculateSuccessRate(successes: number, total: number): number {
    return total > 0 ? (successes / total) * 100 : 0;
  }

  static calculateActivityStats(attempts: ForageAttempt[]): ActivityStats {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        successRate: 0,
        averageRoll: 0,
        ingredientsCollected: 0
      };
    }

    const successes = attempts.filter(a => a.success).length;
    const successRate = this.calculateSuccessRate(successes, attempts.length);
    const totalRolls = attempts.reduce((sum, a) => sum + a.roll, 0);
    const averageRoll = totalRolls / attempts.length;
    const ingredientsCollected = attempts.filter(a => a.success && a.ingredient).length;

    return {
      totalAttempts: attempts.length,
      successRate,
      averageRoll,
      ingredientsCollected
    };
  }

  static calculateCollectionStats(
    ingredients: CollectedIngredient[],
    attempts: ForageAttempt[]
  ): CollectionStats {
    const totalCollected = ingredients.length;
    const totalUsed = ingredients.filter(i => i.used).length;
    const totalAttempts = attempts.length;
    const successes = attempts.filter(a => a.success).length;
    const successRate = this.calculateSuccessRate(successes, totalAttempts);

    return {
      totalCollected,
      totalUsed,
      totalAttempts,
      successRate
    };
  }

  static formatStatsForDisplay(stats: ActivityStats | CollectionStats) {
    return {
      totalAttempts: stats.totalAttempts,
      successRate: `${stats.successRate.toFixed(1)}%`,
      averageRoll: 'averageRoll' in stats ? stats.averageRoll.toFixed(1) : undefined,
      ingredientsCollected: 'ingredientsCollected' in stats ? stats.ingredientsCollected : undefined,
      totalCollected: 'totalCollected' in stats ? stats.totalCollected : undefined,
      totalUsed: 'totalUsed' in stats ? stats.totalUsed : undefined,
    };
  }
}
