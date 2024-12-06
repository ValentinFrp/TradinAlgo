import { Strategy, BacktestResult } from '../types/trading';
import Decimal from 'decimal.js';

interface BacktestParams {
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  symbol: string;
}

export async function runBacktest(
  strategy: Strategy,
  params: BacktestParams
): Promise<BacktestResult> {
  // Mock backtest results for development
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const mockTrades = Array.from({ length: 50 }, (_, i) => ({
    id: `trade-${i}`,
    symbol: params.symbol,
    type: Math.random() > 0.5 ? 'buy' : 'sell',
    price: 45000 + (Math.random() - 0.5) * 1000,
    amount: 0.1 + Math.random() * 0.4,
    timestamp: new Date(
      params.startDate.getTime() + 
      Math.random() * (params.endDate.getTime() - params.startDate.getTime())
    ).toISOString()
  }));

  const winRate = 0.55 + Math.random() * 0.1;
  const profitFactor = 1.5 + Math.random() * 0.5;
  const maxDrawdown = 0.1 + Math.random() * 0.1;
  const finalBalance = new Decimal(params.initialBalance * (1 + Math.random() * 0.2));

  return {
    trades: mockTrades,
    finalBalance,
    totalTrades: mockTrades.length,
    winRate,
    profitFactor,
    maxDrawdown,
    sharpeRatio: 1.2 + Math.random() * 0.5
  };
}