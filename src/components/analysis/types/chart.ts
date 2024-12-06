export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
  data: ChartDataPoint[];
}

export interface ChartOptions {
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}