import React, { useState } from 'react';
import { Strategy } from '../../../types/trading';
import { WalkForwardResults } from '../charts/WalkForwardResults';
import { useWalkForwardAnalysis } from '../hooks/useWalkForwardAnalysis';
import { LoadingSpinner } from '../charts/LoadingSpinner';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WalkForwardAnalysisProps {
  strategy: Strategy;
}

export function WalkForwardAnalysis({ strategy }: WalkForwardAnalysisProps) {
  const [windowSize, setWindowSize] = useState(30);
  const [trainRatio, setTrainRatio] = useState(0.7);
  const { analysisResults, isAnalyzing, error, startAnalysis } = useWalkForwardAnalysis(strategy);

  const handleStartAnalysis = async () => {
    try {
      await startAnalysis(windowSize, trainRatio);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Analysis Failed</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleStartAnalysis}
          className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Walk Forward Analysis</h3>
            <p className="text-sm text-gray-500">
              Test strategy robustness across different time periods
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Window Size (days):</label>
              <input
                type="number"
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                min={7}
                max={90}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Train Ratio:</label>
              <input
                type="number"
                value={trainRatio}
                onChange={(e) => setTrainRatio(Number(e.target.value))}
                min={0.5}
                max={0.9}
                step={0.1}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isAnalyzing
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>
        </div>

        {isAnalyzing ? (
          <LoadingSpinner />
        ) : analysisResults ? (
          <WalkForwardResults
            strategy={strategy}
            results={analysisResults}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Configure parameters and start the analysis to see results
          </div>
        )}
      </div>
    </div>
  );
}