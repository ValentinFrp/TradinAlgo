import { create } from 'zustand';
import { CandlestickData, Position, Trade, Strategy } from '../types/trading';
import { generateMockCandles, mockPositions } from '../utils/mockData';
import Decimal from 'decimal.js';

interface TradingStore {
  balance: Decimal;
  positions: Position[];
  trades: Trade[];
  candleData: CandlestickData[];
  activeStrategies: Strategy[];
  updateBalance: (amount: Decimal) => void;
  addPosition: (position: Position) => void;
  updatePosition: (symbol: string, updates: Partial<Position>) => void;
  closePosition: (symbol: string) => void;
  addTrade: (trade: Trade) => void;
  updateCandleData: () => void;
  activateStrategy: (strategy: Strategy) => void;
  deactivateStrategy: (strategyId: string) => void;
}

// Mock strategy for testing
const mockStrategy: Strategy = {
  id: 'rsi-strategy',
  name: 'RSI Strategy',
  description: 'A simple RSI-based mean reversion strategy',
  parameters: [
    {
      name: 'period',
      value: 14,
      min: 2,
      max: 50,
      step: 1
    },
    {
      name: 'overbought',
      value: 70,
      min: 50,
      max: 90,
      step: 1
    },
    {
      name: 'oversold',
      value: 30,
      min: 10,
      max: 50,
      step: 1
    }
  ],
  isActive: true,
  performance: {
    totalTrades: 150,
    winRate: 0.55,
    profitFactor: 1.3
  }
};

export const useTradingStore = create<TradingStore>((set, get) => ({
  balance: new Decimal(50000),
  positions: mockPositions,
  trades: [],
  candleData: generateMockCandles(100),
  activeStrategies: [mockStrategy],

  updateBalance: (amount) => set((state) => ({
    balance: state.balance.plus(amount)
  })),

  addPosition: (position) => set((state) => ({
    positions: [...state.positions, position]
  })),

  updatePosition: (symbol, updates) => set((state) => ({
    positions: state.positions.map(pos => 
      pos.symbol === symbol ? { ...pos, ...updates } : pos
    )
  })),

  closePosition: (symbol) => set((state) => ({
    positions: state.positions.filter(pos => pos.symbol !== symbol)
  })),

  addTrade: (trade) => set((state) => ({
    trades: [...state.trades, trade]
  })),

  updateCandleData: () => set((state) => {
    const newCandle = generateMockCandles(1)[0];
    return {
      candleData: [...state.candleData.slice(1), newCandle]
    };
  }),

  activateStrategy: (strategy) => set((state) => ({
    activeStrategies: [...state.activeStrategies, strategy]
  })),

  deactivateStrategy: (strategyId) => set((state) => ({
    activeStrategies: state.activeStrategies.filter(s => s.id !== strategyId)
  }))
}));