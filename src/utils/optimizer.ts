import { Strategy, BacktestResult } from '../types/trading';
import { runBacktest } from '../services/backtestService';

interface OptimizationRange {
  parameter: string;
  min: number;
  max: number;
  step: number;
}

interface OptimizationResult {
  parameters: Record<string, number>;
  result: BacktestResult;
  score: number;
}

export class StrategyOptimizer {
  private strategy: Strategy;
  private ranges: OptimizationRange[];
  private backtestParams: {
    startDate: Date;
    endDate: Date;
    initialBalance: number;
    symbol: string;
  };

  constructor(
    strategy: Strategy,
    ranges: OptimizationRange[],
    backtestParams: {
      startDate: Date;
      endDate: Date;
      initialBalance: number;
      symbol: string;
    }
  ) {
    this.strategy = strategy;
    this.ranges = ranges;
    this.backtestParams = backtestParams;
  }

  private calculateScore(result: BacktestResult): number {
    // Custom scoring function that considers multiple metrics
    const profitFactor = result.profitFactor || 1;
    const winRate = result.winRate || 0;
    const maxDrawdown = result.maxDrawdown || 1;
    
    // Weighted scoring based on important metrics
    return (
      (profitFactor * 0.4) +
      (winRate * 0.3) +
      ((1 - maxDrawdown) * 0.3)
    );
  }

  private async evaluateParameters(parameters: Record<string, number>): Promise<OptimizationResult> {
    // Create a copy of the strategy with updated parameters
    const strategyWithParams = {
      ...this.strategy,
      parameters: Object.entries(parameters).map(([name, value]) => ({
        name,
        value,
        min: 0,
        max: 0,
        step: 0
      }))
    };

    const result = await runBacktest(strategyWithParams, this.backtestParams);
    const score = this.calculateScore(result);

    return {
      parameters,
      result,
      score
    };
  }

  async optimize(maxIterations: number = 50): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    const parameterCombinations = this.generateParameterCombinations();

    for (let i = 0; i < Math.min(maxIterations, parameterCombinations.length); i++) {
      const parameters = parameterCombinations[i];
      const result = await this.evaluateParameters(parameters);
      results.push(result);
    }

    // Sort results by score in descending order
    return results.sort((a, b) => b.score - a.score);
  }

  private generateParameterCombinations(): Record<string, number>[] {
    const combinations: Record<string, number>[] = [{}];

    this.ranges.forEach(range => {
      const newCombinations: Record<string, number>[] = [];
      
      for (let value = range.min; value <= range.max; value += range.step) {
        combinations.forEach(combo => {
          newCombinations.push({
            ...combo,
            [range.parameter]: value
          });
        });
      }

      combinations.length = 0;
      combinations.push(...newCombinations);
    });

    return combinations;
  }
}