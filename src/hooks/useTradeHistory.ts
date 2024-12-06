import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { Trade } from '../types/trading';

export function useTradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, error: wsError } = useWebSocket({
    url: 'ws://localhost:8080/ws/trades',
    onMessage: (data) => {
      setTrades(prevTrades => [data, ...prevTrades].slice(0, 100));
      setIsLoading(false);
    },
    onError: () => {
      setError('Failed to connect to trade history stream');
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (wsError) {
      setError('Connection error occurred');
    }
  }, [wsError]);

  return {
    trades,
    isLoading,
    error,
    isConnected
  };
}