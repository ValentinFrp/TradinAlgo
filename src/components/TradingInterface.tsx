import React, { useState } from "react";
import { OrderForm } from "./trading/OrderForm";
import { PositionCard } from "./trading/PositionCard";
import { useTrading } from "../hooks/useTrading";
import { useTradingStore } from "../store/tradingStore";
import { ArrowUpDown, Settings } from "lucide-react";

const AVAILABLE_PAIRS = [
  { symbol: "BTC/USD", price: 45000, minAmount: 0.001, maxAmount: 10 },
  { symbol: "ETH/USD", price: 2800, minAmount: 0.01, maxAmount: 100 },
  { symbol: "SOL/USD", price: 100, minAmount: 0.1, maxAmount: 1000 },
  { symbol: "AVAX/USD", price: 35, minAmount: 0.1, maxAmount: 1000 },
  { symbol: "MATIC/USD", price: 1.2, minAmount: 1, maxAmount: 10000 },
];

export function TradingInterface() {
  const { positions } = useTradingStore();
  const { executeOrder } = useTrading();
  const [selectedPair, setSelectedPair] = useState(AVAILABLE_PAIRS[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Form Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Place Order</h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-4 w-4 mr-1" />
              {showAdvanced ? "Basic" : "Advanced"}
            </button>
          </div>

          {/* Trading Pair Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trading Pair
            </label>
            <div className="relative">
              <select
                value={selectedPair.symbol}
                onChange={(e) =>
                  setSelectedPair(
                    AVAILABLE_PAIRS.find((p) => p.symbol === e.target.value)!,
                  )
                }
                className="w-full pl-8 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {AVAILABLE_PAIRS.map((pair) => (
                  <option key={pair.symbol} value={pair.symbol}>
                    {pair.symbol} - ${pair.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <OrderForm
            symbol={selectedPair.symbol}
            currentPrice={selectedPair.price}
            minAmount={selectedPair.minAmount}
            maxAmount={selectedPair.maxAmount}
            showAdvanced={showAdvanced}
            onOrderSubmitted={() => {
              // Refresh data after order
            }}
          />
        </div>

        {/* Active Positions Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Positions
          </h3>
          <div className="space-y-4">
            {positions.map((position) => (
              <PositionCard
                key={position.symbol}
                position={position}
                onClose={(symbol) => {
                  executeOrder(
                    symbol,
                    "sell",
                    position.amount,
                    position.currentPrice,
                  );
                }}
              />
            ))}
            {positions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active positions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
