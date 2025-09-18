import { DiceType, AdvantageType } from '@/types/ingredients';

class DiceService {
  private static readonly DICE_NAMES: Record<DiceType, string> = {
    d4: 'D4',
    d6: 'D6', 
    d8: 'D8',
    d10: 'D10',
    d12: 'D12',
    d20: 'D20'
  };

  private static readonly ADVANTAGE_NAMES: Record<AdvantageType, string> = {
    normal: 'Normal',
    vantagem: 'Vantagem',
    desvantagem: 'Desvantagem'
  };

  rollDice(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  rollD20(): number {
    return this.rollDice(20);
  }

  rollBonusDice(type: DiceType): number {
    const sides = parseInt(type.substring(1));
    return this.rollDice(sides);
  }

  rollWithAdvantage(advantage: AdvantageType): { roll: number; secondRoll?: number } {
    const firstRoll = this.rollD20();
    
    if (advantage === 'normal') {
      return { roll: firstRoll };
    }
    
    const secondRoll = this.rollD20();
    const roll = advantage === 'vantagem' 
      ? Math.max(firstRoll, secondRoll)
      : Math.min(firstRoll, secondRoll);
    
    return { roll, secondRoll };
  }

  calculateTotalRoll(
    baseRoll: number,
    modifier: number,
    bonusDice?: { type: DiceType; value: number }
  ): number {
    return baseRoll + modifier + (bonusDice?.value || 0);
  }

  getDiceDisplayName(type: DiceType): string {
    return DiceService.DICE_NAMES[type];
  }

  getAdvantageDisplayName(advantage: AdvantageType): string {
    return DiceService.ADVANTAGE_NAMES[advantage];
  }

  simulateRolls(
    modifier: number,
    advantage: AdvantageType,
    bonusDice?: { type: DiceType; value: number },
    iterations: number = 1000,
    dc: number = 15
  ): {
    average: number;
    min: number;
    max: number;
    successRate: number;
    dc: number;
  } {
    const results: number[] = [];
    let successes = 0;
    
    for (let i = 0; i < iterations; i++) {
      const { roll } = this.rollWithAdvantage(advantage);
      const total = this.calculateTotalRoll(roll, modifier, bonusDice);
      results.push(total);
      
      if (total >= dc) successes++;
    }
    
    const average = results.reduce((sum, roll) => sum + roll, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const successRate = (successes / iterations) * 100;
    
    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      successRate: Math.round(successRate * 100) / 100,
      dc
    };
  }
}

export const diceService = new DiceService();
