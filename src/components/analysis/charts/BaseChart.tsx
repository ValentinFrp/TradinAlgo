import React from 'react';
import { ChartContainer } from './ChartContainer';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface BaseChartProps {
  title: string;
  hasData: boolean;
  children: React.ReactNode;
}

export function BaseChart({ title, hasData, children }: BaseChartProps) {
  return (
    <ChartContainer title={title}>
      {hasData ? children : <NoDataPlaceholder />}
    </ChartContainer>
  );
}