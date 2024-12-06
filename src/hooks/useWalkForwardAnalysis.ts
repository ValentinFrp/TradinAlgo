import { useState } from 'react';
import { Strategy } from '../types/trading';

interface WalkForwardWindow {
  period: {
    start: Date;
    end: Date;
  };
  parameters: Record<string, number>;
  performance: {
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

interface WalkForwardResults {
  windows: WalkForwardWindow[];
  aggregatePerformance: {
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

export function useWalkForwardAnalysis(strategy: Strategy) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<WalkForwardResults | null>(null);

  const startAnalysis = async (windowSize: number, trainRatio: number) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Generate mock data for demonstration
      const windows: WalkForwardWindow[] = Array.from({ length: 10 }, (_, i) => ({
        period: {
          start: new Date(2023, i, 1),
          end: new Date(2023, i + 1, 1)
        },
        parameters: Object.fromEntries(
          strategy.parameters.map(param => [
            param.name,
            Number((param.min + Math.random() * (param.max - param.min)).toFixed(2))
          ])
        ),
        performance: {
          winRate: Number((0.5 + Math.random() * 0.2).toFixed(2)),
          profitFactor: Number((1.2 + Math.random() * 0.5).toFixed(2)),
          maxDrawdown: Number((0.1 + Math.random() * 0.1).toFixed(2)),
          sharpeRatio: Number((1.0 + Math.random() * 1.0).toFixed(2))
        }
      }));

      const mockResults: WalkForwardResults = {
        windows,
        aggregatePerformance: {
          winRate: 0.55,
          profitFactor: 1.5,
          maxDrawdown: 0.15,
          sharpeRatio: 1.2
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisResults(mockResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Walk forward analysis failed');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    startAnalysis,
    analysisResults,
    isAnalyzing,
    error
  };
}