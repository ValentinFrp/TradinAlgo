import { Strategy, Trade, BacktestResult } from '../types/trading';

export class StrategyService {
  private baseUrl = 'http://localhost:8080/api';

  async getStrategies(): Promise<Strategy[]> {
    const response = await fetch(`${this.baseUrl}/strategies`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des stratégies');
    }
    return response.json();
  }

  async activateStrategy(strategy: Strategy): Promise<void> {
    const response = await fetch(`${this.baseUrl}/strategies/${strategy.id}/activate`, {
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
    const response = await fetch(`${this.baseUrl}/strategies/${strategyId}/deactivate`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Échec de la désactivation de la stratégie');
    }
  }

  async updateStrategyParameters(
    strategyId: string,
    parameters: Record<string, number>
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/strategies/${strategyId}/parameters`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    });

    if (!response.ok) {
      throw new Error('Échec de la mise à jour des paramètres');
    }
  }

  async getStrategyPerformance(strategyId: string): Promise<{
    trades: Trade[];
    performance: {
      winRate: number;
      profitFactor: number;
      maxDrawdown: number;
      sharpeRatio: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/strategies/${strategyId}/performance`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des performances');
    }
    return response.json();
  }
}