import { Trade, BacktestResult } from '../../types/trading';
import { PerformanceAnalyzer } from './PerformanceMetrics';
import Decimal from 'decimal.js';

interface EnhancedMonteCarloResult extends MonteCarloResult {
  valueAtRisk: {
    var95: number;
    var99: number;
    cvar95: number;
    cvar99: number;
  };
  streakAnalysis: {
    maxWinStreak: number;
    maxLossStreak: number;
    avgWinStreak: number;
    avgLossStreak: number;
  };
  recoveryAnalysis: {
    averageRecoveryTime: number;
    maxRecoveryTime: number;
    recoveryProbability: number;
  };
}

interface MonteCarloResult {
  confidenceIntervals: {
    winRate: { lower: number; upper: number };
    maxDrawdown: { lower: number; upper: number };
    finalBalance: { lower: number; upper: number };
    sharpeRatio: { lower: number; upper: number };
  };
  distributions: {
    winRates: number[];
    maxDrawdowns: number[];
    finalBalances: number[];
    sharpeRatios: number[];
  };
}

export class EnhancedMonteCarloSimulator {
  private performanceAnalyzer: PerformanceAnalyzer;
  private simulations: number;
  private confidenceLevel: number;

  constructor(simulations = 1000, confidenceLevel = 0.95) {
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.simulations = simulations;
    this.confidenceLevel = confidenceLevel;
  }

  simulate(trades: Trade[], initialBalance: number): EnhancedMonteCarloResult {
    const results: BacktestResult[] = [];
    const equityCurves: number[][] = [];

    // Run simulations with randomized trade order
    for (let i = 0; i < this.simulations; i++) {
      const shuffledTrades = this.shuffleTrades([...trades]);
      const result = this.performanceAnalyzer.calculateMetrics(shuffledTrades, initialBalance);
      results.push(result);
      equityCurves.push(this.calculateEquityCurve(shuffledTrades, initialBalance));
    }

    // Extract metrics distributions
    const winRates = results.map(r => r.winRate);
    const maxDrawdowns = results.map(r => r.maxDrawdown);
    const finalBalances = results.map(r => r.finalBalance.toNumber());
    const sharpeRatios = results.map(r => r.sharpeRatio);

    // Calculate confidence intervals
    const confidenceIntervals = {
      winRate: this.calculateConfidenceInterval(winRates),
      maxDrawdown: this.calculateConfidenceInterval(maxDrawdowns),
      finalBalance: this.calculateConfidenceInterval(finalBalances),
      sharpeRatio: this.calculateConfidenceInterval(sharpeRatios)
    };

    // Calculate Value at Risk metrics
    const valueAtRisk = this.calculateValueAtRisk(finalBalances, initialBalance);

    // Analyze winning and losing streaks
    const streakAnalysis = this.analyzeStreaks(trades);

    // Analyze recovery times
    const recoveryAnalysis = this.analyzeRecoveryTimes(equityCurves);

    return {
      confidenceIntervals,
      distributions: {
        winRates,
        maxDrawdowns,
        finalBalances,
        sharpeRatios
      },
      valueAtRisk,
      streakAnalysis,
      recoveryAnalysis
    };
  }

  private shuffleTrades(trades: Trade[]): Trade[] {
    for (let i = trades.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trades[i], trades[j]] = [trades[j], trades[i]];
    }
    return trades;
  }

  private calculateConfidenceInterval(data: number[]): { lower: number; upper: number } {
    const sorted = [...data].sort((a, b) => a - b);
    const lowerIndex = Math.floor((1 - this.confidenceLevel) / 2 * data.length);
    const upperIndex = Math.floor((1 + this.confidenceLevel) / 2 * data.length);

    return {
      lower: sorted[lowerIndex],
      upper: sorted[upperIndex]
    };
  }

  private calculateValueAtRisk(returns: number[], initialBalance: number): {
    var95: number;
    var99: number;
    cvar95: number;
    cvar99: number;
  } {
    const sortedReturns = [...returns]
      .map(r => (r - initialBalance) / initialBalance)
      .sort((a, b) => a - b);

    const index95 = Math.floor(0.05 * returns.length);
    const index99 = Math.floor(0.01 * returns.length);

    const var95 = -sortedReturns[index95];
    const var99 = -sortedReturns[index99];

    const cvar95 = -sortedReturns.slice(0, index95)
      .reduce((sum, r) => sum + r, 0) / index95;

    const cvar99 = -sortedReturns.slice(0, index99)
      .reduce((sum, r) => sum + r, 0) / index99;

    return { var95, var99, cvar95, cvar99 };
  }

  private analyzeStreaks(trades: Trade[]): {
    maxWinStreak: number;
    maxLossStreak: number;
    avgWinStreak: number;
    avgLossStreak: number;
  } {
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let winStreaks: number[] = [];
    let lossStreaks: number[] = [];

    trades.forEach((trade, i) => {
      const isWin = this.calculateTradeProfit(trade) > 0;

      if (i === 0 || isWin === (this.calculateTradeProfit(trades[i - 1]) > 0)) {
        currentStreak++;
      } else {
        if (isWin) {
          lossStreaks.push(currentStreak);
          maxLossStreak = Math.max(maxLossStreak, currentStreak);
        } else {
          winStreaks.push(currentStreak);
          maxWinStreak = Math.max(maxWinStreak, currentStreak);
        }
        currentStreak = 1;
      }
    });

    const avgWinStreak = winStreaks.length > 0
      ? winStreaks.reduce((sum, s) => sum + s, 0) / winStreaks.length
      : 0;

    const avgLossStreak = lossStreaks.length > 0
      ? lossStreaks.reduce((sum, s) => sum + s, 0) / lossStreaks.length
      : 0;

    return {
      maxWinStreak,
      maxLossStreak,
      avgWinStreak,
      avgLossStreak
    };
  }

  private analyzeRecoveryTimes(equityCurves: number[][]): {
    averageRecoveryTime: number;
    maxRecoveryTime: number;
    recoveryProbability: number;
  } {
    const recoveryTimes: number[] = [];
    let totalDrawdowns = 0;
    let recoveredDrawdowns = 0;

    equityCurves.forEach(curve => {
      let peak = curve[0];
      let drawdownStart = -1;

      curve.forEach((value, i) => {
        if (value > peak) {
          peak = value;
          if (drawdownStart !== -1) {
            recoveryTimes.push(i - drawdownStart);
            recoveredDrawdowns++;
            drawdownStart = -1;
          }
        } else if (value < peak && drawdownStart === -1) {
          drawdownStart = i;
          totalDrawdowns++;
        }
      });
    });

    const averageRecoveryTime = recoveryTimes.length > 0
      ? recoveryTimes.reduce((sum, t) => sum + t, 0) / recoveryTimes.length
      : 0;

    const maxRecoveryTime = Math.max(...recoveryTimes, 0);
    const recoveryProbability = totalDrawdowns > 0
      ? recoveredDrawdowns / totalDrawdowns
      : 0;

    return {
      averageRecoveryTime,
      maxRecoveryTime,
      recoveryProbability
    };
  }

  private calculateEquityCurve(trades: Trade[], initialBalance: number): number[] {
    const equity = [initialBalance];
    let balance = initialBalance;

    trades.forEach(trade => {
      balance += this.calculateTradeProfit(trade);
      equity.push(balance);
    });

    return equity;
  }

  private calculateTradeProfit(trade: Trade): number {
    return trade.type === 'buy'
      ? -(trade.price * trade.amount)
      : (trade.price * trade.amount);
  }
}