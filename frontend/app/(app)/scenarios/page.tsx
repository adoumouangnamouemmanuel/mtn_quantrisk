'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppState } from '@/stores/useAppState';
import { fetchScenarios, fetchScenarioById, runScenario, deleteScenario } from '@/lib/api';
import type { MacroOverlays, Scenario, ScenarioOutput } from '@/lib/types';
import { MOCK_KPIS } from '@/lib/mockData';

import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import { ScenarioFormModal } from '@/components/scenarios/ScenarioFormModal';
import { SeveritySlider } from '@/components/scenarios/SeveritySlider';
import { MacroOverlaysPanel } from '@/components/scenarios/MacroOverlays';
import { KpiImpactGrid } from '@/components/scenarios/KpiImpactGrid';
import { WaterfallChart } from '@/components/scenarios/WaterfallChart';
import { ShapAttributionCard } from '@/components/scenarios/ShapAttributionCard';
import { BoardBriefSlideOver } from '@/components/scenarios/BoardBriefSlideOver';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { Chip } from '@/components/ui/Chip';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import {
  Activity, Play, Download, GitCompare, CheckCircle, FlaskConical,
  ShieldAlert, AlertTriangle, TrendingDown, CheckCircle2, Info,
  Maximize2, Minimize2, Pencil,
} from 'lucide-react';

// ── Risk config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Critical: { label: 'Critical',  color: 'text-error',      bg: 'bg-error/10',      border: 'border-error/30',      icon: ShieldAlert  },
  Warning:  { label: 'Warning',   color: 'text-mtn-yellow', bg: 'bg-mtn-yellow/10', border: 'border-mtn-yellow/30', icon: AlertTriangle },
  Watch:    { label: 'Watch',     color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: TrendingDown  },
  Safe:     { label: 'Resilient', color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30', icon: CheckCircle2  },
} as const;

// ── Scenario Results Banner ──────────────────────────────────────────────────

