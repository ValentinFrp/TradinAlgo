import Decimal from 'decimal.js';
import { Position } from '../types/trading';

export class RiskManager {
  private maxPositionSize: Decimal;
  private maxDrawdown: Decimal;
  private riskPerTrade: Decimal;
  private accountBalance: Decimal;

  constructor(
    accountBalance: number,
    riskPerTrade: number = 0.02, // 2% risk per trade
    maxDrawdown: number = 0.15,  // 15% max drawdown
    maxPositionSize: number = 0.1 // 10% max position size
  ) {
    this.accountBalance = new Decimal(accountBalance);
    this.riskPerTrade = new Decimal(riskPerTrade);
    this.maxDrawdown = new Decimal(maxDrawdown);
    this.maxPositionSize = new Decimal(maxPositionSize);
  }

  calculatePositionSize(
    entryPrice: number,
    stopLoss: number,
    currentPositions: Position[]
  ): Decimal {
    // Calculate risk amount in dollars
    const riskAmount = this.accountBalance.mul(this.riskPerTrade);
    
    // Calculate position size based on stop loss distance
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount.div(stopDistance);

    // Check if position size exceeds max allowed
    const maxAllowedSize = this.accountBalance.mul(this.maxPositionSize);
    let finalPositionSize = Decimal.min(positionSize, maxAllowedSize);

    // Check current exposure
    const currentExposure = this.calculateTotalExposure(currentPositions);
    const remainingAllowedExposure = maxAllowedSize.minus(currentExposure);

    // Adjust position size if it would exceed max exposure
    if (remainingAllowedExposure.lessThan(finalPositionSize)) {
      finalPositionSize = remainingAllowedExposure;
    }

    return finalPositionSize;
  }

  private calculateTotalExposure(positions: Position[]): Decimal {
    return positions.reduce((total, position) => {
      return total.plus(position.amount * position.currentPrice);
    }, new Decimal(0));
  }

  checkDrawdown(currentEquity: number): boolean {
    const drawdown = new Decimal(1).minus(
      new Decimal(currentEquity).div(this.accountBalance)
    );
    return drawdown.lessThan(this.maxDrawdown);
  }

  updateAccountBalance(newBalance: number): void {
    this.accountBalance = new Decimal(newBalance);
  }

  getMaxLossAmount(): Decimal {
    return this.accountBalance.mul(this.maxDrawdown);
  }

  getRiskPerTradeAmount(): Decimal {
    return this.accountBalance.mul(this.riskPerTrade);
  }
}