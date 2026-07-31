"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppState } from '@/stores/useAppState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fetchKpis, runScenario } from '@/lib/api';
import { Scenario, Kpi, ScenarioOutput, BoardBrief } from '@/lib/types';
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { ScenarioVsBar } from '@/components/compare/ScenarioVsBar';
import { ComparisonTable } from '@/components/compare/ComparisonTable';
import { ComparativeBriefPanel } from '@/components/compare/ComparativeBriefPanel';
import { Printer, GitCompare, Plus, X, AlertTriangle } from 'lucide-react';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { SeverityDots } from '@/components/ui/SeverityDots';
import { formatNumber } from '@/lib/format';

const ANCHOR_KPIS = ['FIN01', 'FIN02', 'FIN03', 'FIN04', 'FIN05', 'SEG03', 'OPS04'];
const SCENARIO_COLORS = ['text-blue-400', 'text-error', 'text-mtn-yellow', 'text-purple-400'];

function MultiScenarioMatrix({ kpis, comparisons }: {
  kpis: Kpi[];
  comparisons: { label: string; scenario: Scenario; output: ScenarioOutput }[];
}) {
  const rows = useMemo(() => ANCHOR_KPIS.flatMap(kpiId => {
    const kpi = kpis.find(item => item.id === kpiId);
    if (!kpi) return [];
    const impacts = comparisons.map(item => item.output.results.find(result => result.kpiId === kpiId));
    const deltas = impacts.map(impact => impact?.deltaPct ?? 0);
    const worst = deltas.indexOf(Math.min(...deltas));
    return [{ kpi, impacts, worst }];
  }), [kpis, comparisons]);

  return (
    <Card className="bg-surface-container-low overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline/15 px-5 py-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-white">Multi-scenario impact matrix</h3>
          <p className="mt-0.5 text-xs text-on-surface-variant">Scenario value and deviation from the Q1 2026 base case</p>
        </div>
        <span className="rounded-full border border-mtn-yellow/20 bg-mtn-yellow/5 px-2.5 py-1 font-mono text-[9px] text-mtn-yellow">{comparisons.length} SCENARIOS</span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead><tr className="border-b border-outline/15 bg-surface-container">
            <th className="sticky left-0 z-10 bg-surface-container p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">KPI / Base</th>
            {comparisons.map((item, index) => <th key={`${item.label}-${item.scenario.id}`} className="p-4 text-right"><p className={`font-mono text-[10px] font-bold ${SCENARIO_COLORS[index]}`}>{item.label} · {item.scenario.id}</p><p className="mt-1 max-w-44 truncate text-[9px] font-normal text-on-surface-variant" title={item.scenario.name}>{item.scenario.name}</p></th>)}
          </tr></thead>
          <tbody>{rows.map(({ kpi, impacts, worst }) => <tr key={kpi.id} className="group border-b border-outline/10 hover:bg-white/[0.025]">
            <td className="sticky left-0 z-10 bg-surface-container-low p-4 group-hover:bg-[#171722]"><p className="font-mono text-xs font-bold text-white">{kpi.id}</p><p className="mt-1 text-[9px] text-on-surface-variant">Base {formatNumber(kpi.fy25Value)} {kpi.unit}</p></td>
            {impacts.map((impact, index) => {
              const delta = impact?.deltaPct ?? 0;
              return <td key={`${kpi.id}-${comparisons[index]?.label}`} className={`p-4 text-right ${index === worst ? 'bg-error/[0.035]' : ''}`}><p className="font-data text-xs text-white">{formatNumber(impact?.scenarioValue ?? kpi.fy25Value)}</p><p className={`mt-1 font-mono text-[10px] font-bold ${delta < 0 ? 'text-error' : delta > 0 ? 'text-green-400' : 'text-on-surface-variant'}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%{index === worst ? ' · WORST' : ''}</p></td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

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
  const [scenarioC, setScenarioC] = useState<Scenario | null>(null);
  const [scenarioD, setScenarioD] = useState<Scenario | null>(null);
  const [outputC, setOutputC] = useState<ScenarioOutput | null>(null);
  const [outputD, setOutputD] = useState<ScenarioOutput | null>(null);
  const [visibleSlots, setVisibleSlots] = useState(2);
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

  useEffect(() => {
    if (!scenarioC) return;
    let active = true;
    runScenario(scenarioC.id, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 })
      .then(result => { if (active) setOutputC(result); })
      .catch(console.error);
    return () => { active = false; };
  }, [scenarioC]);

  useEffect(() => {
    if (!scenarioD) return;
    let active = true;
    runScenario(scenarioD.id, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 })
      .then(result => { if (active) setOutputD(result); })
      .catch(console.error);
    return () => { active = false; };
  }, [scenarioD]);

  const comparisons = useMemo(() => {
    const items: { label: string; scenario: Scenario; output: ScenarioOutput }[] = [];
    if (state.comparisonA && outputA) items.push({ label: 'A', scenario: state.comparisonA, output: outputA });
    if (state.comparisonB && outputB) items.push({ label: 'B', scenario: state.comparisonB, output: outputB });
    if (scenarioC && outputC) items.push({ label: 'C', scenario: scenarioC, output: outputC });
    if (scenarioD && outputD) items.push({ label: 'D', scenario: scenarioD, output: outputD });
    return items;
  }, [state.comparisonA, state.comparisonB, scenarioC, scenarioD, outputA, outputB, outputC, outputD]);

  const handleGenerateBrief = async () => {
    if (comparisons.length < 2) return;
    const { generateBoardBrief } = await import('@/lib/api');
    const b = await generateBoardBrief(comparisons.map(item => item.scenario.id));
    setBrief(b);
    setBriefOpen(true);
  };

  const isReady = state.comparisonA && state.comparisonB && outputA && outputB && kpis.length > 0;

  return (
    <div className="flex flex-col space-y-8 pb-8 animate-in fade-in duration-500">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center shrink-0">
          <GitCompare className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Scenario Compare</h1>
          <p className="text-on-surface-variant mt-0.5">Compare KPI impact across two to four stress scenarios</p>
        </div>
      </div>

      {/* Top Section */}
      <div className={`grid grid-cols-1 gap-4 relative z-30 ${visibleSlots >= 3 ? 'xl:grid-cols-4 md:grid-cols-2' : 'md:grid-cols-2'}`}>
        <ScenarioDropdown 
          label="Scenario A" 
          scenario={state.comparisonA} 
          onSelect={s => dispatch({ type: 'SET_COMPARISON_A', payload: s })} 
        />
        <ScenarioDropdown 
          label="Scenario B" 
          scenario={state.comparisonB} 
          onSelect={s => dispatch({ type: 'SET_COMPARISON_B', payload: s })} 
        />
        {visibleSlots >= 3 && (
          <div className="relative">
            <ScenarioDropdown label="Scenario C" scenario={scenarioC} onSelect={setScenarioC} />
            <button onClick={() => { setVisibleSlots(2); setScenarioC(null); setScenarioD(null); }} aria-label="Remove scenario C" className="absolute right-2 top-2 z-20 rounded-full border border-white/10 bg-black/50 p-1 text-on-surface-variant hover:text-white"><X className="h-3 w-3" /></button>
          </div>
        )}
        {visibleSlots >= 4 && (
          <div className="relative">
            <ScenarioDropdown label="Scenario D" scenario={scenarioD} onSelect={setScenarioD} />
            <button onClick={() => { setVisibleSlots(3); setScenarioD(null); }} aria-label="Remove scenario D" className="absolute right-2 top-2 z-20 rounded-full border border-white/10 bg-black/50 p-1 text-on-surface-variant hover:text-white"><X className="h-3 w-3" /></button>
          </div>
        )}
      </div>

      {visibleSlots < 4 && (
        <button onClick={() => setVisibleSlots(count => Math.min(4, count + 1))} className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-mtn-yellow/25 px-4 py-2 text-xs font-mono text-mtn-yellow transition hover:border-mtn-yellow/50 hover:bg-mtn-yellow/5"><Plus className="h-3.5 w-3.5" /> Add scenario {visibleSlots === 2 ? 'C' : 'D'}</button>
      )}

      {/* Content */}
      {isReady ? (
        <>
          {comparisons.length > 2 && <MultiScenarioMatrix kpis={kpis} comparisons={comparisons} />}
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

          {visibleSlots > comparisons.length && (
            <div className="flex items-center gap-2 rounded-xl border border-mtn-yellow/15 bg-mtn-yellow/[0.035] p-4 text-xs text-on-surface-variant">
              <AlertTriangle className="h-4 w-4 shrink-0 text-mtn-yellow" />
              Select the additional scenario above to include it in the comparison matrix and comparative brief.
            </div>
          )}

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
          Select at least two scenarios above to view comparison.
        </Card>
      )}

      {briefOpen && brief && (
        <ComparativeBriefPanel brief={brief} onClose={() => setBriefOpen(false)} />
      )}
    </div>
  );
}
