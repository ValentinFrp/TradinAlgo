import { useState } from 'react';
import { Strategy } from '../types/trading';

export function useMonteCarloSimulation(strategy: Strategy) {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (sampleSize: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock simulation data
      const mockData = {
        distributions: {
          finalBalances: Array.from({ length: sampleSize }, () => Math.random() * 100000 + 50000),
          maxDrawdowns: Array.from({ length: sampleSize }, () => Math.random() * 0.3),
          winRates: Array.from({ length: sampleSize }, () => Math.random() * 0.4 + 0.3),
          sharpeRatios: Array.from({ length: sampleSize }, () => Math.random() * 2 + 0.5)
        },
        confidenceIntervals: {
          finalBalance: { 
            lower: 55000 + Math.random() * 5000, 
            upper: 140000 + Math.random() * 5000 
          },
          maxDrawdown: { 
            lower: 0.05 + Math.random() * 0.02, 
            upper: 0.20 + Math.random() * 0.05 
          },
          winRate: { 
            lower: 0.35 + Math.random() * 0.05, 
            upper: 0.60 + Math.random() * 0.05 
          },
          sharpeRatio: { 
            lower: 0.8 + Math.random() * 0.2, 
            upper: 2.0 + Math.random() * 0.2 
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimulationData(mockData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Monte Carlo simulation failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    simulationData,
    isLoading,
    error,
    runSimulation
  };
}