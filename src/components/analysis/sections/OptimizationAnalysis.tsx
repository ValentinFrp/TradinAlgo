import React, { useState } from 'react';
import { Strategy } from '../../../types/trading';
import { BayesianOptimizationChart } from '../charts/BayesianOptimizationChart';
import { ParticleSwarmChart } from '../charts/ParticleSwarmChart';
import { SimulatedAnnealingChart } from '../charts/SimulatedAnnealingChart';
import { AntColonyChart } from '../charts/AntColonyChart';
import { useOptimization } from '../../../hooks/useOptimization';
import { Settings, Play, AlertTriangle } from 'lucide-react';
import { ChartContainer } from '../charts/ChartContainer';
import { LoadingSpinner } from '../charts/LoadingSpinner';

interface OptimizationAnalysisProps {
  strategy: Strategy;
}

export function OptimizationAnalysis({ strategy }: OptimizationAnalysisProps) {
  const [optimizerType, setOptimizerType] = useState<'bayesian' | 'pso' | 'annealing' | 'antcolony'>('bayesian');
  const { startOptimization, isOptimizing, error, results } = useOptimization(strategy);

  const renderOptimizationChart = () => {
    if (!results) return null;

    switch (optimizerType) {
      case 'bayesian':
        return (
          <BayesianOptimizationChart
            acquisitionHistory={results.acquisitionHistory || []}
            uncertaintyHistory={results.uncertaintyHistory || []}
          />
        );
      case 'pso':
        return (
          <ParticleSwarmChart
            particleHistory={results.particleHistory || []}
            convergenceHistory={results.convergenceHistory || []}
            parameterNames={strategy.parameters.map(p => p.name)}
          />
        );
      case 'annealing':
        return (
          <SimulatedAnnealingChart
            temperatureHistory={results.temperatureHistory || []}
            fitnessHistory={results.fitnessHistory || []}
          />
        );
      case 'antcolony':
        return (
          <AntColonyChart
            pheromoneHistory={results.pheromoneHistory || []}
            fitnessHistory={results.convergenceHistory || []}
            parameterNames={strategy.parameters.map(p => p.name)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Strategy Optimization</h3>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={optimizerType}
              onChange={(e) => setOptimizerType(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="bayesian">Bayesian Optimization</option>
              <option value="pso">Particle Swarm</option>
              <option value="annealing">Simulated Annealing</option>
              <option value="antcolony">Ant Colony</option>
            </select>
            <button
              onClick={() => startOptimization(optimizerType)}
              disabled={isOptimizing}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isOptimizing
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Play className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {isOptimizing ? (
          <ChartContainer title="Optimization Progress">
            <LoadingSpinner />
          </ChartContainer>
        ) : (
          renderOptimizationChart()
        )}

        {results && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Best Parameters</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(results.bestParameters || {}).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500">{key}</p>
                    <p className="text-sm font-medium">{(value as number).toFixed(4)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Best Fitness</p>
                  <p className="text-sm font-medium">
                    {results.bestFitness?.toFixed(4) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Improvement</p>
                  <p className="text-sm font-medium">
                    {results.bestFitness && results.initialFitness
                      ? ((results.bestFitness / results.initialFitness - 1) * 100).toFixed(2)
                      : 'N/A'}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}