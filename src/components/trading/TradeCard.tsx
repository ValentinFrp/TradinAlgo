import React from "react";
import { Trade } from "../../types/trading";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TradeCardProps {
  trade: Trade;
}

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{trade.symbol}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(trade.timestamp), "MMM d, HH:mm:ss")}
          </p>
        </div>
        <span
          className={`flex items-center ${
            trade.type === "buy" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trade.type === "buy" ? (
            <ArrowUpRight className="h-5 w-5 mr-1" />
          ) : (
            <ArrowDownRight className="h-5 w-5 mr-1" />
          )}
          {trade.type.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-lg font-medium text-gray-900">
            {trade.amount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-lg font-medium text-gray-900">
            ${trade.price.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-lg font-medium text-gray-900">
          ${(trade.price * trade.amount).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
