"use client";

import { useState, useEffect } from 'react';
import { useAppState } from '@/stores/useAppState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fetchKpis, runScenario } from '@/lib/api';
import { Scenario, Kpi, ScenarioOutput, BoardBrief } from '@/lib/types';
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { VsBadge } from '@/components/compare/VsBadge';
import { ScenarioVsBar } from '@/components/compare/ScenarioVsBar';
import { ComparisonTable } from '@/components/compare/ComparisonTable';
import { ComparativeBriefPanel } from '@/components/compare/ComparativeBriefPanel';
import { Printer } from 'lucide-react';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { SeverityDots } from '@/components/ui/SeverityDots';

function ScenarioDropdown({ 
  label, 
  scenario, 
  onSelect 
}: { 
  label: string, 
  scenario: Scenario | null, 
  onSelect: (s: Scenario) => void 
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <div 
        className="w-full bg-surface-container-low border border-outline/20 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:bg-surface-container transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-2">
          {label}
        </span>
        {scenario ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-2">
              <PillarBadge pillar={scenario.pillar} />
              <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
                {scenario.id}
              </span>
            </div>
            <span className="font-sans text-sm text-white font-bold mb-2">{scenario.name}</span>
            <SeverityDots severity={scenario.severity} colorClass="bg-error" />
            <Button variant="ghost" size="sm" className="mt-3 text-mtn-yellow text-[10px]">CHANGE</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-on-surface-variant">
            <span className="font-sans text-sm mb-2">Click to select scenario</span>
            <Button variant="outline" size="sm">Select</Button>
          </div>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface border border-outline/20 rounded-xl shadow-2xl h-[400px] flex flex-col">
          <ScenarioPicker 
            activeId={scenario?.id}
            onSelect={(s) => {
              onSelect(s);
              setOpen(false);
            }} 
          />
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { state, dispatch } = useAppState();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [outputA, setOutputA] = useState<ScenarioOutput | null>(null);
  const [outputB, setOutputB] = useState<ScenarioOutput | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<BoardBrief | null>(null);

  useEffect(() => {
    fetchKpis().then(setKpis);
  }, []);

  useEffect(() => {
    if (state.comparisonA) {
      runScenario(state.comparisonA.id, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 })
        .then(setOutputA)
        .catch(console.error);
    }
  }, [state.comparisonA]);

  useEffect(() => {
    if (state.comparisonB) {
      runScenario(state.comparisonB.id, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 })
        .then(setOutputB)
        .catch(console.error);
    }
  }, [state.comparisonB]);

  const handleGenerateBrief = async () => {
    if (!state.comparisonA || !state.comparisonB) return;
    const { generateBoardBrief } = await import('@/lib/api');
    const b = await generateBoardBrief([state.comparisonA.id, state.comparisonB.id]);
    setBrief(b);
    setBriefOpen(true);
  };

  const isReady = state.comparisonA && state.comparisonB && outputA && outputB && kpis.length > 0;

  return (
    <div className="flex flex-col space-y-8 pb-8 animate-in fade-in duration-500">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative z-30">
        <ScenarioDropdown 
          label="Scenario A" 
          scenario={state.comparisonA} 
          onSelect={s => dispatch({ type: 'SET_COMPARISON_A', payload: s })} 
        />
        
        <div className="shrink-0 z-10">
          <VsBadge />
        </div>

        <ScenarioDropdown 
          label="Scenario B" 
          scenario={state.comparisonB} 
          onSelect={s => dispatch({ type: 'SET_COMPARISON_B', payload: s })} 
        />
      </div>

      {/* Content */}
      {isReady ? (
        <>
          <ScenarioVsBar 
            kpis={kpis} 
            outputA={outputA} 
            outputB={outputB} 
            scenarioA={state.comparisonA!} 
            scenarioB={state.comparisonB!} 
          />
          
          <ComparisonTable 
            kpis={kpis} 
            outputA={outputA} 
            outputB={outputB} 
          />

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 print:hidden">
            <Button variant="primary" onClick={handleGenerateBrief} className="px-8 py-3 font-mono tracking-widest text-sm uppercase">
              Generate Comparative Brief
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="font-mono tracking-widest text-sm uppercase">
              <Printer className="w-4 h-4 mr-2" /> Print to PDF
            </Button>
          </div>
        </>
      ) : (
        <Card className="p-12 flex items-center justify-center text-center text-on-surface-variant font-mono">
          Select two scenarios above to view comparison.
        </Card>
      )}

      {briefOpen && brief && (
        <ComparativeBriefPanel brief={brief} onClose={() => setBriefOpen(false)} />
      )}
    </div>
  );
}
