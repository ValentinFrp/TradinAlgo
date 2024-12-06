import { useState, useEffect, useRef } from 'react';

interface VirtualizedListOptions {
  itemHeight: number;
  overscan?: number;
}

export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  options: VirtualizedListOptions
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { itemHeight, overscan = 3 } = options;
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const newStartIndex = Math.floor(scrollTop / itemHeight);
      
      setStartIndex(Math.max(0, newStartIndex - overscan));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [itemHeight, overscan]);

  useEffect(() => {
    const start = startIndex;
    const end = Math.min(start + visibleCount, items.length);
    setVisibleItems(items.slice(start, end));
  }, [items, startIndex, visibleCount]);

  return {
    containerRef,
    visibleItems,
    startIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
}