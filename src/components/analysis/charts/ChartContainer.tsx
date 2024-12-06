import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}