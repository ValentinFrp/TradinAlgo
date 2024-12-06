import { Strategy, BacktestResult } from '../../types/trading';

interface Ant {
  parameters: Record<string, number>;
  fitness: number;
}

interface Pheromone {
  [key: string]: number[];
}

export class AntColonyOptimizer {
  private antCount: number;
  private iterations: number;
  private evaporationRate: number;
  private alpha: number; // Pheromone importance
  private beta: number;  // Heuristic importance
  private discretizationSteps: number;

  constructor(
    antCount = 30,
    iterations = 50,
    evaporationRate = 0.1,
    alpha = 1.0,
    beta = 2.0,
    discretizationSteps = 100
  ) {
    this.antCount = antCount;
    this.iterations = iterations;
    this.evaporationRate = evaporationRate;
    this.alpha = alpha;
    this.beta = beta;
    this.discretizationSteps = discretizationSteps;
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<{
    bestParameters: Record<string, number>;
    bestFitness: number;
    pheromoneHistory: Pheromone[];
    fitnessHistory: number[];
  }> {
    let pheromones = this.initializePheromones(strategy);
    let bestAnt: Ant = { parameters: {}, fitness: -Infinity };
    const pheromoneHistory: Pheromone[] = [];
    const fitnessHistory: number[] = [];

    for (let iteration = 0; iteration < this.iterations; iteration++) {
      const ants: Ant[] = [];

      // Generate solutions for all ants
      for (let i = 0; i < this.antCount; i++) {
        const ant = await this.constructSolution(strategy, pheromones, evaluateFunction);
        ants.push(ant);

        if (ant.fitness > bestAnt.fitness) {
          bestAnt = { ...ant };
        }
      }

      // Update pheromones
      this.updatePheromones(pheromones, ants, strategy);
      
      pheromoneHistory.push({ ...pheromones });
      fitnessHistory.push(bestAnt.fitness);
    }

    return {
      bestParameters: bestAnt.parameters,
      bestFitness: bestAnt.fitness,
      pheromoneHistory,
      fitnessHistory
    };
  }

  private initializePheromones(strategy: Strategy): Pheromone {
    const pheromones: Pheromone = {};
    const initialPheromone = 1.0 / this.discretizationSteps;

    for (const param of strategy.parameters) {
      pheromones[param.name] = new Array(this.discretizationSteps).fill(initialPheromone);
    }

    return pheromones;
  }

  private async constructSolution(
    strategy: Strategy,
    pheromones: Pheromone,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<Ant> {
    const parameters: Record<string, number> = {};

    for (const param of strategy.parameters) {
      const probabilities = this.calculateProbabilities(pheromones[param.name]);
      const selectedIndex = this.selectIndex(probabilities);
      parameters[param.name] = this.discreteToContinuous(
        selectedIndex,
        param.min,
        param.max
      );
    }

    const result = await evaluateFunction(parameters);
    const fitness = this.calculateFitness(result);

    return { parameters, fitness };
  }

  private calculateProbabilities(pheromones: number[]): number[] {
    const total = pheromones.reduce((sum, p) => sum + Math.pow(p, this.alpha), 0);
    return pheromones.map(p => Math.pow(p, this.alpha) / total);
  }

  private selectIndex(probabilities: number[]): number {
    const r = Math.random();
    let sum = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i];
      if (r <= sum) return i;
    }
    
    return probabilities.length - 1;
  }

  private discreteToContinuous(index: number, min: number, max: number): number {
    return min + (index / (this.discretizationSteps - 1)) * (max - min);
  }

  private updatePheromones(pheromones: Pheromone, ants: Ant[], strategy: Strategy): void {
    // Evaporation
    for (const param in pheromones) {
      for (let i = 0; i < pheromones[param].length; i++) {
        pheromones[param][i] *= (1 - this.evaporationRate);
      }
    }

    // Deposit new pheromones
    for (const ant of ants) {
      const deposit = ant.fitness;
      
      for (const param of strategy.parameters) {
        const index = this.continuousToDiscrete(
          ant.parameters[param.name],
          param.min,
          param.max
        );
        pheromones[param.name][index] += deposit;
      }
    }
  }

  private continuousToDiscrete(value: number, min: number, max: number): number {
    const normalized = (value - min) / (max - min);
    return Math.floor(normalized * (this.discretizationSteps - 1));
  }

  private calculateFitness(result: BacktestResult): number {
    return (
      result.winRate * 0.3 +
      (1 - result.maxDrawdown) * 0.3 +
      result.profitFactor * 0.4
    );
  }
}