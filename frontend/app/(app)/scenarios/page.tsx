'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppState } from '@/stores/useAppState';
import { fetchScenarios, fetchScenarioById, runScenario, deleteScenario } from '@/lib/api';
import type { MacroOverlays, Scenario } from '@/lib/types';

import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { ScenarioFormModal } from '@/components/scenarios/ScenarioFormModal';
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
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Activity, Play, Download, GitCompare, ExternalLink, CheckCircle } from 'lucide-react';

export default function ScenariosPage() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  const { state, dispatch } = useAppState();
  const router = useRouter();

  // Lifted scenarios state — ScenarioPicker is now a pure display component
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  // Simulation state
  const [severity, setSeverity] = useState(1.0);
  const [overlays, setOverlays] = useState<MacroOverlays>({ cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  // CRUD modal state
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; initial?: Scenario }>({
    open: false, mode: 'create',
  });

  // Fetch scenario library
  const refreshScenarios = useCallback(() => {
    setLoadingScenarios(true);
    fetchScenarios()
      .then(setScenarios)
      .finally(() => setLoadingScenarios(false));
  }, []);

  useEffect(() => {
    fetchScenarios()
      .then(setScenarios)
      .finally(() => setLoadingScenarios(false));
  }, []);

  // Hydrate active scenario from URL param
  useEffect(() => {
    if (urlId && (!state.activeScenario || state.activeScenario.id !== urlId)) {
      fetchScenarioById(urlId).then(scen => {
        dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
        setSeverity(1.0);
        setRunSuccess(false);
        setRunError(null);
      }).catch(console.error);
    }
  }, [urlId, state.activeScenario, dispatch]);

  const handleSelect = (scen: Scenario) => {
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scen });
    dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
    setSeverity(1.0);
    setRunSuccess(false);
    setRunError(null);
    router.push('/scenarios');
  };

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

  // Auto-run when a scenario is first selected with no output
  useEffect(() => {
    if (state.activeScenario && !state.scenarioOutput && !isRunning) {
      const timer = setTimeout(() => {
        handleRun();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeScenario]);

  const handleDelete = async (id: string) => {
    await deleteScenario(id);
    // If the deleted scenario was active, deselect it
    if (state.activeScenario?.id === id) {
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: null });
      dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
    }
    refreshScenarios();
  };

  const handleSaved = (saved: Scenario) => {
    refreshScenarios();
    // Auto-select the newly created/edited scenario
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: saved });
    dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
  };

  const active = state.activeScenario;
  const output = state.scenarioOutput;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-500 items-start">

        {/* ── Left: Scenario Library ───────────────────────────── */}
        <div className="md:col-span-3 bg-[#1A1A1A] rounded-xl border border-outline/20 p-4 sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto hidden md:flex md:flex-col custom-scrollbar">
          {loadingScenarios ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <ScenarioPicker
              scenarios={scenarios}
              activeId={active?.id}
              onSelect={handleSelect}
              onEdit={scen => setFormModal({ open: true, mode: 'edit', initial: scen })}
              onDelete={handleDelete}
              onCreateNew={() => setFormModal({ open: true, mode: 'create' })}
            />
          )}
        </div>

        {/* ── Center: Simulation Workspace ─────────────────────── */}
        <div className="md:col-span-6 space-y-5 pb-8">
          {!active ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5 border border-outline/20">
                <Activity className="w-7 h-7 text-on-surface-variant" />
              </div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-on-surface mb-2">
                No Scenario Selected
              </h3>
              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Choose a scenario from the library on the left to begin stress testing.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
                {['Macro', 'Regulatory', 'Competitive'].map(label => (
                  <div key={label} className="h-8 rounded-lg border border-dashed border-outline/20 flex items-center justify-center">
                    <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Scenario banner */}
              <div className="relative rounded-xl border border-outline/20 bg-[#1A1A1A] p-5 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-mtn-yellow rounded-l-xl" />
                <div className="ml-3">
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                    <PillarBadge pillar={active.pillar} />
                    <Chip size="sm">{active.type}</Chip>
                    {output && (
                      <span className="ml-auto font-mono text-[9px] text-on-surface-variant">
                        Last run {new Date(output.generatedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-hero font-bold text-on-surface leading-snug">
                    {active.name}
                  </h1>
                  {active.description && (
                    <p className="mt-1.5 text-sm text-on-surface-variant font-sans line-clamp-2">
                      {active.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Simulation parameters */}
              <div className="rounded-xl border border-outline/20 bg-[#1A1A1A] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow mb-4">
                  Simulation Parameters
                </p>
                <div className="space-y-4">
                  <SeveritySlider value={severity} onChange={setSeverity} />
                  <MacroOverlaysPanel value={overlays} onChange={setOverlays} />
                </div>
              </div>

              {/* Execute button */}
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={`w-full py-4 rounded-xl font-mono font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
                  runSuccess 
                    ? 'bg-green-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.4)]' 
                    : runError 
                      ? 'bg-error text-white font-bold' 
                      : 'bg-mtn-yellow text-black hover:bg-mtn-yellow/90'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Running Simulation...
                  </>
                ) : runSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    CALIBRATED
                  </>
                ) : runError ? (
                  'RUN FAILED'
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    Execute Simulation
                  </>
                )}
              </button>

              {/* Results */}
              {output && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <KpiImpactGrid results={output.results} severityScore={active.severity * severity} />
                  {output.results.find(r => r.kpiId === 'FIN01') && (
                    <WaterfallChart
                      title="REVENUE WATERFALL — Base → Scenario"
                      kpiId="FIN01"
                      result={output.results.find(r => r.kpiId === 'FIN01')!}
                      attributions={output.shapAttributions}
                    />
                  )}
                  {output.results.find(r => r.kpiId === 'FIN02') && (
                    <WaterfallChart
                      title="EBITDA WATERFALL — Base → Scenario"
                      kpiId="FIN02"
                      result={output.results.find(r => r.kpiId === 'FIN02')!}
                      attributions={output.shapAttributions}
                    />
                  )}
                  <ShapAttributionCard attributions={output.shapAttributions} />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: Context & Actions ──────────────────────────── */}
        <div className="md:col-span-3 rounded-xl border border-outline/20 bg-[#1A1A1A] p-4 sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto hidden md:block custom-scrollbar">
          {active ? (
            <div className="space-y-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Scenario Context</p>
              <ScenarioMetadataCard scenario={active} />
              <CalibrationAnchorCard anchor={active.calibrationAnchor} />

              <div className="border-t border-outline/20 pt-4 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    const { generateBoardBrief } = await import('@/lib/api');
                    const brief = await generateBoardBrief([active.id]);
                    dispatch({ type: 'OPEN_BRIEF_SLIDEOVER', payload: { brief } });
                  }}
                  className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors"
                >
                  Generate Board Brief
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_COMPARISON_A', payload: active });
                    router.push('/compare');
                  }}
                  className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors flex items-center justify-center gap-2"
                >
                  <GitCompare className="w-3.5 h-3.5" /> Add to Compare
                </button>
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full View
                </button>
                <button
                  onClick={() => setFormModal({ open: true, mode: 'edit', initial: active })}
                  className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-mtn-yellow/30 text-mtn-yellow hover:bg-mtn-yellow/10 transition-colors"
                >
                  Edit This Scenario
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-on-surface-variant font-mono text-[10px] uppercase tracking-widest text-center">
              Context appears<br />when a scenario<br />is selected
            </div>
          )}
        </div>
      </div>

      {/* ── CRUD Modal ─────────────────────────────────────────── */}
      <ScenarioFormModal
        open={formModal.open}
        mode={formModal.mode}
        initial={formModal.initial}
        onClose={() => setFormModal(m => ({ ...m, open: false }))}
        onSaved={handleSaved}
      />

      {/* ── Board Brief Slide-over ─────────────────────────────── */}
      {state.briefSlideover.open && state.briefSlideover.brief && (
        <BoardBriefSlideOver
          brief={state.briefSlideover.brief}
          onClose={() => dispatch({ type: 'CLOSE_BRIEF_SLIDEOVER' })}
        />
      )}
    </>
  );
}
