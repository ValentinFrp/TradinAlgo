import React, { useState } from 'react';
import { BarChart, Brain, Fingerprint, Network } from 'lucide-react';
import { MonteCarloAnalysis } from './analysis/sections/MonteCarloAnalysis';
import { WalkForwardAnalysis } from './analysis/sections/WalkForwardAnalysis';
import { OptimizationAnalysis } from './analysis/sections/OptimizationAnalysis';
import { CorrelationAnalysis } from './analysis/sections/CorrelationAnalysis';
import { useTradingStore } from '../store/tradingStore';
import { ErrorBoundary } from './ErrorBoundary';

type AnalysisType = 'monte-carlo' | 'walk-forward' | 'optimization' | 'correlation';

export function AnalysisPanel() {
  const { activeStrategies } = useTradingStore();
  const [selectedStrategy] = useState(activeStrategies[0]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>('monte-carlo');

  if (!selectedStrategy) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-center">Please select a strategy to analyze</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Type Selection */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedAnalysis('monte-carlo')}
            className={`p-4 rounded-lg flex flex-col items-center ${
              selectedAnalysis === 'monte-carlo'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Monte Carlo</span>
          </button>
          <button
            onClick={() => setSelectedAnalysis('walk-forward')}
            className={`p-4 rounded-lg flex flex-col items-center ${
              selectedAnalysis === 'walk-forward'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Brain className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Walk Forward</span>
          </button>
          <button
            onClick={() => setSelectedAnalysis('optimization')}
            className={`p-4 rounded-lg flex flex-col items-center ${
              selectedAnalysis === 'optimization'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Fingerprint className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Optimization</span>
          </button>
          <button
            onClick={() => setSelectedAnalysis('correlation')}
            className={`p-4 rounded-lg flex flex-col items-center ${
              selectedAnalysis === 'correlation'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Network className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Correlation</span>
          </button>
        </div>
      </div>

      {/* Analysis Content */}
      <ErrorBoundary>
        {selectedAnalysis === 'monte-carlo' && (
          <MonteCarloAnalysis strategy={selectedStrategy} />
        )}

        {selectedAnalysis === 'walk-forward' && (
          <WalkForwardAnalysis strategy={selectedStrategy} />
        )}

        {selectedAnalysis === 'optimization' && (
          <OptimizationAnalysis strategy={selectedStrategy} />
        )}

        {selectedAnalysis === 'correlation' && (
          <CorrelationAnalysis strategy={selectedStrategy} />
        )}
      </ErrorBoundary>
    </div>
  );
}