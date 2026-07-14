"use client";

import { useState } from 'react';
import { useAppState } from '@/stores/useAppState';
import { TargetBuilderCard } from '@/components/reverse/TargetBuilderCard';
import { SingleScenarioSolver } from '@/components/reverse/SingleScenarioSolver';
import { CrossScenarioSweep } from '@/components/reverse/CrossScenarioSweep';
import { TopDangerousScenariosCard } from '@/components/reverse/TopDangerousScenariosCard';
import { reverseStress } from '@/lib/api';
import { ReverseStressInput } from '@/lib/types';
import { ActivitySquare, Info, Target, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

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

      {/* ── Explanation banner ── */}
      <div className="rounded-xl border border-outline/20 bg-surface-container-low p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-error/10 shrink-0">
            <Info className="w-4 h-4 text-error" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-semibold text-on-surface mb-1">
              What is Reverse Stress Testing?
            </p>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              In a normal stress test you pick a scenario and ask <em>"how bad would things get?"</em>{' '}
              Reverse stress testing flips the question: you define an unacceptable outcome first —
              for example <em>"Revenue drops below GHS 8 billion"</em> — and the solver works backwards
              to find the exact scenario severity that would cause it. This is essential for
              identifying hidden failure points before a crisis occurs.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            {
              icon: Target,
              color: 'text-mtn-yellow',
              bg: 'bg-mtn-yellow/10',
              step: '1. Define the threshold',
              desc: 'Pick a KPI (e.g. Revenue) and set the minimum acceptable value in GHS millions.',
            },
            {
              icon: Search,
              color: 'text-blue-400',
              bg: 'bg-blue-400/10',
              step: '2. Binary-search solver',
              desc: 'The engine runs a binary search over scenario severity (0×–10×) to find the exact tipping point that breaches your threshold.',
            },
            {
              icon: ShieldAlert,
              color: 'text-error',
              bg: 'bg-error/10',
              step: '3. Read the verdict',
              desc: 'If the threshold is breached, you see which severity level triggers it and how far that is from the base case — your buffer.',
            },
          ].map(({ icon: Icon, color, bg, step, desc }) => (
            <div key={step} className="rounded-lg border border-outline/15 p-3 space-y-1.5">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <p className={`font-mono text-[9px] uppercase tracking-widest font-bold ${color}`}>{step}</p>
              <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Reading the output */}
        <div className="rounded-lg border border-outline/15 bg-surface-container/40 p-3 flex gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
          <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Cross-scenario sweep:</strong> The solver also ranks <em>all</em>{' '}
            scenarios by how close they come to breaching your threshold, giving you a danger league-table —
            the ones at the top require the least severity amplification to cause a breach and are therefore
            your most urgent real-world risk.
          </p>
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
