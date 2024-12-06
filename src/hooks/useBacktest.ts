import { useState } from 'react';
import { Strategy, BacktestResult } from '../types/trading';
import { runBacktest } from '../services/backtestService';

interface BacktestParams {
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  symbol: string;
}

export function useBacktest(strategy: Strategy) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const executeBacktest = async (params: BacktestParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backtestResult = await runBacktest(strategy, params);
      setResult(backtestResult);
      return backtestResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Backtest failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeBacktest,
    isLoading,
    error,
    result
  };
}