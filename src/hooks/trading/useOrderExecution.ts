import { useState, useCallback } from "react";
import { Trade } from "../../types/trading";
import { useTradingStore } from "../../store/tradingStore";
import { validateOrder } from "../../utils/trading";

export function useOrderExecution() {
  const { balance, updateBalance, addPosition, closePosition, addTrade } =
    useTradingStore();
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
        const validation = validateOrder(type, amount, price, balance, []);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const trade: Trade = {
          id: Math.random().toString(36).substr(2, 9),
          symbol,
          type,
          price,
          amount,
          timestamp: new Date().toISOString(),
        };

        if (type === "buy") {
          addPosition({
            symbol,
            amount,
            entryPrice: price,
            currentPrice: price,
            pnl: 0,
          });
          updateBalance(-amount * price);
        } else {
          closePosition(symbol);
          updateBalance(amount * price);
        }

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
    [balance, addPosition, closePosition, addTrade, updateBalance],
  );

  return {
    executeOrder,
    isExecuting,
    error,
  };
}
