import { useState } from 'react';
import { Strategy } from '../types/trading';
import { strategyExecutionService } from '../services/strategyExecutionService';

export function useStrategyExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStrategy = async (strategy: Strategy) => {
    setIsExecuting(true);
    setError(null);
    
    try {
      await strategyExecutionService.startStrategy(strategy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start strategy');
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  const stopStrategy = async (strategyId: string) => {
    setIsExecuting(true);
    setError(null);
    
    try {
      await strategyExecutionService.stopStrategy(strategyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop strategy');
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    isExecuting,
    error,
    startStrategy,
    stopStrategy,
    getActiveStrategies: strategyExecutionService.getActiveStrategies,
    isStrategyActive: strategyExecutionService.isStrategyActive
  };
}