import { Strategy, BacktestResult } from '../../types/trading';
import { GaussianProcess } from './GaussianProcess';

interface BayesianOptimizationResult {
  bestParameters: Record<string, number>;
  bestFitness: number;
  acquisitionHistory: Array<{
    iteration: number;
    parameters: Record<string, number>;
    expectedImprovement: number;
    actualFitness: number;
  }>;
  uncertaintyHistory: Array<{
    parameters: Record<string, number>;
    mean: number;
    standardDeviation: number;
  }>;
}

export class BayesianOptimizer {
  private iterations: number;
  private explorationFactor: number;
  private gaussianProcess: GaussianProcess;
  private observedPoints: Array<{
    parameters: Record<string, number>;
    fitness: number;
  }>;

  constructor(iterations = 50, explorationFactor = 0.1) {
    this.iterations = iterations;
    this.explorationFactor = explorationFactor;
    this.gaussianProcess = new GaussianProcess();
    this.observedPoints = [];
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<BayesianOptimizationResult> {
    // Initialize with random points
    await this.initializeRandomPoints(strategy, evaluateFunction, 5);

    const acquisitionHistory = [];
    const uncertaintyHistory = [];
    let bestSolution = this.observedPoints[0];

    for (let i = 0; i < this.iterations; i++) {
      // Update Gaussian Process model
      this.gaussianProcess.fit(
        this.observedPoints.map(p => this.parameterToVector(p.parameters, strategy)),
        this.observedPoints.map(p => p.fitness)
      );

      // Find next point to evaluate using Expected Improvement
      const nextPoint = this.findNextPoint(strategy);
      const result = await evaluateFunction(nextPoint.parameters);
      const fitness = this.calculateFitness(result);

      this.observedPoints.push({
        parameters: nextPoint.parameters,
        fitness
      });

      if (fitness > bestSolution.fitness) {
        bestSolution = { parameters: nextPoint.parameters, fitness };
      }

      // Record history
      acquisitionHistory.push({
        iteration: i,
        parameters: nextPoint.parameters,
        expectedImprovement: nextPoint.expectedImprovement,
        actualFitness: fitness
      });

      uncertaintyHistory.push({
        parameters: nextPoint.parameters,
        mean: nextPoint.mean,
        standardDeviation: nextPoint.standardDeviation
      });
    }

    return {
      bestParameters: bestSolution.parameters,
      bestFitness: bestSolution.fitness,
      acquisitionHistory,
      uncertaintyHistory
    };
  }

  private async initializeRandomPoints(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>,
    count: number
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      const parameters = this.generateRandomParameters(strategy);
      const result = await evaluateFunction(parameters);
      const fitness = this.calculateFitness(result);
      this.observedPoints.push({ parameters, fitness });
    }
  }

  private findNextPoint(strategy: Strategy): {
    parameters: Record<string, number>;
    expectedImprovement: number;
    mean: number;
    standardDeviation: number;
  } {
    let bestEI = -Infinity;
    let bestPoint = null;
    const numSamples = 1000;

    for (let i = 0; i < numSamples; i++) {
      const parameters = this.generateRandomParameters(strategy);
      const vector = this.parameterToVector(parameters, strategy);
      const [mean, std] = this.gaussianProcess.predict(vector);
      const ei = this.expectedImprovement(mean, std, this.getBestFitness());

      if (ei > bestEI) {
        bestEI = ei;
        bestPoint = { parameters, expectedImprovement: ei, mean, standardDeviation: std };
      }
    }

    return bestPoint!;
  }

  private expectedImprovement(mean: number, std: number, bestFitness: number): number {
    const z = (mean - bestFitness - this.explorationFactor) / std;
    const cdf = this.normalCDF(z);
    const pdf = this.normalPDF(z);
    return (mean - bestFitness - this.explorationFactor) * cdf + std * pdf;
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + Math.erf(x / Math.sqrt(2)));
  }

  private normalPDF(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  private generateRandomParameters(strategy: Strategy): Record<string, number> {
    const parameters: Record<string, number> = {};
    for (const param of strategy.parameters) {
      parameters[param.name] = param.min + Math.random() * (param.max - param.min);
    }
    return parameters;
  }

  private parameterToVector(
    parameters: Record<string, number>,
    strategy: Strategy
  ): number[] {
    return strategy.parameters.map(param => parameters[param.name]);
  }

  private getBestFitness(): number {
    return Math.max(...this.observedPoints.map(p => p.fitness));
  }

  private calculateFitness(result: BacktestResult): number {
    return (
      result.winRate * 0.3 +
      (1 - result.maxDrawdown) * 0.3 +
      result.profitFactor * 0.4
    );
  }
}