import { Strategy, BacktestResult } from '../../types/trading';

interface Chromosome {
  parameters: Record<string, number>;
  fitness: number;
}

export class GeneticOptimizer {
  private populationSize: number;
  private mutationRate: number;
  private generations: number;

  constructor(
    populationSize = 50,
    mutationRate = 0.1,
    generations = 20
  ) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.generations = generations;
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<Chromosome[]> {
    let population = this.initializePopulation(strategy);
    
    // Evaluate initial population
    for (const chromosome of population) {
      const result = await evaluateFunction(chromosome.parameters);
      chromosome.fitness = this.calculateFitness(result);
    }

    for (let gen = 0; gen < this.generations; gen++) {
      population = await this.evolve(population, strategy, evaluateFunction);
    }

    return population.sort((a, b) => b.fitness - a.fitness);
  }

  private initializePopulation(strategy: Strategy): Chromosome[] {
    const population: Chromosome[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      const parameters: Record<string, number> = {};
      
      for (const param of strategy.parameters) {
        parameters[param.name] = param.min + Math.random() * (param.max - param.min);
      }

      population.push({ parameters, fitness: 0 });
    }

    return population;
  }

  private async evolve(
    population: Chromosome[],
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<Chromosome[]> {
    const newPopulation: Chromosome[] = [];

    // Elitism: Keep best solutions
    const eliteCount = Math.floor(this.populationSize * 0.1);
    const sortedPopulation = [...population].sort((a, b) => b.fitness - a.fitness);
    newPopulation.push(...sortedPopulation.slice(0, eliteCount));

    // Create rest of new population
    while (newPopulation.length < this.populationSize) {
      const parent1 = this.selectParent(population);
      const parent2 = this.selectParent(population);
      const child = this.crossover(parent1, parent2);
      this.mutate(child, strategy);
      
      const result = await evaluateFunction(child.parameters);
      child.fitness = this.calculateFitness(result);
      
      newPopulation.push(child);
    }

    return newPopulation;
  }

  private selectParent(population: Chromosome[]): Chromosome {
    // Tournament selection
    const tournamentSize = 3;
    let best = population[Math.floor(Math.random() * population.length)];
    
    for (let i = 0; i < tournamentSize - 1; i++) {
      const contestant = population[Math.floor(Math.random() * population.length)];
      if (contestant.fitness > best.fitness) {
        best = contestant;
      }
    }
    
    return best;
  }

  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const childParams: Record<string, number> = {};
    
    for (const param in parent1.parameters) {
      // Uniform crossover
      childParams[param] = Math.random() < 0.5 
        ? parent1.parameters[param]
        : parent2.parameters[param];
    }
    
    return { parameters: childParams, fitness: 0 };
  }

  private mutate(chromosome: Chromosome, strategy: Strategy): void {
    for (const param of strategy.parameters) {
      if (Math.random() < this.mutationRate) {
        chromosome.parameters[param.name] = param.min + Math.random() * (param.max - param.min);
      }
    }
  }

  private calculateFitness(result: BacktestResult): number {
    return (
      result.winRate * 0.3 +
      (1 - result.maxDrawdown) * 0.3 +
      result.profitFactor * 0.4
    );
  }
}