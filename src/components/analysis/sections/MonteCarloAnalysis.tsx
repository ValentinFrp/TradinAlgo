import React, { useState } from 'react';
import { Strategy } from '../../../types/trading';
import { MonteCarloChart } from '../charts/MonteCarloChart';
import { useMonteCarloSimulation } from '../hooks/useMonteCarloSimulation';
import { LoadingSpinner } from '../charts/LoadingSpinner';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MonteCarloAnalysisProps {
  strategy: Strategy;
}

export function MonteCarloAnalysis({ strategy }: MonteCarloAnalysisProps) {
  const [sampleSize, setSampleSize] = useState(1000);
  const { simulationData, isLoading, error, runSimulation } = useMonteCarloSimulation(strategy);

  const handleRunSimulation = async () => {
    try {
      await runSimulation(sampleSize);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Simulation Failed</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRunSimulation}
          className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Monte Carlo Analysis</h3>
            <p className="text-sm text-gray-500">
              Analyze strategy performance across multiple market scenarios
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sample Size:</label>
              <input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                min={100}
                max={10000}
                step={100}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isLoading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isLoading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : simulationData ? (
          <MonteCarloChart data={simulationData} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Configure parameters and run the simulation to see results
          </div>
        )}
      </div>
    </div>
  );
}