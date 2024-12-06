import React, { useState } from 'react';
import { BarChart, Brain, Fingerprint, Network } from 'lucide-react';
import { MonteCarloChart } from './charts/MonteCarloChart';
import { WalkForwardResults } from './charts/WalkForwardResults';
import { CorrelationMatrix } from './charts/CorrelationMatrix';
import { BayesianOptimizationChart } from './charts/BayesianOptimizationChart';
import { useTradingStore } from '../../store/tradingStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import { LoadingSpinner } from './charts/LoadingSpinner';
import { NoDataPlaceholder } from './charts/NoDataPlaceholder';

export function AnalysisPanel() {
  const { activeStrategies } = useTradingStore();
  const [selectedStrategy] = useState(activeStrategies[0]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<'monte-carlo' | 'walk-forward' | 'optimization' | 'correlation'>('monte-carlo');
  const { runAnalysis, isAnalyzing, error, results } = useAnalysis(selectedStrategy);

  const handleStartAnalysis = async () => {
    try {
      await runAnalysis(selectedAnalysis);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      );
    }

    switch (selectedAnalysis) {
      case 'monte-carlo':
        return results?.monteCarlo ? (
          <MonteCarloChart data={results.monteCarlo} />
        ) : (
          <NoDataPlaceholder message="Run Monte Carlo analysis to see results" />
        );

      case 'walk-forward':
        return results?.walkForward ? (
          <WalkForwardResults
            strategy={selectedStrategy}
            results={results.walkForward}
          />
        ) : (
          <NoDataPlaceholder message="Run Walk Forward analysis to see results" />
        );

      case 'optimization':
        return results?.optimization ? (
          <BayesianOptimizationChart
            acquisitionHistory={results.optimization.acquisitionHistory}
            uncertaintyHistory={results.optimization.uncertaintyHistory}
          />
        ) : (
          <NoDataPlaceholder message="Run Optimization to see results" />
        );

      case 'correlation':
        return results?.correlation ? (
          <CorrelationMatrix
            strategy={selectedStrategy}
            results={results.correlation}
          />
        ) : (
          <NoDataPlaceholder message="Run Correlation analysis to see results" />
        );

      default:
        return null;
    }
  };

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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedStrategy?.name} Analysis
          </h2>
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-lg ${
              isAnalyzing
                ? 'bg-gray-100 text-gray-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
        </div>

        {renderAnalysisContent()}
      </div>
    </div>
  );
}