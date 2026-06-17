"use client";

import { useState } from 'react';
import { useAppState } from '@/stores/useAppState';
import { TargetBuilderCard } from '@/components/reverse/TargetBuilderCard';
import { SingleScenarioSolver } from '@/components/reverse/SingleScenarioSolver';
import { CrossScenarioSweep } from '@/components/reverse/CrossScenarioSweep';
import { TopDangerousScenariosCard } from '@/components/reverse/TopDangerousScenariosCard';
import { reverseStress } from '@/lib/api';
import { ReverseStressInput } from '@/lib/types';

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
