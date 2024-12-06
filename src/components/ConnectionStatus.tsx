import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  type: string;
}

export function ConnectionStatus({ isConnected, type }: ConnectionStatusProps) {
  return (
    <div className={`flex items-center px-3 py-1 rounded-lg ${
      isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 mr-2" />
          <span className="text-sm">{type} Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-2" />
          <span className="text-sm">{type} Disconnected</span>
        </>
      )}
    </div>
  );
}