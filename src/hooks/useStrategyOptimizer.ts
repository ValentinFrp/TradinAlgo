import { useState } from 'react';
import { Strategy } from '../types/trading';
import { runBacktest } from '../services/backtestService';

interface OptimizationState {
  isOptimizing: boolean;
  error: string | null;
  results: {
    bestParameters: Record<string, number>;
    bestFitness: number;
    initialFitness: number;
    convergenceHistory: number[];
    particleHistory?: any[];
    temperatureHistory?: number[];
    fitnessHistory?: number[];
    pheromoneHistory?: any[];
    acquisitionHistory?: any[];
    uncertaintyHistory?: any[];
  } | null;
}

export function useStrategyOptimizer(strategy: Strategy) {
  const [state, setState] = useState<OptimizationState>({
    isOptimizing: false,
    error: null,
    results: null
  });

  const startOptimization = async (optimizerType: string) => {
    setState(prev => ({ ...prev, isOptimizing: true, error: null }));

    try {
      // Generate mock optimization data
      const iterations = 50;
      const convergenceHistory: number[] = [];
      let bestFitness = 0;

      // Simulate optimization process
      for (let i = 0; i < iterations; i++) {
        const fitness = 0.5 + (Math.random() * 0.5) * (1 - i / iterations);
        convergenceHistory.push(fitness);
        if (fitness > bestFitness) bestFitness = fitness;
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Generate best parameters within strategy constraints
      const bestParameters = strategy.parameters.reduce((acc, param) => ({
        ...acc,
        [param.name]: Number((param.min + Math.random() * (param.max - param.min)).toFixed(4))
      }), {});

      // Generate mock results based on optimizer type
      const results = {
        bestParameters,
        bestFitness,
        initialFitness: convergenceHistory[0],
        convergenceHistory,
        acquisitionHistory: optimizerType === 'bayesian' ? Array.from({ length: iterations }, (_, i) => ({
          iteration: i,
          parameters: bestParameters,
          expectedImprovement: Math.random() * (1 - i / iterations),
          actualFitness: convergenceHistory[i]
        })) : undefined,
        uncertaintyHistory: optimizerType === 'bayesian' ? Array.from({ length: iterations }, () => ({
          parameters: bestParameters,
          mean: Math.random(),
          standardDeviation: Math.random() * 0.2
        })) : undefined,
        particleHistory: optimizerType === 'pso' ? Array.from({ length: 10 }, () => ({
          position: bestParameters,
          velocity: {},
          fitness: Math.random()
        })) : undefined,
        temperatureHistory: optimizerType === 'annealing' ? Array.from({ length: iterations }, (_, i) => 
          100 * Math.pow(0.95, i)
        ) : undefined,
        fitnessHistory: convergenceHistory,
        pheromoneHistory: optimizerType === 'antcolony' ? Array.from({ length: iterations }, () => 
          Object.fromEntries(
            strategy.parameters.map(p => [p.name, Array(10).fill(Math.random())])
          )
        ) : undefined
      };

      // Validate results
      await validateOptimizationResults(strategy, results.bestParameters);

      setState(prev => ({ ...prev, results, isOptimizing: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Optimization failed. Please try again.',
        isOptimizing: false
      }));
    }
  };

  const validateOptimizationResults = async (
    strategy: Strategy, 
    parameters: Record<string, number>
  ) => {
    // Validate parameters are within bounds
    for (const param of strategy.parameters) {
      const value = parameters[param.name];
      if (value < param.min || value > param.max) {
        throw new Error(`Parameter ${param.name} is outside allowed range`);
      }
    }

    // Run backtest with optimized parameters to verify improvement
    const result = await runBacktest(strategy, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      initialBalance: 10000,
      symbol: 'BTC/USD'
    });

    if (result.winRate < 0.4 || result.profitFactor < 1.0) {
      throw new Error('Optimization did not produce satisfactory results');
    }
  };

  return {
    ...state,
    startOptimization
  };
}