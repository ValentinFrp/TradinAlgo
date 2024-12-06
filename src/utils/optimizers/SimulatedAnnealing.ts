import { Strategy, BacktestResult } from '../../types/trading';

interface Solution {
  parameters: Record<string, number>;
  fitness: number;
}

export class SimulatedAnnealing {
  private initialTemperature: number;
  private coolingRate: number;
  private iterations: number;

  constructor(
    initialTemperature = 100.0,
    coolingRate = 0.95,
    iterations = 1000
  ) {
    this.initialTemperature = initialTemperature;
    this.coolingRate = coolingRate;
    this.iterations = iterations;
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<{
    bestParameters: Record<string, number>;
    bestFitness: number;
    temperatureHistory: number[];
    fitnessHistory: number[];
  }> {
    let currentSolution = this.generateRandomSolution(strategy);
    let bestSolution = { ...currentSolution };
    
    const temperatureHistory: number[] = [];
    const fitnessHistory: number[] = [];
    let temperature = this.initialTemperature;

    // Evaluate initial solution
    currentSolution.fitness = this.calculateFitness(
      await evaluateFunction(currentSolution.parameters)
    );
    bestSolution.fitness = currentSolution.fitness;

    for (let i = 0; i < this.iterations && temperature > 0.1; i++) {
      const neighbor = this.generateNeighbor(currentSolution, strategy);
      neighbor.fitness = this.calculateFitness(
        await evaluateFunction(neighbor.parameters)
      );

      const delta = neighbor.fitness - currentSolution.fitness;

      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = { ...neighbor };
        
        if (neighbor.fitness > bestSolution.fitness) {
          bestSolution = { ...neighbor };
        }
      }

      temperature *= this.coolingRate;
      temperatureHistory.push(temperature);
      fitnessHistory.push(currentSolution.fitness);
    }

    return {
      bestParameters: bestSolution.parameters,
      bestFitness: bestSolution.fitness,
      temperatureHistory,
      fitnessHistory
    };
  }

  private generateRandomSolution(strategy: Strategy): Solution {
    const parameters: Record<string, number> = {};
    
    for (const param of strategy.parameters) {
      parameters[param.name] = param.min + Math.random() * (param.max - param.min);
    }

    return { parameters, fitness: -Infinity };
  }

  private generateNeighbor(current: Solution, strategy: Strategy): Solution {
    const parameters: Record<string, number> = { ...current.parameters };
    
    // Randomly modify one parameter
    const paramToModify = strategy.parameters[
      Math.floor(Math.random() * strategy.parameters.length)
    ];
    
    const range = paramToModify.max - paramToModify.min;
    const change = (Math.random() - 0.5) * range * 0.1; // 10% of range
    
    parameters[paramToModify.name] = Math.max(
      paramToModify.min,
      Math.min(
        paramToModify.max,
        parameters[paramToModify.name] + change
      )
    );

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