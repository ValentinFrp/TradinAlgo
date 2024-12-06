import { CandlestickData, Trade, Position } from '../types/trading';

export const generateMockCandles = (count: number): CandlestickData[] => {
  const candles: CandlestickData[] = [];
  let lastClose = 45000; // Starting with a more realistic BTC price
  const now = Math.floor(Date.now() / 1000); // Current time in seconds

  for (let i = 0; i < count; i++) {
    const time = now - ((count - i) * 60); // One candle per minute
    const open = lastClose;
    const change = (Math.random() - 0.5) * 200; // More realistic price movements
    const close = +(open + change).toFixed(2);
    const high = +Math.max(open, close, open + Math.random() * 100).toFixed(2);
    const low = +Math.min(open, close, open - Math.random() * 100).toFixed(2);
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000) + 1000
    });

    lastClose = close;
  }

  return candles;
};

export const mockTrades: Trade[] = [
  {
    id: '1',
    symbol: 'BTC/USD',
    type: 'buy',
    price: 45000,
    amount: 0.5,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    symbol: 'ETH/USD',
    type: 'sell',
    price: 2800,
    amount: 2,
    timestamp: new Date().toISOString()
  }
];

export const mockPositions: Position[] = [
  {
    symbol: 'BTC/USD',
    amount: 0.5,
    entryPrice: 45000,
    currentPrice: 45500,
    pnl: 250
  },
  {
    symbol: 'ETH/USD',
    amount: -2,
    entryPrice: 2800,
    currentPrice: 2750,
    pnl: 100
  }
];