import { Trade, BacktestResult } from '../../types/trading';
import Decimal from 'decimal.js';

export class PerformanceAnalyzer {
  calculateMetrics(trades: Trade[], initialBalance: number): BacktestResult {
    const metrics = {
      finalBalance: new Decimal(initialBalance),
      totalTrades: trades.length,
      winRate: this.calculateWinRate(trades),
      profitFactor: this.calculateProfitFactor(trades),
      maxDrawdown: this.calculateMaxDrawdown(trades, initialBalance),
      sharpeRatio: this.calculateSharpeRatio(trades),
      sortinoRatio: this.calculateSortinoRatio(trades),
      calmarRatio: this.calculateCalmarRatio(trades, initialBalance),
      averageWin: this.calculateAverageWin(trades),
      averageLoss: this.calculateAverageLoss(trades),
      expectancy: this.calculateExpectancy(trades),
      consecutiveWins: this.calculateConsecutiveWins(trades),
      consecutiveLosses: this.calculateConsecutiveLosses(trades)
    };

    return metrics;
  }

  private calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(t => this.calculateTradeProfit(t) > 0);
    return winningTrades.length / trades.length;
  }

  private calculateProfitFactor(trades: Trade[]): number {
    const profits = trades.reduce((sum, trade) => {
      const profit = this.calculateTradeProfit(trade);
      return profit > 0 ? sum + profit : sum;
    }, 0);

    const losses = Math.abs(trades.reduce((sum, trade) => {
      const profit = this.calculateTradeProfit(trade);
      return profit < 0 ? sum + profit : sum;
    }, 0));

    return losses === 0 ? profits : profits / losses;
  }

  private calculateMaxDrawdown(trades: Trade[], initialBalance: number): number {
    let peak = initialBalance;
    let maxDrawdown = 0;
    let currentBalance = initialBalance;

    trades.forEach(trade => {
      currentBalance += this.calculateTradeProfit(trade);
      if (currentBalance > peak) {
        peak = currentBalance;
      }
      
      const drawdown = (peak - currentBalance) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return maxDrawdown;
  }

  private calculateSharpeRatio(trades: Trade[]): number {
    const returns = this.calculateReturns(trades);
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    );

    return stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252); // Annualized
  }

  private calculateSortinoRatio(trades: Trade[]): number {
    const returns = this.calculateReturns(trades);
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    const downside = Math.sqrt(
      negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / returns.length
    );

    return downside === 0 ? 0 : (avgReturn / downside) * Math.sqrt(252); // Annualized
  }

  private calculateCalmarRatio(trades: Trade[], initialBalance: number): number {
    const maxDrawdown = this.calculateMaxDrawdown(trades, initialBalance);
    if (maxDrawdown === 0) return 0;

    const returns = this.calculateReturns(trades);
    const annualizedReturn = (returns.reduce((a, b) => a + b, 0) / returns.length) * 252;

    return annualizedReturn / maxDrawdown;
  }

  private calculateReturns(trades: Trade[]): number[] {
    return trades.map(trade => this.calculateTradeProfit(trade));
  }

  private calculateTradeProfit(trade: Trade): number {
    return trade.type === 'buy' 
      ? -(trade.price * trade.amount)
      : (trade.price * trade.amount);
  }

  private calculateAverageWin(trades: Trade[]): number {
    const winningTrades = trades.filter(t => this.calculateTradeProfit(t) > 0);
    if (winningTrades.length === 0) return 0;
    
    return winningTrades.reduce((sum, trade) => 
      sum + this.calculateTradeProfit(trade), 0) / winningTrades.length;
  }

  private calculateAverageLoss(trades: Trade[]): number {
    const losingTrades = trades.filter(t => this.calculateTradeProfit(t) < 0);
    if (losingTrades.length === 0) return 0;
    
    return Math.abs(losingTrades.reduce((sum, trade) => 
      sum + this.calculateTradeProfit(trade), 0) / losingTrades.length);
  }

  private calculateExpectancy(trades: Trade[]): number {
    const winRate = this.calculateWinRate(trades);
    const avgWin = this.calculateAverageWin(trades);
    const avgLoss = this.calculateAverageLoss(trades);
    
    return (winRate * avgWin) - ((1 - winRate) * avgLoss);
  }

  private calculateConsecutiveWins(trades: Trade[]): number {
    let maxStreak = 0;
    let currentStreak = 0;

    trades.forEach(trade => {
      if (this.calculateTradeProfit(trade) > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  }

  private calculateConsecutiveLosses(trades: Trade[]): number {
    let maxStreak = 0;
    let currentStreak = 0;

    trades.forEach(trade => {
      if (this.calculateTradeProfit(trade) < 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  }
}