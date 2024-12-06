import React from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Strategy } from '../../../types/trading';
import { ChartContainer } from './ChartContainer';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface WalkForwardResultsProps {
  strategy: Strategy;
  results?: {
    windows: Array<{
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
    }>;
    aggregatePerformance: {
      winRate: number;
      profitFactor: number;
      maxDrawdown: number;
      sharpeRatio: number;
    };
  };
}

export function WalkForwardResults({ strategy, results }: WalkForwardResultsProps) {
  if (!results?.windows || results.windows.length === 0) {
    return <NoDataPlaceholder message="No walk-forward analysis data available" />;
  }

  const chartData = results.windows.map(window => ({
    period: format(new Date(window.period.start), 'MMM d'),
    winRate: Number((window.performance.winRate * 100).toFixed(1)),
    profitFactor: Number(window.performance.profitFactor.toFixed(2)),
    maxDrawdown: Number((window.performance.maxDrawdown * 100).toFixed(1)),
    sharpeRatio: Number(window.performance.sharpeRatio.toFixed(2))
  }));

  return (
    <ChartContainer title="Walk-Forward Analysis Results">
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Performance Metrics Over Time</h4>
        <div className="w-full h-[400px]">
          <LineChart
            width={800}
            height={400}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="winRate"
              name="Win Rate (%)"
              stroke="#4f46e5"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="profitFactor"
              name="Profit Factor"
              stroke="#22c55e"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="maxDrawdown"
              name="Max Drawdown (%)"
              stroke="#ef4444"
            />
          </LineChart>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Parameter Evolution</h4>
          <div className="space-y-4">
            {strategy.parameters.map(param => (
              <div key={param.name} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-600 mb-2">{param.name}</h5>
                <div className="flex flex-wrap gap-2">
                  {results.windows.map((window, i) => {
                    const value = window.parameters[param.name];
                    return value !== undefined ? (
                      <div
                        key={i}
                        className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        {format(new Date(window.period.start), 'MMM d')}: {value.toFixed(2)}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Aggregate Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {(results.aggregatePerformance.winRate * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Profit Factor</p>
              <p className="text-lg font-semibold text-gray-900">
                {results.aggregatePerformance.profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Max Drawdown</p>
              <p className="text-lg font-semibold text-gray-900">
                {(results.aggregatePerformance.maxDrawdown * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Sharpe Ratio</p>
              <p className="text-lg font-semibold text-gray-900">
                {results.aggregatePerformance.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}