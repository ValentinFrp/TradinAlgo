import React from "react";
import { Position } from "../../types/trading";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface PositionCardProps {
  position: Position;
  onClose?: (symbol: string) => void;
}

export function PositionCard({ position, onClose }: PositionCardProps) {
  const pnlPercentage =
    ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {position.symbol}
          </h3>
          <p className="text-sm text-gray-500">
            {position.amount} units @ ${position.entryPrice.toLocaleString()}
          </p>
        </div>
        {onClose && (
          <button
            onClick={() => onClose(position.symbol)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-lg font-medium text-gray-900">
            ${position.currentPrice.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">P&L</p>
          <div
            className={`flex items-center ${
              position.pnl >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {position.pnl >= 0 ? (
              <TrendingUp className="h-5 w-5 mr-1" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-1" />
            )}
            <span className="text-lg font-medium">
              ${Math.abs(position.pnl).toLocaleString()}
            </span>
            <span className="text-sm ml-1">
              ({pnlPercentage >= 0 ? "+" : ""}
              {pnlPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
