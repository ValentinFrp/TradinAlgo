import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="mt-4 text-gray-600">Processing data...</span>
    </div>
  );
}