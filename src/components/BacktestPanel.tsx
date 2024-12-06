import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Play, Settings, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Strategy } from '../types/trading';
import { useBacktest } from '../hooks/useBacktest';

interface BacktestPanelProps {
  strategy: Strategy;
}

export function BacktestPanel({ strategy }: BacktestPanelProps) {
  const [params, setParams] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    initialBalance: 10000,
    symbol: 'BTC/USD'
  });

  const { executeBacktest, isLoading, error, result } = useBacktest(strategy);

  const handleRunBacktest = async () => {
    try {
      await executeBacktest(params);
    } catch (err) {
      // Error is already handled in useBacktest
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Backtest Configuration</h2>
        </div>
        <button
          onClick={handleRunBacktest}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 rounded-lg ${
            isLoading
              ? 'bg-gray-100 text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Play className="h-4 w-4 mr-2" />
          {isLoading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={format(params.startDate, 'yyyy-MM-dd')}
              onChange={(e) => setParams({ ...params, startDate: new Date(e.target.value) })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={format(params.endDate, 'yyyy-MM-dd')}
              onChange={(e) => setParams({ ...params, endDate: new Date(e.target.value) })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Balance
          </label>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="number"
              value={params.initialBalance}
              onChange={(e) => setParams({ ...params, initialBalance: Number(e.target.value) })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trading Pair
          </label>
          <select
            value={params.symbol}
            onChange={(e) => setParams({ ...params, symbol: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="BTC/USD">BTC/USD</option>
            <option value="ETH/USD">ETH/USD</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backtest Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Final Balance</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ${result.finalBalance.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Win Rate</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {(result.winRate * 100).toFixed(2)}%
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Percent className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Max Drawdown</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {(result.maxDrawdown * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}