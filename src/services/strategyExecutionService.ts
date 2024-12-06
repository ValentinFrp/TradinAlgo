import { Strategy } from '../types/trading';
import { apiService } from './apiService';

export class StrategyExecutionService {
  private activeStrategies: Map<string, Strategy> = new Map();

  async startStrategy(strategy: Strategy): Promise<void> {
    try {
      const response = await apiService.activateStrategy(strategy.id, strategy.parameters);
      if (!response.ok) throw new Error('Failed to activate strategy');
      
      this.activeStrategies.set(strategy.id, strategy);
    } catch (error) {
      console.error('Strategy activation failed:', error);
      throw error;
    }
  }

  async stopStrategy(strategyId: string): Promise<void> {
    try {
      const response = await apiService.deactivateStrategy(strategyId);
      if (!response.ok) throw new Error('Failed to deactivate strategy');
      
      this.activeStrategies.delete(strategyId);
    } catch (error) {
      console.error('Strategy deactivation failed:', error);
      throw error;
    }
  }

  getActiveStrategies(): Strategy[] {
    return Array.from(this.activeStrategies.values());
  }

  isStrategyActive(strategyId: string): boolean {
    return this.activeStrategies.has(strategyId);
  }
}

export const strategyExecutionService = new StrategyExecutionService();