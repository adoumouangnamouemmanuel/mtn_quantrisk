"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReverseStressInput } from '@/lib/types';
import { BinarySearchTrajectory } from './BinarySearchTrajectory';
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { MOCK_SCENARIOS } from '@/lib/mockData';

interface SingleScenarioSolverProps {
  input: ReverseStressInput;
  result?: {
    scenarioId: string;
    requiredSeverityMultiplier: number;
    breachKpiValue: number;
    binarySearchTrajectory: Array<{ iteration: number; severity: number; kpiValue: number }>;
  };
  onSolveScenario: (scenarioId: string) => void;
}

export function SingleScenarioSolver({ input, result, onSolveScenario }: SingleScenarioSolverProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const scenario = result ? MOCK_SCENARIOS.find(s => s.id === result.scenarioId) : null;
  const severity = result?.requiredSeverityMultiplier || 0;
  
  // Cap visual bar at 5.0 to avoid breaking layout if requires crazy severity
  const severityPercent = Math.min(100, Math.max(0, ((severity - 0.5) / 4.5) * 100));

  return (
    <Card className="p-6 bg-surface-container-low h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sans text-lg font-bold text-white">Single Scenario Solver</h3>
        <Button variant="outline" size="sm" onClick={() => setPickerOpen(!pickerOpen)}>
          {scenario ? scenario.id : 'Select Scenario'}
        </Button>
      </div>

      {pickerOpen && (
        <div className="absolute mt-12 z-50 bg-surface border border-outline/20 rounded-xl shadow-2xl h-[400px] w-80 right-0 md:left-0 md:right-auto flex flex-col">
          <ScenarioPicker 
            activeId={scenario?.id}
            onSelect={(s) => {
              onSolveScenario(s.id);
              setPickerOpen(false);
            }} 
          />
        </div>
      )}

      {result ? (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant block mb-2">
              Required severity multiplier to breach:
            </span>
            <div className="font-mono text-5xl md:text-6xl font-bold text-mtn-yellow">
              {severity.toFixed(2)}×
            </div>
          </div>

          <div className="py-2">
            <div className="w-full h-2 bg-surface-container-high rounded-lg relative overflow-hidden">
              {severity <= 5.0 ? (
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-mtn-yellow rounded-lg"
                  style={{ width: `${severityPercent}%` }}
                />
              ) : (
                <div className="absolute inset-0 bg-error opacity-50" />
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant">
              <span>0.5×</span>
              <span>(Scale limits at 5.0×)</span>
              <span>5.0×</span>
            </div>
          </div>

          <div className="flex-1 min-h-[200px]">
            <BinarySearchTrajectory data={result.binarySearchTrajectory} />
          </div>

          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            The solver converged in {result.binarySearchTrajectory.length} iterations using bisection across the severity space.
            The required multiplier of {severity.toFixed(2)}x drives {input.kpiId} to {result.breachKpiValue.toFixed(2)}.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-on-surface-variant font-mono text-sm p-8 border-2 border-dashed border-outline/10 rounded">
          Select a specific scenario to see exactly how much severity it would take to breach your target.
        </div>
      )}
    </Card>
  );
}
