import { ChartDataPoint } from '../types/chart';

export function transformTimeseriesData(
  data: number[],
  timestamps?: number[]
): ChartDataPoint[] {
  return data.map((value, index) => ({
    x: timestamps ? timestamps[index] : index,
    y: value
  }));
}

export function calculateMovingAverage(
  data: number[],
  period: number
): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

export function calculatePercentageChange(
  data: number[]
): number[] {
  return data.map((value, index) => {
    if (index === 0) return 0;
    return ((value - data[index - 1]) / data[index - 1]) * 100;
  });
}