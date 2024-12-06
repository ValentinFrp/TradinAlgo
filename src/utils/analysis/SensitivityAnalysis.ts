import { Strategy, BacktestResult } from '../../types/trading';

export interface SensitivityResult {
  parameter: string;
  values: number[];
  metrics: {
    winRate: number[];
    profitFactor: number[];
    maxDrawdown: number[];
    sharpeRatio: number[];
  };
}

export class SensitivityAnalyzer {
  private strategy: Strategy;
  private evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>;
  private samples: number;

  constructor(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>,
    samples = 10
  ) {
    this.strategy = strategy;
    this.evaluateFunction = evaluateFunction;
    this.samples = samples;
  }

  async analyze(): Promise<SensitivityResult[]> {
    const results: SensitivityResult[] = [];

    for (const param of this.strategy.parameters) {
      const values = this.generateParameterValues(param.min, param.max, this.samples);
      const metrics = {
        winRate: [],
        profitFactor: [],
        maxDrawdown: [],
        sharpeRatio: []
      };

      // Test each parameter value while keeping others at their default
      for (const value of values) {
        const testParams = { ...this.getDefaultParameters() };
        testParams[param.name] = value;

        const result = await this.evaluateFunction(testParams);
        metrics.winRate.push(result.winRate);
        metrics.profitFactor.push(result.profitFactor);
        metrics.maxDrawdown.push(result.maxDrawdown);
        metrics.sharpeRatio.push(result.sharpeRatio);
      }

      results.push({
        parameter: param.name,
        values,
        metrics
      });
    }

    return results;
  }

  private generateParameterValues(min: number, max: number, count: number): number[] {
    const values: number[] = [];
    const step = (max - min) / (count - 1);
    
    for (let i = 0; i < count; i++) {
      values.push(min + step * i);
    }
    
    return values;
  }

  private getDefaultParameters(): Record<string, number> {
    const params: Record<string, number> = {};
    for (const param of this.strategy.parameters) {
      params[param.name] = param.value;
    }
    return params;
  }
}