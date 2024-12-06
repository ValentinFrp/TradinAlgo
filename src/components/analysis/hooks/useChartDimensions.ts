import { useState, useEffect, useCallback } from 'react';
import { CHART_DIMENSIONS } from '../constants/chartConfig';

export function useChartDimensions(containerRef: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState(CHART_DIMENSIONS);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions(prev => ({
        ...prev,
        width: width - prev.margin.left - prev.margin.right
      }));
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  return dimensions;
}