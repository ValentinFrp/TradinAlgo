import { Strategy, Trade, Position } from '../types/trading';

export class DatabaseService {
  private dbUrl: string;

  constructor(dbUrl: string) {
    this.dbUrl = dbUrl;
  }

  async saveStrategy(strategy: Strategy): Promise<void> {
    const response = await fetch(`${this.dbUrl}/strategies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategy)
    });

    if (!response.ok) {
      throw new Error('Failed to save strategy');
    }
  }

  async saveTrade(trade: Trade): Promise<void> {
    const response = await fetch(`${this.dbUrl}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trade)
    });

    if (!response.ok) {
      throw new Error('Failed to save trade');
    }
  }

  async getTradeHistory(
    startDate: Date,
    endDate: Date,
    strategyId?: string
  ): Promise<Trade[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    if (strategyId) {
      params.append('strategyId', strategyId);
    }

    const response = await fetch(`${this.dbUrl}/trades?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trade history');
    }

    return response.json();
  }

  async getStrategies(): Promise<Strategy[]> {
    const response = await fetch(`${this.dbUrl}/strategies`);
    if (!response.ok) {
      throw new Error('Failed to fetch strategies');
    }

    return response.json();
  }

  async getPositions(): Promise<Position[]> {
    const response = await fetch(`${this.dbUrl}/positions`);
    if (!response.ok) {
      throw new Error('Failed to fetch positions');
    }

    return response.json();
  }
}

export const databaseService = new DatabaseService(process.env.DATABASE_URL || 'http://localhost:8080/db');