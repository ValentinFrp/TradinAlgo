import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-600 text-sm font-medium">Failed to render chart</p>
          <p className="text-red-500 text-xs mt-2">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}