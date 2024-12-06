import { useEffect, useRef, useState } from 'react';

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(config: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = config.reconnectAttempts || 5;
  const reconnectInterval = config.reconnectInterval || 1000;

  const connect = () => {
    try {
      wsRef.current = new WebSocket(config.url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        config.onMessage?.(data);
      };

      wsRef.current.onerror = (event) => {
        setError(event);
        config.onError?.(event);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval * Math.pow(2, reconnectAttemptsRef.current));
        }
      };
    } catch (err) {
      setError(err as Event);
      config.onError?.(err as Event);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [config.url]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    error,
    sendMessage
  };
}