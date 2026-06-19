"use client";

import { useState } from 'react';
import { useAppState } from '@/stores/useAppState';
import { TargetBuilderCard } from '@/components/reverse/TargetBuilderCard';
import { SingleScenarioSolver } from '@/components/reverse/SingleScenarioSolver';
import { CrossScenarioSweep } from '@/components/reverse/CrossScenarioSweep';
import { TopDangerousScenariosCard } from '@/components/reverse/TopDangerousScenariosCard';
import { reverseStress } from '@/lib/api';
import { ReverseStressInput } from '@/lib/types';
import { ActivitySquare } from 'lucide-react';

export default function ReversePage() {
  const { state, dispatch } = useAppState();
  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = async (input: ReverseStressInput) => {
    setIsSolving(true);
    try {
      const result = await reverseStress(input);
      dispatch({ type: 'SET_REVERSE_STRESS_RESULT', payload: result });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSolving(false);
    }
  };

  const res = state.reverseStressResult;

  return (
    <div className="flex flex-col space-y-6 pb-8 animate-in fade-in duration-500">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center shrink-0">
          <ActivitySquare className="w-5 h-5 text-error" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Reverse Stress</h1>
          <p className="text-on-surface-variant mt-0.5">Find which scenarios breach a target KPI threshold</p>
        </div>
      </div>

      {/* Target Builder */}
      <TargetBuilderCard onSolve={handleSolve} isSolving={isSolving} />

      {res ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <SingleScenarioSolver 
                input={res.input}
                result={res.singleScenarioResult} 
                onSolveScenario={(scenarioId) => handleSolve({ ...res.input, scenarioId })} 
              />
            </div>
            <div className="lg:col-span-6">
              <CrossScenarioSweep 
                result={res.crossScenarioRanking} 
              />
            </div>
          </div>
          
          {res.crossScenarioRanking && res.crossScenarioRanking.length > 0 && (
            <TopDangerousScenariosCard ranking={res.crossScenarioRanking} />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-outline/20 rounded-xl p-12">
          <div className="text-center">
            <h3 className="font-sans text-xl font-bold text-white mb-2">Define an Unacceptable Outcome</h3>
            <p className="font-sans text-on-surface-variant max-w-md">
              The reverse stress solver will search across the severity parameter space to find the exact multiplier required to breach your defined target.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
