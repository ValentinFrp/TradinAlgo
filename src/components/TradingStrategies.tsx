import React, { useState } from 'react';
import { Strategy } from '../types/trading';
import { Bot, Play, Pause, Settings, TrendingUp, ChevronDown } from 'lucide-react';

interface TradingStrategiesProps {
  strategies: Strategy[];
  onActivate: (strategyId: string) => void;
  onDeactivate: (strategyId: string) => void;
  onEdit: (strategy: Strategy) => void;
}

export function TradingStrategies({
  strategies,
  onActivate,
  onDeactivate,
  onEdit
}: TradingStrategiesProps) {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const toggleExpand = (strategyId: string) => {
    setExpandedStrategy(expandedStrategy === strategyId ? null : strategyId);
  };

  return (
    <div className="space-y-4">
      {strategies.map((strategy) => (
        <div key={strategy.id} className="bg-white rounded-lg shadow">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <Bot className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{strategy.name}</h3>
                  <p className="text-sm text-gray-500">{strategy.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => strategy.isActive ? onDeactivate(strategy.id) : onActivate(strategy.id)}
                  className={`p-2 rounded-lg ${
                    strategy.isActive 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {strategy.isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => onEdit(strategy)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={() => toggleExpand(strategy.id)}
                  className={`p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-transform ${
                    expandedStrategy === strategy.id ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(strategy.performance.winRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Profit Factor</p>
                <p className="text-lg font-semibold text-gray-900">
                  {strategy.performance.profitFactor.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Trades</p>
                <p className="text-lg font-semibold text-gray-900">
                  {strategy.performance.totalTrades}
                </p>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedStrategy === strategy.id && (
            <div className="border-t border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Parameters</h4>
              <div className="grid grid-cols-2 gap-4">
                {strategy.parameters.map((param) => (
                  <div key={param.name} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">{param.name}</p>
                    <p className="text-base font-medium text-gray-900">{param.value}</p>
                    <div className="mt-1 text-xs text-gray-400">
                      Range: {param.min} - {param.max}
                    </div>
                  </div>
                ))}
              </div>
              
              {strategy.lastExecuted && (
                <div className="mt-4 text-sm text-gray-500">
                  Last executed: {new Date(strategy.lastExecuted).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}