import { useState } from 'react';
import { Strategy } from '../../../types/trading';
import { BayesianOptimizer } from '../../../utils/optimizers/BayesianOptimizer';
import { ParticleSwarmOptimizer } from '../../../utils/optimizers/ParticleSwarmOptimizer';
import { SimulatedAnnealing } from '../../../utils/optimizers/SimulatedAnnealing';
import { AntColonyOptimizer } from '../../../utils/optimizers/AntColonyOptimizer';

export function useOptimizer(strategy: Strategy) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const startOptimization = async (optimizerType: string) => {
    setIsOptimizing(true);
    try {
      let optimizer;
      switch (optimizerType) {
        case 'bayesian':
          optimizer = new BayesianOptimizer();
          break;
        case 'pso':
          optimizer = new ParticleSwarmOptimizer();
          break;
        case 'annealing':
          optimizer = new SimulatedAnnealing();
          break;
        case 'antcolony':
          optimizer = new AntColonyOptimizer();
          break;
        default:
          throw new Error('Invalid optimizer type');
      }

      const results = await optimizer.optimize(strategy, async (params) => {
        // Mock backtest function for now
        return {
          winRate: Math.random(),
          profitFactor: 1 + Math.random(),
          maxDrawdown: Math.random() * 0.3,
          sharpeRatio: Math.random() * 2
        };
      });

      setOptimizationResults({
        ...results,
        initialFitness: Math.random() // Mock initial fitness
      });
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    startOptimization,
    optimizationResults,
    isOptimizing
  };
}