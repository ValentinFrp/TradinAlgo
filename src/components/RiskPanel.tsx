import React from 'react';
import { useRiskStore } from '../store/riskStore';
import { useTradingStore } from '../store/tradingStore';
import { AlertTriangle, DollarSign, TrendingDown, Percent } from 'lucide-react';

export function RiskPanel() {
  const { maxLossAmount, riskPerTradeAmount } = useRiskStore();
  const { balance, positions } = useTradingStore();

  const totalExposure = positions.reduce((sum, pos) => 
    sum + (pos.amount * pos.currentPrice), 0
  );
  
  const exposurePercentage = (totalExposure / balance) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Risk Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Max Loss Amount</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${maxLossAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Risk Per Trade</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${riskPerTradeAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingDown className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Total Exposure</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${totalExposure.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Percent className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Exposure Percentage</span>
          </div>
          <p className={`text-lg font-semibold ${
            exposurePercentage > 50 ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {exposurePercentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}