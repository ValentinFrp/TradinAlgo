import Decimal from 'decimal.js';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: string;
}

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameter[];
  isActive: boolean;
  lastExecuted?: Date;
  performance: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
  };
}

export interface StrategyParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface BacktestResult {
  trades: Trade[];
  finalBalance: Decimal;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
}