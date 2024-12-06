import { Trade, BacktestResult } from '../../types/trading';
import { PerformanceAnalyzer } from './PerformanceMetrics';

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

export class MonteCarloSimulator {
  private performanceAnalyzer: PerformanceAnalyzer;
  private simulations: number;
  private confidenceLevel: number;

  constructor(simulations = 1000, confidenceLevel = 0.95) {
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.simulations = simulations;
    this.confidenceLevel = confidenceLevel;
  }

  simulate(trades: Trade[], initialBalance: number): MonteCarloResult {
    const results: BacktestResult[] = [];

    // Run simulations with randomized trade order
    for (let i = 0; i < this.simulations; i++) {
      const shuffledTrades = this.shuffleTrades([...trades]);
      const result = this.performanceAnalyzer.calculateMetrics(shuffledTrades, initialBalance);
      results.push(result);
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

    return {
      confidenceIntervals,
      distributions: {
        winRates,
        maxDrawdowns,
        finalBalances,
        sharpeRatios
      }
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
}