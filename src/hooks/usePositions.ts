import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { Position } from '../types/trading';

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, error: wsError } = useWebSocket({
    url: 'ws://localhost:8080/ws/positions',
    onMessage: (data) => {
      setPositions(data);
      setIsLoading(false);
    },
    onError: () => {
      setError('Failed to connect to positions stream');
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (wsError) {
      setError('Connection error occurred');
    }
  }, [wsError]);

  return {
    positions,
    isLoading,
    error,
    isConnected
  };
}