import React, { useState } from 'react';
import { Strategy } from '../types/trading';
import { BacktestPanel } from './BacktestPanel';
import { StrategyOptimizer } from './StrategyOptimizer';
import { TradingStrategies } from './TradingStrategies';

interface StrategyPanelProps {
  strategies: Strategy[];
  onActivate: (strategyId: string) => void;
  onDeactivate: (strategyId: string) => void;
  onEdit: (strategy: Strategy) => void;
  onUpdateParameters?: (strategyId: string, parameters: Record<string, number>) => void;
}

export function StrategyPanel({
  strategies,
  onActivate,
  onDeactivate,
  onEdit,
  onUpdateParameters
}: StrategyPanelProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeTab, setActiveTab] = useState<'backtest' | 'optimize'>('backtest');

  const handleApplyParameters = (parameters: Record<string, number>) => {
    if (selectedStrategy && onUpdateParameters) {
      onUpdateParameters(selectedStrategy.id, parameters);
    }
  };

  return (
    <div className="space-y-6">
      <TradingStrategies
        strategies={strategies}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        onEdit={(strategy) => {
          setSelectedStrategy(strategy);
          onEdit(strategy);
        }}
      />

      {selectedStrategy && (
        <div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('backtest')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'backtest'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Backtest
            </button>
            <button
              onClick={() => setActiveTab('optimize')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'optimize'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Optimize
            </button>
          </div>

          {activeTab === 'backtest' ? (
            <BacktestPanel strategy={selectedStrategy} />
          ) : (
            <StrategyOptimizer
              strategy={selectedStrategy}
              onApplyParameters={handleApplyParameters}
            />
          )}
        </div>
      )}
    </div>
  );
}