import { Strategy, BacktestResult } from '../types/trading';

export async function runWalkForwardAnalysis(
  strategy: Strategy,
  windowSize: number,
  trainRatio: number
): Promise<any> {
  // Simulate API call
  const response = await fetch('http://localhost:8080/api/analysis/walk-forward', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      strategyId: strategy.id,
      windowSize,
      trainRatio
    })
  });

  if (!response.ok) {
    throw new Error('Walk forward analysis failed');
  }

  return response.json();
}

export async function runCorrelationAnalysis(
  strategy: Strategy,
  sampleSize: number
): Promise<any> {
  // Simulate API call
  const response = await fetch('http://localhost:8080/api/analysis/correlation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      strategyId: strategy.id,
      sampleSize
    })
  });

  if (!response.ok) {
    throw new Error('Correlation analysis failed');
  }

  return response.json();
}

export async function runBacktest(
  strategy: Strategy,
  startDate: Date,
  endDate: Date,
  parameters: Record<string, number>
): Promise<BacktestResult> {
  // Simulate API call
  const response = await fetch('http://localhost:8080/api/backtest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      strategyId: strategy.id,
      startDate,
      endDate,
      parameters
    })
  });

  if (!response.ok) {
    throw new Error('Backtest failed');
  }

  return response.json();
}