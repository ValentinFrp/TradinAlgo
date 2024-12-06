import React, { useState } from "react";
import { useTrading } from "../../hooks/useTrading";
import { AlertTriangle } from "lucide-react";

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
  minAmount: number;
  maxAmount: number;
  showAdvanced?: boolean;
  onOrderSubmitted?: () => void;
}

export function OrderForm({
  symbol,
  currentPrice,
  minAmount,
  maxAmount,
  showAdvanced = false,
  onOrderSubmitted,
}: OrderFormProps) {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const { executeOrder, isExecuting, error } = useTrading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await executeOrder(symbol, type, Number(amount), currentPrice, {
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        takeProfit: takeProfit ? Number(takeProfit) : undefined,
      });
      setAmount("");
      setStopLoss("");
      setTakeProfit("");
      onOrderSubmitted?.();
    } catch (err) {
      // Error is handled by useTrading hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setType("buy")}
          className={`flex-1 py-2 rounded-lg ${
            type === "buy"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setType("sell")}
          className={`flex-1 py-2 rounded-lg ${
            type === "sell"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sell
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount ({symbol.split("/")[0]})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={minAmount}
          max={maxAmount}
          step={minAmount}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Min: {minAmount}, Max: {maxAmount}
        </p>
      </div>

      {showAdvanced && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stop Loss (optional)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              min={0}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Take Profit (optional)
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              min={0}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </>
      )}

      <div className="text-sm text-gray-500">
        Total: ${(Number(amount) * currentPrice).toLocaleString()}
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isExecuting || !amount}
        className={`w-full py-2 rounded-lg ${
          isExecuting
            ? "bg-gray-100 text-gray-400"
            : type === "buy"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isExecuting
          ? "Executing..."
          : `${type === "buy" ? "Buy" : "Sell"} ${symbol}`}
      </button>
    </form>
  );
}
