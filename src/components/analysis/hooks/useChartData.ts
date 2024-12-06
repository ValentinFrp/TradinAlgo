import { useState, useEffect } from 'react';
import { ChartDataPoint } from '../types/chart';

export function useChartData<T>(
  data: T[],
  transformFn: (item: T) => ChartDataPoint
) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const transformed = data.map(transformFn);
    setChartData(transformed);
  }, [data, transformFn]);

  return chartData;
}