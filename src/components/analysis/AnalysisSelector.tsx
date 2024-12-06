import React from 'react';
import { BarChart, Brain, Fingerprint, Network } from 'lucide-react';
import { AnalysisType } from './AnalysisPanel';

interface AnalysisSelectorProps {
  selectedAnalysis: AnalysisType;
  onSelect: (analysis: AnalysisType) => void;
}

const ANALYSIS_OPTIONS = [
  {
    id: 'monte-carlo' as const,
    label: 'Monte Carlo',
    icon: BarChart,
  },
  {
    id: 'walk-forward' as const,
    label: 'Walk Forward',
    icon: Brain,
  },
  {
    id: 'optimization' as const,
    label: 'Optimization',
    icon: Fingerprint,
  },
  {
    id: 'correlation' as const,
    label: 'Correlation',
    icon: Network,
  },
] as const;

export function AnalysisSelector({ selectedAnalysis, onSelect }: AnalysisSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ANALYSIS_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-4 rounded-lg flex flex-col items-center transition-colors ${
              selectedAnalysis === id
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}