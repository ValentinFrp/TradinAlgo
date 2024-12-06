import React from 'react';
import { LineChart } from 'lucide-react';

interface NoDataPlaceholderProps {
  message?: string;
}

export function NoDataPlaceholder({ message = 'No data available' }: NoDataPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg">
      <LineChart className="h-12 w-12 text-gray-300 mb-4" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}