function ScenarioResultsBanner({
  output, scenario, severity,
}: {
  output: ScenarioOutput;
  scenario: Scenario;
  severity: number;
}) {
  const counts = {
    Critical: output.results.filter(r => r.status === 'Critical').length,
    Warning:  output.results.filter(r => r.status === 'Warning').length,
    Watch:    output.results.filter(r => r.status === 'Watch').length,
    Safe:     output.results.filter(r => r.status === 'Safe').length,
  };

  const sorted = [...output.results].sort((a, b) => a.deltaPct - b.deltaPct);
  const worst  = sorted[0]!;
  const worstKpi = MOCK_KPIS.find(k => k.id === worst.kpiId);

  const avgDelta = output.results.reduce((s, r) => s + r.deltaPct, 0) / output.results.length;
  const effectiveSeverity = (scenario.severity * severity).toFixed(1);

  const tone = counts.Critical > 0
    ? `${counts.Critical} KPI${counts.Critical > 1 ? 's are' : ' is'} in critical territory — immediate board-level review is recommended.`
    : counts.Warning > 0
      ? `${counts.Warning} KPI${counts.Warning > 1 ? 's are' : ' is'} in warning territory — proactive mitigation should be considered.`
      : counts.Watch > 0
        ? `${counts.Watch} KPI${counts.Watch > 1 ? 's are' : ' is'} under watch — monitor with increased frequency.`
        : 'All tracked KPIs remain within safe bounds under this scenario.';

  return (
    <div className="space-y-4">
      {/* Narrative */}
      <div className="rounded-xl border border-outline/20 bg-surface-container-low p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-mtn-yellow/10 shrink-0">
            <FlaskConical className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-semibold text-on-surface mb-1">
              Stress Test Complete — {scenario.name}
            </p>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Scenario applied at{' '}
              <strong className="text-on-surface">{effectiveSeverity}× effective severity</strong>{' '}
              across <strong className="text-on-surface">{output.results.length} KPIs</strong>.
              Average portfolio delta is{' '}
              <strong className={avgDelta < -5 ? 'text-error' : avgDelta < -2 ? 'text-mtn-yellow' : 'text-green-400'}>
                {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}%
              </strong>{' '}
              from base values. {tone}
            </p>
          </div>
        </div>
      </div>

      {/* Risk chips */}
      <div className="grid grid-cols-4 gap-3">
        {(['Critical', 'Warning', 'Watch', 'Safe'] as const).map(level => {
          const cfg = STATUS_CONFIG[level];
          const Icon = cfg.icon;
          return (
            <div key={level} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3 text-center`}>
              <Icon className={`w-4 h-4 ${cfg.color} mx-auto mb-1`} />
              <p className={`font-mono text-2xl font-bold ${cfg.color}`}>{counts[level]}</p>
              <p className={`font-mono text-[8px] uppercase tracking-widest ${cfg.color} mt-0.5`}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Most impacted KPI */}
      <div className="rounded-xl border border-error/30 bg-error/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-error" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-error">Most Impacted KPI</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-sans text-base font-bold text-on-surface truncate">{worstKpi?.name ?? worst.kpiId}</p>
            <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">
              Base: {worst.baseValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {' '}→ Scenario: {worst.scenarioValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {worstKpi ? ` ${worstKpi.unit}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-2xl font-bold text-error">
              {worst.deltaPct > 0 ? '+' : ''}{worst.deltaPct.toFixed(1)}%
            </p>
            <p className="font-mono text-[8px] text-on-surface-variant uppercase">vs base</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Divider helper ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
        {label}
      </p>
      <div className="flex-1 h-px bg-outline/15" />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ScenariosPage() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const [scenarios,        setScenarios]        = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios]  = useState(true);
  const [severity,         setSeverity]          = useState(1.0);
  const [overlays,         setOverlays]          = useState<MacroOverlays>({ cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 });
  const [isRunning,        setIsRunning]         = useState(false);
  const [runSuccess,       setRunSuccess]        = useState(false);
  const [runError,         setRunError]          = useState<string | null>(null);
  const [fullView,         setFullView]          = useState(false);
  const [formModal,        setFormModal]         = useState<{ open: boolean; mode: 'create' | 'edit'; initial?: Scenario }>({ open: false, mode: 'create' });

  const refreshScenarios = useCallback(() => {
    setLoadingScenarios(true);
    fetchScenarios().then(setScenarios).finally(() => setLoadingScenarios(false));
  }, []);

  useEffect(() => {
    fetchScenarios().then(setScenarios).finally(() => setLoadingScenarios(false));
  }, []);

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
      setRunError('Simulation failed. Please check network logs.');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (state.activeScenario && !state.scenarioOutput && !isRunning) {
      const timer = setTimeout(() => { handleRun(); }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeScenario]);

  const handleDelete = async (id: string) => {
    await deleteScenario(id);
    if (state.activeScenario?.id === id) {
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: null });
      dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
    }
    refreshScenarios();
  };

  const handleSaved = (saved: Scenario) => {
    refreshScenarios();
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: saved });
    dispatch({ type: 'SET_SCENARIO_OUTPUT', payload: null });
  };

  const active = state.activeScenario;
  const output = state.scenarioOutput;

  return (
    <>
      <div className={`grid gap-5 items-start animate-in fade-in duration-500 ${
        fullView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'
      }`}>

        {/* ── Left: Scenario Library ─────────────────────────────────────── */}
        {!fullView && (
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
        )}

        {/* ── Main Workspace ─────────────────────────────────────────────── */}
        <div className={`space-y-5 pb-8 ${fullView ? 'max-w-7xl mx-auto w-full px-2' : 'md:col-span-9'}`}>

          {!active ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-32 text-center">
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
              {/* ── Scenario Banner ── */}
              <div className="relative rounded-xl border border-outline/20 bg-[#1A1A1A] p-5 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-mtn-yellow rounded-l-xl" />
                <div className="ml-3">
                  {/* Badges + timestamp */}
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

                  {/* Action toolbar */}
                  <div className="mt-4 pt-3 border-t border-outline/10 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFullView(f => !f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-mtn-yellow/40 text-mtn-yellow hover:bg-mtn-yellow/10 transition-colors"
                    >
                      {fullView
                        ? <><Minimize2 className="w-3 h-3" /> Exit Full View</>
                        : <><Maximize2 className="w-3 h-3" /> Full View</>}
                    </button>
                    <button
                      onClick={async () => {
                        const { generateBoardBrief } = await import('@/lib/api');
                        const brief = await generateBoardBrief([active.id]);
                        dispatch({ type: 'OPEN_BRIEF_SLIDEOVER', payload: { brief } });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors"
                    >
                      Board Brief
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Export PDF
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_COMPARISON_A', payload: active });
                        router.push('/compare');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors"
                    >
                      <GitCompare className="w-3 h-3" /> Compare
                    </button>
                    <button
                      onClick={() => setFormModal({ open: true, mode: 'edit', initial: active })}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit Scenario
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Parameters side-by-side ── */}
              <div className="grid md:grid-cols-2 gap-4">
                <SeveritySlider value={severity} onChange={setSeverity} />
                <MacroOverlaysPanel value={overlays} onChange={setOverlays} />
              </div>

              {/* ── Execute button ── */}
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={`w-full py-4 rounded-xl font-mono font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
                  runSuccess
                    ? 'bg-green-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                    : runError
                      ? 'bg-error text-white'
                      : 'bg-mtn-yellow text-black hover:bg-mtn-yellow/90'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Running Simulation…
                  </>
                ) : runSuccess ? (
                  <><CheckCircle className="w-4 h-4" /> CALIBRATED</>
                ) : runError ? (
                  'RUN FAILED — click to retry'
                ) : (
                  <><Play className="w-4 h-4 fill-black" /> Execute Simulation</>
                )}
              </button>

              {runError && (
                <div className="rounded-lg bg-error/10 border border-error/30 p-3 flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-error">{runError}</p>
                </div>
              )}

              {/* ── Results ── */}
              {output && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  <ScenarioResultsBanner output={output} scenario={active} severity={severity} />

                  <SectionDivider label={`KPI Impact Analysis — ${output.results.length} indicators`} />
                  <KpiImpactGrid results={output.results} severityScore={active.severity * severity} />

                  <SectionDivider label="Revenue & EBITDA Decomposition" />
                  <div className="space-y-5">
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
                  </div>

                  <SectionDivider label="Driver Attribution (XGBoost SHAP)" />
                  <ShapAttributionCard
                    attributions={output.shapAttributions}
                    unavailable={output.shapUnavailable}
                  />

                  {/* Reading guide */}
                  <div className="rounded-xl border border-outline/10 bg-surface-container-low/50 p-4 flex gap-3">
                    <Info className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                    <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface">Reading this report:</strong>{' '}
                      Red tiles indicate KPIs breaching critical thresholds; yellow tiles flag warning-level exposure; orange tiles are under watch.
                      The waterfall charts decompose which macro and operational drivers contributed most to the revenue and EBITDA shifts.
                      The SHAP panel ranks input features by marginal impact — positive bars push KPIs up, negative bars pull them down.
                      Re-run at a higher severity multiplier or with different macro overlays to explore more extreme but plausible outcomes.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── CRUD Modal ─────────────────────────────────────────────────────── */}
      <ScenarioFormModal
        open={formModal.open}
        mode={formModal.mode}
        initial={formModal.initial}
        onClose={() => setFormModal(m => ({ ...m, open: false }))}
        onSaved={handleSaved}
      />

      {/* ── Board Brief Slide-over ──────────────────────────────────────────── */}
      {state.briefSlideover.open && state.briefSlideover.brief && (
        <BoardBriefSlideOver
          brief={state.briefSlideover.brief}
          onClose={() => dispatch({ type: 'CLOSE_BRIEF_SLIDEOVER' })}
        />
      )}
    </>
  );
}
