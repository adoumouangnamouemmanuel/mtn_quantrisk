"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppState } from '@/stores/useAppState';
import { fetchScenarioById, runScenario } from '@/lib/api';
import { MacroOverlays } from '@/lib/types';
import { Button } from '@/components/ui/Button';

// Will import components later once they are built
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { SeveritySlider } from '@/components/scenarios/SeveritySlider';
import { MacroOverlaysPanel } from '@/components/scenarios/MacroOverlays';
import { KpiImpactGrid } from '@/components/scenarios/KpiImpactGrid';
import { WaterfallChart } from '@/components/scenarios/WaterfallChart';
import { ShapAttributionCard } from '@/components/scenarios/ShapAttributionCard';
import { ScenarioMetadataCard } from '@/components/scenarios/ScenarioMetadataCard';
import { CalibrationAnchorCard } from '@/components/scenarios/CalibrationAnchorCard';
import { BoardBriefSlideOver } from '@/components/scenarios/BoardBriefSlideOver';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { Chip } from '@/components/ui/Chip';
import { RotateCw, Download, GitCompare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScenariosPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const [severity, setSeverity] = useState(1.0);
  const [overlays, setOverlays] = useState<MacroOverlays>({ cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 });
  const [isRunning, setIsRunning] = useState(false);
  
  // Hydrate active scenario on mount
  useEffect(() => {
    if (id && (!state.activeScenario || state.activeScenario.id !== id)) {
      fetchScenarioById(id).then(scen => {
        dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
        setSeverity(1.0);
      }).catch(console.error);
    }
  }, [id, state.activeScenario, dispatch]);

  const handleRun = async () => {
    if (!state.activeScenario) return;
    setIsRunning(true);
    try {
      const output = await runScenario(state.activeScenario.id, severity, overlays);
      dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: output });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (state.activeScenario && !state.scenarioOutput && !isRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeScenario, state.scenarioOutput]);

  const active = state.activeScenario;
  const output = state.scenarioOutput;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full animate-in fade-in duration-500">
      
      {/* Left Column: Picker */}
      <div className="md:col-span-3 bg-surface-container-low border-r border-outline/20 p-4 h-full overflow-y-auto hidden md:block">
        <ScenarioPicker 
          activeId={active?.id} 
          onSelect={(scen) => {
            dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
            setSeverity(1.0);
            dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
            // remove id from URL to cleanly swap
            router.push('/scenarios');
          }} 
        />
      </div>

      {/* Center Column: Controls & Simulation */}
      <div className="md:col-span-6 p-4 md:p-6 overflow-y-auto space-y-6">
        {!active ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant font-mono text-sm">
            Please select a scenario from the library.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <PillarBadge pillar={active.pillar} className="mb-2" />
                <h1 className="text-3xl font-hero font-bold text-on-surface leading-tight mb-2">
                  {active.name}
                </h1>
                <Chip size="sm">{active.type}</Chip>
              </div>
              <div className="text-right">
                {output && (
                  <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-2">
                    Last Run: {new Date(output.generatedAt).toLocaleTimeString()}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={handleRun} disabled={isRunning} className="text-mtn-yellow">
                  <RotateCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                  RERUN
                </Button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <SeveritySlider value={severity} onChange={setSeverity} />
              <MacroOverlaysPanel value={overlays} onChange={setOverlays} />
            </div>

            {/* Run Action */}
            <div className="relative">
              <Button 
                variant="primary" 
                fullWidth 
                className="py-4 text-sm font-mono tracking-widest font-bold"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? 'RUNNING...' : 'RUN SCENARIO'}
              </Button>
              {isRunning && (
                <div className="absolute bottom-0 left-0 h-1 bg-on-surface w-full overflow-hidden rounded-b">
                  <div className="h-full bg-mtn-yellow animate-progress origin-left" style={{ animation: "progress 2s infinite ease-in-out" }}></div>
                </div>
              )}
            </div>

            {/* Results Output */}
            {output && (
              <div className="space-y-6 animate-in fade-in duration-500 fade-in-up">
                <KpiImpactGrid results={output.results} severityScore={active.severity * severity} />
                <WaterfallChart 
                  title="REVENUE WATERFALL — Base → Scenario" 
                  kpiId="FIN01" 
                  result={output.results.find(r => r.kpiId === 'FIN01')!} 
                  attributions={output.shapAttributions} 
                />
                <WaterfallChart 
                  title="EBITDA WATERFALL — Base → Scenario" 
                  kpiId="FIN02" 
                  result={output.results.find(r => r.kpiId === 'FIN02')!} 
                  attributions={output.shapAttributions} 
                />
                <ShapAttributionCard attributions={output.shapAttributions} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Column: Context & Actions */}
      <div className="md:col-span-3 bg-surface-container-low border-l border-outline/20 p-4 h-full overflow-y-auto hidden md:block">
        {active ? (
          <div className="space-y-6">
            <ScenarioMetadataCard scenario={active} />
            <CalibrationAnchorCard anchor={active.calibrationAnchor} />
            
            <div className="flex flex-col space-y-3 pt-6 border-t border-outline/20">
              <Button 
                variant="secondary" 
                className="w-full text-xs font-mono uppercase tracking-widest"
                onClick={async () => {
                  const { generateBoardBrief } = await import('@/lib/api');
                  const brief = await generateBoardBrief([active.id]);
                  dispatch({ type: 'OPEN_BRIEF_SLIDEOVER', payload: { brief } });
                }}
              >
                Generate Board Brief
              </Button>
              <Button variant="ghost" className="w-full text-xs font-mono uppercase tracking-widest" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" /> Export to PDF
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-xs font-mono uppercase tracking-widest"
                onClick={() => {
                  dispatch({ type: 'SET_COMPARISON_A', payload: active });
                  router.push('/compare');
                }}
              >
                <GitCompare className="w-4 h-4 mr-2" /> Add to Compare
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant font-mono text-sm text-center">
            Context and metadata will appear here when a scenario is selected.
          </div>
        )}
      </div>
      
      {state.briefSlideover.open && state.briefSlideover.brief && (
        <BoardBriefSlideOver 
          brief={state.briefSlideover.brief} 
          onClose={() => dispatch({ type: 'CLOSE_BRIEF_SLIDEOVER' })} 
        />
      )}
    </div>
  );
}
