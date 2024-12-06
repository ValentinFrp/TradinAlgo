import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCalled = useRef<number>(0);
  const lastArgs = useRef<any[]>([]);
  const lastResult = useRef<ReturnType<T>>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (
      now - lastCalled.current > delay ||
      JSON.stringify(args) !== JSON.stringify(lastArgs.current)
    ) {
      lastResult.current = callback(...args);
      lastCalled.current = now;
      lastArgs.current = args;
    }
    
    return lastResult.current;
  }, [callback, delay]) as T;
}