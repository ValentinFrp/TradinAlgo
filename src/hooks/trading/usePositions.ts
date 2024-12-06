import { useState, useEffect } from "react";
import { Position } from "../../types/trading";
import { useWebSocket } from "../useWebSocket";
import { calculatePositionPnL } from "../../utils/trading";

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, error: wsError } = useWebSocket({
    url: "ws://localhost:8080/ws/positions",
    onMessage: (data) => {
      const updatedPositions = data.map((pos: Position) => ({
        ...pos,
        ...calculatePositionPnL(pos),
      }));
      setPositions(updatedPositions);
      setIsLoading(false);
    },
    onError: () => {
      setError("Failed to connect to positions stream");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (wsError) {
      setError("Connection error occurred");
    }
  }, [wsError]);

  return {
    positions,
    isLoading,
    error,
    isConnected,
  };
}
