import { DiceType, AdvantageType } from '@/types/ingredients';

class DiceService {
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
    
    if (advantage === 'vantagem') {
      const secondRoll = this.rollD20();
      return {
        roll: Math.max(firstRoll, secondRoll),
        secondRoll
      };
    } else if (advantage === 'desvantagem') {
      const secondRoll = this.rollD20();
      return {
        roll: Math.min(firstRoll, secondRoll),
        secondRoll
      };
    }
    
    return { roll: firstRoll };
  }

  calculateTotalRoll(
    baseRoll: number,
    modifier: number,
    bonusDice?: { type: DiceType; value: number }
  ): number {
    let total = baseRoll + modifier;
    
    if (bonusDice) {
      total += bonusDice.value; // Usar o valor já rolado, não rolar novamente
    }
    
    return total;
  }

  getDiceDisplayName(type: DiceType): string {
    const names: Record<DiceType, string> = {
      d4: 'D4',
      d6: 'D6', 
      d8: 'D8',
      d10: 'D10',
      d12: 'D12',
      d20: 'D20'
    };
    return names[type];
  }

  getAdvantageDisplayName(advantage: AdvantageType): string {
    const names: Record<AdvantageType, string> = {
      normal: 'Normal',
      vantagem: 'Vantagem',
      desvantagem: 'Desvantagem'
    };
    return names[advantage];
  }

  // Simular múltiplas rolagens para estatísticas
  simulateRolls(
    modifier: number,
    advantage: AdvantageType,
    bonusDice?: { type: DiceType; value: number },
    iterations: number = 1000
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
      
      // Assumir DC 15 para cálculo de taxa de sucesso
      if (total >= 15) successes++;
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
      dc: 15
    };
  }
}

export const diceService = new DiceService();
