"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppState } from '@/stores/useAppState';
import { fetchScenarioById, runScenario } from '@/lib/api';
import { MacroOverlays } from '@/lib/types';
import { Button } from '@/components/ui/Button';

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
import { Download, GitCompare, ExternalLink, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScenariosPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const [severity, setSeverity] = useState(1.0);
  const [overlays, setOverlays] = useState<MacroOverlays>({ cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  
  // Hydrate active scenario on mount
  useEffect(() => {
    if (id && (!state.activeScenario || state.activeScenario.id !== id)) {
      fetchScenarioById(id).then(scen => {
        dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
        setSeverity(1.0);
        setRunSuccess(false);
        setRunError(null);
      }).catch(console.error);
    }
  }, [id, state.activeScenario, dispatch]);

  const handleRun = async () => {
    if (!state.activeScenario) return;
    setIsRunning(true);
    setRunSuccess(false);
    setRunError(null);
    try {
      const output = await runScenario(state.activeScenario.id, severity, overlays);
      dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: output });
      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 2500);
    } catch (e) {
      console.error(e);
      setRunError("Simulation failed. Please check network logs.");
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
      <div className="md:col-span-3 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline/20 p-4 max-h-[300px] md:max-h-none overflow-y-auto">
        <ScenarioPicker 
          activeId={active?.id} 
          onSelect={(scen) => {
            dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
            setSeverity(1.0);
            dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
            setRunSuccess(false);
            setRunError(null);
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
                variant={runSuccess ? 'secondary' : 'primary'} 
                fullWidth 
                className={`py-4 text-sm font-mono tracking-widest font-bold transition-all duration-300 ${runSuccess ? 'bg-success text-black border-success hover:bg-success/90' : ''} ${runError ? 'bg-error text-white border-error' : ''}`}
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? 'RUNNING SIMULATION...' : runSuccess ? <span className="flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-2" /> CALIBRATED</span> : runError ? 'RUN FAILED' : 'RUN SCENARIO'}
              </Button>
              {isRunning && (
                <div className="absolute bottom-0 left-0 h-1 bg-on-surface w-full overflow-hidden rounded-b">
                  <div className="h-full bg-mtn-yellow animate-[progress_1s_ease-in-out_infinite] origin-left"></div>
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
                  drivers={output.waterfallDrivers?.FIN01 || []}
                />
                <WaterfallChart 
                  title="EBITDA MARGIN WATERFALL — Base → Scenario" 
                  kpiId="FIN03" 
                  result={output.results.find(r => r.kpiId === 'FIN03')!} 
                  drivers={output.waterfallDrivers?.FIN03 || []}
                />
                <ShapAttributionCard attributions={output.shapAttributions} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Column: Context & Actions */}
      <div className="md:col-span-3 bg-surface-container-low border-t md:border-t-0 md:border-l border-outline/20 p-4 max-h-[400px] md:max-h-none overflow-y-auto">
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
              <Button variant="ghost" className="w-full text-xs font-mono uppercase tracking-widest" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" /> Export to PDF
              </Button>
              <Button variant="ghost" className="w-full text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:text-white" onClick={() => window.open(window.location.href, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" /> Open Full View
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
