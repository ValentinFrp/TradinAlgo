import { create } from 'zustand';
import { RiskManager } from '../utils/riskManagement';
import Decimal from 'decimal.js';
import { Position } from '../types/trading';

interface RiskState {
  riskManager: RiskManager;
  maxLossAmount: Decimal;
  riskPerTradeAmount: Decimal;
  updateBalance: (newBalance: number) => void;
  calculatePositionSize: (entryPrice: number, stopLoss: number, positions: Position[]) => Decimal;
  checkDrawdown: (currentEquity: number) => boolean;
}

export const useRiskStore = create<RiskState>((set, get) => ({
  riskManager: new RiskManager(50000), // Initial balance of $50,000
  maxLossAmount: new Decimal(0),
  riskPerTradeAmount: new Decimal(0),

  updateBalance: (newBalance: number) => {
    const { riskManager } = get();
    riskManager.updateAccountBalance(newBalance);
    set({
      maxLossAmount: riskManager.getMaxLossAmount(),
      riskPerTradeAmount: riskManager.getRiskPerTradeAmount()
    });
  },

  calculatePositionSize: (entryPrice: number, stopLoss: number, positions: Position[]) => {
    return get().riskManager.calculatePositionSize(entryPrice, stopLoss, positions);
  },

  checkDrawdown: (currentEquity: number) => {
    return get().riskManager.checkDrawdown(currentEquity);
  }
}));