import { create } from 'zustand';
import { Strategy } from '../types/trading';

interface AnalysisState {
  selectedStrategy: Strategy | null;
  analysisType: 'monte-carlo' | 'walk-forward' | 'optimization' | 'correlation';
  results: {
    monteCarlo: any | null;
    walkForward: any | null;
    optimization: any | null;
    correlation: any | null;
  };
  isAnalyzing: boolean;
  error: string | null;
}

interface AnalysisActions {
  setSelectedStrategy: (strategy: Strategy | null) => void;
  setAnalysisType: (type: AnalysisState['analysisType']) => void;
  startAnalysis: () => Promise<void>;
  setResults: (type: AnalysisState['analysisType'], results: any) => void;
  clearResults: () => void;
  setError: (error: string | null) => void;
}

const initialState: AnalysisState = {
  selectedStrategy: null,
  analysisType: 'monte-carlo',
  results: {
    monteCarlo: null,
    walkForward: null,
    optimization: null,
    correlation: null
  },
  isAnalyzing: false,
  error: null
};

export const useAnalysisStore = create<AnalysisState & AnalysisActions>((set, get) => ({
  ...initialState,

  setSelectedStrategy: (strategy) => set({ 
    selectedStrategy: strategy,
    results: initialState.results, // Clear results when strategy changes
    error: null
  }),
  
  setAnalysisType: (type) => set({ 
    analysisType: type,
    error: null 
  }),
  
  startAnalysis: async () => {
    const { selectedStrategy, analysisType } = get();
    if (!selectedStrategy) {
      set({ error: 'No strategy selected' });
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      let results;
      switch (analysisType) {
        case 'monte-carlo':
          results = await generateMonteCarloResults();
          break;
        case 'walk-forward':
          results = await generateWalkForwardResults(selectedStrategy);
          break;
        case 'optimization':
          results = await generateOptimizationResults(selectedStrategy);
          break;
        case 'correlation':
          results = await generateCorrelationResults(selectedStrategy);
          break;
      }

      set(state => ({
        results: {
          ...state.results,
          [analysisType]: results
        }
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Analysis failed' });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  setResults: (type, results) => set(state => ({
    results: { ...state.results, [type]: results }
  })),

  clearResults: () => set({ results: initialState.results }),

  setError: (error) => set({ error })
}));

// Mock data generation functions remain the same...