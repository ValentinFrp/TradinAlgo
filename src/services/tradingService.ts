import { Strategy, Trade, BacktestResult } from '../types/trading';
import { WebSocketService } from './websocketService';

export class TradingService {
  private webSocket: WebSocketService;

  constructor() {
    this.webSocket = new WebSocketService();
  }

  async activateStrategy(strategy: Strategy): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/strategies/${strategy.id}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(strategy.parameters)
    });

    if (!response.ok) {
      throw new Error('Échec de l\'activation de la stratégie');
    }
  }

  async deactivateStrategy(strategyId: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/strategies/${strategyId}/deactivate`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Échec de la désactivation de la stratégie');
    }
  }

  async runBacktest(
    strategy: Strategy,
    startDate: Date,
    endDate: Date,
    initialBalance: number
  ): Promise<BacktestResult> {
    const response = await fetch('http://localhost:8080/api/backtest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        strategyId: strategy.id,
        startDate,
        endDate,
        initialBalance
      })
    });

    if (!response.ok) {
      throw new Error('Échec du backtest');
    }

    return response.json();
  }

  subscribeToMarketData(onData: (data: any) => void): void {
    this.webSocket.connect(onData);
  }

  unsubscribeFromMarketData(): void {
    this.webSocket.disconnect();
  }
}