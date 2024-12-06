import { Strategy, BacktestResult } from '../../types/trading';

interface Individual {
  parameters: Record<string, number>;
  fitness: number;
}

export class DifferentialEvolution {
  private populationSize: number;
  private crossoverRate: number;
  private mutationFactor: number;
  private generations: number;

  constructor(
    populationSize = 50,
    crossoverRate = 0.7,
    mutationFactor = 0.8,
    generations = 30
  ) {
    this.populationSize = populationSize;
    this.crossoverRate = crossoverRate;
    this.mutationFactor = mutationFactor;
    this.generations = generations;
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<{
    bestParameters: Record<string, number>;
    bestFitness: number;
    convergenceHistory: number[];
  }> {
    let population = this.initializePopulation(strategy);
    const convergenceHistory: number[] = [];
    let bestSolution: Individual = { parameters: {}, fitness: -Infinity };

    // Evaluate initial population
    for (const individual of population) {
      const result = await evaluateFunction(individual.parameters);
      individual.fitness = this.calculateFitness(result);
      if (individual.fitness > bestSolution.fitness) {
        bestSolution = { ...individual };
      }
    }

    // Main evolution loop
    for (let generation = 0; generation < this.generations; generation++) {
      const newPopulation: Individual[] = [];

      for (let i = 0; i < this.populationSize; i++) {
        // Select three random distinct individuals
        const [a, b, c] = this.selectRandomIndividuals(population, i);

        // Create trial vector through mutation
        const mutant = this.mutation(a, b, c);

        // Create trial individual through crossover
        const trial = this.crossover(population[i], mutant, strategy);

        // Evaluate trial individual
        const result = await evaluateFunction(trial.parameters);
        trial.fitness = this.calculateFitness(result);

        // Selection
        if (trial.fitness > population[i].fitness) {
          newPopulation.push(trial);
          if (trial.fitness > bestSolution.fitness) {
            bestSolution = { ...trial };
          }
        } else {
          newPopulation.push(population[i]);
        }
      }

      population = newPopulation;
      convergenceHistory.push(bestSolution.fitness);
    }

    return {
      bestParameters: bestSolution.parameters,
      bestFitness: bestSolution.fitness,
      convergenceHistory
    };
  }

  private initializePopulation(strategy: Strategy): Individual[] {
    const population: Individual[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      const parameters: Record<string, number> = {};
      
      for (const param of strategy.parameters) {
        parameters[param.name] = param.min + Math.random() * (param.max - param.min);
      }

      population.push({ parameters, fitness: -Infinity });
    }

    return population;
  }

  private selectRandomIndividuals(population: Individual[], current: number): Individual[] {
    const indices = new Set<number>();
    while (indices.size < 3) {
      const index = Math.floor(Math.random() * population.length);
      if (index !== current) {
        indices.add(index);
      }
    }
    return Array.from(indices).map(i => population[i]);
  }

  private mutation(a: Individual, b: Individual, c: Individual): Individual {
    const parameters: Record<string, number> = {};
    
    for (const param in a.parameters) {
      parameters[param] = a.parameters[param] + 
        this.mutationFactor * (b.parameters[param] - c.parameters[param]);
    }

    return { parameters, fitness: -Infinity };
  }

  private crossover(
    target: Individual,
    mutant: Individual,
    strategy: Strategy
  ): Individual {
    const parameters: Record<string, number> = {};
    
    for (const param of strategy.parameters) {
      if (Math.random() < this.crossoverRate) {
        parameters[param.name] = Math.max(
          param.min,
          Math.min(param.max, mutant.parameters[param.name])
        );
      } else {
        parameters[param.name] = target.parameters[param.name];
      }
    }

    return { parameters, fitness: -Infinity };
  }

  private calculateFitness(result: BacktestResult): number {
    return (
      result.winRate * 0.3 +
      (1 - result.maxDrawdown) * 0.3 +
      result.profitFactor * 0.4
    );
  }
}