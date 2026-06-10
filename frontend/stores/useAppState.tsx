"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  KpiId, Scenario, ScenarioOutput, ReverseStressResult, 
  ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth 
} from '@/lib/types';

export interface AppState {
  baseCase: Record<KpiId, number>;
  scenarioLibrary: Scenario[];
  activeScenario: Scenario | null;
  scenarioOutput: ScenarioOutput | null;
  comparisonA: Scenario | null;
  comparisonB: Scenario | null;
  reverseStressResult: ReverseStressResult | null;
  forecast: ForecastPoint[];
  monteCarloResult: MonteCarloResult | null;
  briefs: BoardBrief[];
  pipelineHealth: PipelineHealth | null;
  globalLoading: boolean;
}

const initialState: AppState = {
  baseCase: {} as Record<KpiId, number>,
  scenarioLibrary: [],
  activeScenario: null,
  scenarioOutput: null,
  comparisonA: null,
  comparisonB: null,
  reverseStressResult: null,
  forecast: [],
  monteCarloResult: null,
  briefs: [],
  pipelineHealth: null,
  globalLoading: false,
};

type Action =
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_SCENARIO_LIBRARY'; payload: Scenario[] }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: Scenario | null }
  | { type: 'SET_SCENARIO_OUTPUT'; payload: ScenarioOutput | null }
  | { type: 'SET_BASE_CASE'; payload: Record<KpiId, number> }
  | { type: 'SET_PIPELINE_HEALTH'; payload: PipelineHealth | null }
  | { type: 'SET_FORECAST'; payload: ForecastPoint[] }
  | { type: 'SET_MONTE_CARLO'; payload: MonteCarloResult | null }
  | { type: 'SET_BRIEFS'; payload: BoardBrief[] };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_GLOBAL_LOADING': return { ...state, globalLoading: action.payload };
    case 'SET_SCENARIO_LIBRARY': return { ...state, scenarioLibrary: action.payload };
    case 'SET_ACTIVE_SCENARIO': return { ...state, activeScenario: action.payload };
    case 'SET_SCENARIO_OUTPUT': return { ...state, scenarioOutput: action.payload };
    case 'SET_BASE_CASE': return { ...state, baseCase: action.payload };
    case 'SET_PIPELINE_HEALTH': return { ...state, pipelineHealth: action.payload };
    case 'SET_FORECAST': return { ...state, forecast: action.payload };
    case 'SET_MONTE_CARLO': return { ...state, monteCarloResult: action.payload };
    case 'SET_BRIEFS': return { ...state, briefs: action.payload };
    default: return state;
  }
}

const AppStateContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
