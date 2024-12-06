import { useState, useCallback } from "react";
import { Position, Trade } from "../types/trading";
import { useTradingStore } from "../store/tradingStore";

export function useTrading() {
  const {
    balance,
    updateBalance,
    addPosition,
    updatePosition,
    closePosition,
    addTrade,
  } = useTradingStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOrder = useCallback(
    async (
      symbol: string,
      type: "buy" | "sell",
      amount: number,
      price: number,
    ) => {
      setIsExecuting(true);
      setError(null);

      try {
        // Validate order
        if (amount <= 0) throw new Error("Invalid amount");
        if (price <= 0) throw new Error("Invalid price");

        const total = amount * price;

        // Check if enough balance for buy order
        if (type === "buy" && total > balance) {
          throw new Error("Insufficient balance");
        }

        // Create trade record
        const trade: Trade = {
          id: Math.random().toString(36).substr(2, 9),
          symbol,
          type,
          price,
          amount,
          timestamp: new Date().toISOString(),
        };

        // Update position
        if (type === "buy") {
          addPosition({
            symbol,
            amount,
            entryPrice: price,
            currentPrice: price,
            pnl: 0,
          });
          updateBalance(-total);
        } else {
          closePosition(symbol);
          updateBalance(total);
        }

        // Record trade
        addTrade(trade);

        return trade;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to execute order",
        );
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [
      balance,
      addPosition,
      updatePosition,
      closePosition,
      addTrade,
      updateBalance,
    ],
  );

  return {
    executeOrder,
    isExecuting,
    error,
  };
}
