import { Strategy, BacktestResult, Trade } from '../../types/trading';
import { StrategyOptimizer } from '../optimizer';
import { PerformanceAnalyzer } from './PerformanceMetrics';

interface WalkForwardWindow {
  inSample: {
    start: Date;
    end: Date;
    trades: Trade[];
  };
  outOfSample: {
    start: Date;
    end: Date;
    trades: Trade[];
  };
}

interface WalkForwardResult {
  windows: Array<{
    period: {
      start: Date;
      end: Date;
    };
    parameters: Record<string, number>;
    performance: BacktestResult;
  }>;
  aggregatePerformance: BacktestResult;
}

export class WalkForwardAnalyzer {
  private strategy: Strategy;
  private windowSize: number;
  private trainRatio: number;
  private optimizer: StrategyOptimizer;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor(
    strategy: Strategy,
    windowSize = 90, // days
    trainRatio = 0.7  // 70% in-sample, 30% out-of-sample
  ) {
    this.strategy = strategy;
    this.windowSize = windowSize;
    this.trainRatio = trainRatio;
    this.optimizer = new StrategyOptimizer(
      strategy,
      strategy.parameters.map(p => ({
        parameter: p.name,
        min: p.min,
        max: p.max,
        step: p.step
      })),
      { startDate: new Date(), endDate: new Date(), initialBalance: 10000, symbol: 'BTC/USD' }
    );
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  async analyze(
    trades: Trade[],
    startDate: Date,
    endDate: Date,
    initialBalance: number
  ): Promise<WalkForwardResult> {
    const windows = this.createWindows(trades, startDate, endDate);
    const results: WalkForwardResult['windows'] = [];
    const allOutOfSampleTrades: Trade[] = [];

    for (const window of windows) {
      // Optimize strategy on in-sample data
      const optimizedParams = await this.optimizeWindow(window.inSample.trades);

      // Test optimized parameters on out-of-sample data
      const outOfSampleResult = this.performanceAnalyzer.calculateMetrics(
        window.outOfSample.trades,
        initialBalance
      );

      results.push({
        period: {
          start: window.outOfSample.start,
          end: window.outOfSample.end
        },
        parameters: optimizedParams,
        performance: outOfSampleResult
      });

      allOutOfSampleTrades.push(...window.outOfSample.trades);
    }

    // Calculate aggregate performance across all out-of-sample periods
    const aggregatePerformance = this.performanceAnalyzer.calculateMetrics(
      allOutOfSampleTrades,
      initialBalance
    );

    return {
      windows: results,
      aggregatePerformance
    };
  }

  private createWindows(
    trades: Trade[],
    startDate: Date,
    endDate: Date
  ): WalkForwardWindow[] {
    const windows: WalkForwardWindow[] = [];
    const msPerDay = 24 * 60 * 60 * 1000;
    const windowSizeMs = this.windowSize * msPerDay;
    
    let currentStart = startDate.getTime();
    const end = endDate.getTime();

    while (currentStart + windowSizeMs <= end) {
      const windowEnd = currentStart + windowSizeMs;
      const inSampleEnd = currentStart + (windowSizeMs * this.trainRatio);

      const window: WalkForwardWindow = {
        inSample: {
          start: new Date(currentStart),
          end: new Date(inSampleEnd),
          trades: trades.filter(t => {
            const timestamp = new Date(t.timestamp).getTime();
            return timestamp >= currentStart && timestamp < inSampleEnd;
          })
        },
        outOfSample: {
          start: new Date(inSampleEnd),
          end: new Date(windowEnd),
          trades: trades.filter(t => {
            const timestamp = new Date(t.timestamp).getTime();
            return timestamp >= inSampleEnd && timestamp < windowEnd;
          })
        }
      };

      windows.push(window);
      currentStart = inSampleEnd;
    }

    return windows;
  }

  private async optimizeWindow(trades: Trade[]): Promise<Record<string, number>> {
    const results = await this.optimizer.optimize(50);
    return results[0].parameters;
  }
}