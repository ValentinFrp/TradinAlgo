import { useState, useEffect } from "react";
import { CandlestickData } from "../types/trading";
import { marketDataService } from "../services/marketDataService";

export function useMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = marketDataService.subscribeToMarketData((data) => {
      setMarketData((prevData) => {
        const newData = [...prevData, data];
        // Keep last 100 candles
        return newData.slice(-100);
      });
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  return {
    marketData,
    isLoading,
    error,
  };
}
