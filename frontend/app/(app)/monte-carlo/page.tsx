'use client';

import { useState } from 'react';
import { runMonteCarlo } from '@/lib/api';
import type { MonteCarloResult, MonteCarloKpiResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import type { Scenario } from '@/lib/types';
import {
  Dices, ChevronDown, ChevronUp, AlertTriangle,
  TrendingDown, Info, ShieldAlert, CheckCircle2,
  BarChart3, Sigma, Activity
} from 'lucide-react';

const N_OPTIONS = [200, 500, 1000, 2000];

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 1) {
  return v.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function pctChange(from: number, to: number) {
  return ((to - from) / Math.abs(from)) * 100;
}

function riskLevel(downsidePct: number): 'critical' | 'warning' | 'watch' | 'safe' {
  if (downsidePct < -10) return 'critical';
  if (downsidePct < -5)  return 'warning';
  if (downsidePct < -2)  return 'watch';
  return 'safe';
}

const RISK_CONFIG = {
  critical: { label: 'Critical',  color: 'text-error',      bg: 'bg-error/10',       border: 'border-error/40',      dot: 'bg-error' },
  warning:  { label: 'Warning',   color: 'text-mtn-yellow', bg: 'bg-mtn-yellow/10',  border: 'border-mtn-yellow/40', dot: 'bg-mtn-yellow' },
  watch:    { label: 'Watch',     color: 'text-orange-400', bg: 'bg-orange-400/10',  border: 'border-orange-400/40', dot: 'bg-orange-400' },
  safe:     { label: 'Resilient', color: 'text-green-400',  bg: 'bg-green-400/10',   border: 'border-green-400/40',  dot: 'bg-green-400' },
};

function interpretDownside(kpiName: string, downsidePct: number, p05: number, unit: string, n: number): string {
  const abs = Math.abs(downsidePct);
  const dir = downsidePct < 0 ? 'fall' : 'rise';
  return `In the worst 5% of ${n.toLocaleString()} simulated outcomes, ${kpiName} could ${dir} by ${abs.toFixed(1)}% to ${fmt(p05)} ${unit}.`;
}

// ── Distribution Bar ─────────────────────────────────────────────────────────

function DistributionBar({ result }: { result: MonteCarloKpiResult }) {
  const min = result.worstCase;
  const max = result.bestCase;
  const range = max - min || 1;
  const toX = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / range) * 100))}%`;
  const downside = pctChange(result.baseValue, result.p05);
  const rc = RISK_CONFIG[riskLevel(downside)];

  return (
    <div className="mt-3 space-y-2">
      {/* Label row */}
      <div className="flex justify-between font-mono text-[9px] text-on-surface-variant uppercase tracking-wide">
        <span>← Worst case</span>
        <span>Best case →</span>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-surface-container rounded-lg overflow-hidden">
        {/* Outer confidence band P05–P95 */}
        <div
          className="absolute top-0 bottom-0 bg-mtn-yellow/8 border-l border-r border-mtn-yellow/20"
          style={{ left: toX(result.p05), width: `${((result.p95 - result.p05) / range) * 100}%` }}
        />
        {/* IQR band P25–P75 */}
        <div
          className="absolute top-0 bottom-0 bg-mtn-yellow/25"
          style={{ left: toX(result.p25), width: `${((result.p75 - result.p25) / range) * 100}%` }}
        />
        {/* Median line P50 */}
        <div className="absolute top-0.5 bottom-0.5 w-[2px] bg-mtn-yellow rounded-full shadow-[0_0_6px_#FFD100]"
          style={{ left: toX(result.p50) }} />
        {/* Base value dashed line */}
        <div className="absolute top-0 bottom-0 w-px bg-on-surface-variant/50 border-l border-dashed border-on-surface-variant/50"
          style={{ left: toX(result.baseValue) }} />
      </div>

      {/* Value labels */}
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="font-mono text-[8px] text-on-surface-variant uppercase">Worst</p>
          <p className={`font-mono text-[10px] font-bold ${rc.color}`}>{fmt(result.worstCase)}</p>
        </div>
        <div>
          <p className="font-mono text-[8px] text-mtn-yellow uppercase">Median (P50)</p>
          <p className="font-mono text-[10px] font-bold text-mtn-yellow">{fmt(result.p50)}</p>
        </div>
        <div>
          <p className="font-mono text-[8px] text-on-surface-variant uppercase">Best</p>
          <p className="font-mono text-[10px] font-bold text-green-400">{fmt(result.bestCase)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 bg-mtn-yellow/25 rounded-sm border border-mtn-yellow/40" />
          <span className="font-mono text-[8px] text-on-surface-variant">IQR (P25–P75)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 bg-mtn-yellow/10 rounded-sm border border-mtn-yellow/20" />
          <span className="font-mono text-[8px] text-on-surface-variant">90% band (P05–P95)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[2px] h-3 bg-mtn-yellow rounded-full" />
          <span className="font-mono text-[8px] text-on-surface-variant">Median</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-3 bg-on-surface-variant/50" style={{ borderLeft: '1px dashed' }} />
          <span className="font-mono text-[8px] text-on-surface-variant">Base</span>
        </div>
      </div>
    </div>
  );
}

// ── Percentile Table ─────────────────────────────────────────────────────────

function PercentileTable({ result }: { result: MonteCarloKpiResult }) {
  const rows: { p: string; v: number; label: string; hint: string }[] = [
    { p: 'P05', v: result.p05, label: 'Severe Downside',  hint: '5% of simulations fall below this' },
    { p: 'P25', v: result.p25, label: 'Adverse',          hint: '25% of simulations fall below this' },
    { p: 'P50', v: result.p50, label: 'Median',           hint: 'Most likely central outcome' },
    { p: 'P75', v: result.p75, label: 'Favourable',       hint: '75% of simulations fall below this' },
    { p: 'P95', v: result.p95, label: 'Best Case',        hint: '95% of simulations fall below this' },
  ];

  return (
    <div className="mt-4 rounded-lg border border-outline/15 overflow-hidden">
      <div className="grid grid-cols-4 bg-surface-container px-3 py-1.5">
        <span className="font-mono text-[8px] uppercase text-on-surface-variant tracking-widest">Percentile</span>
        <span className="font-mono text-[8px] uppercase text-on-surface-variant tracking-widest">Label</span>
        <span className="font-mono text-[8px] uppercase text-on-surface-variant tracking-widest text-right">Value ({result.unit})</span>
        <span className="font-mono text-[8px] uppercase text-on-surface-variant tracking-widest text-right">vs Base</span>
      </div>
      {rows.map(({ p, v, label, hint }) => {
        const delta = pctChange(result.baseValue, v);
        const isNeg = delta < 0;
        return (
          <div key={p} className="grid grid-cols-4 px-3 py-2 border-t border-outline/10 hover:bg-surface-container/40 transition-colors group" title={hint}>
            <span className="font-mono text-[10px] font-bold text-mtn-yellow">{p}</span>
            <span className="font-sans text-[10px] text-on-surface-variant">{label}</span>
            <span className="font-mono text-[10px] text-on-surface text-right">{fmt(v)}</span>
            <span className={`font-mono text-[10px] font-bold text-right ${isNeg ? 'text-error' : 'text-green-400'}`}>
              {isNeg ? '' : '+'}{delta.toFixed(1)}%
            </span>
          </div>
        );
      })}
      <div className="grid grid-cols-4 px-3 py-2 border-t border-outline/10 bg-surface-container/20">
        <span className="font-mono text-[9px] text-on-surface-variant col-span-2">Base Value</span>
        <span className="font-mono text-[10px] text-on-surface-variant text-right">{fmt(result.baseValue)}</span>
        <span className="font-mono text-[10px] text-on-surface-variant text-right">—</span>
      </div>
      <div className="grid grid-cols-4 px-3 py-2 border-t border-outline/10 bg-surface-container/20">
        <span className="font-mono text-[9px] text-on-surface-variant col-span-2">Std Deviation</span>
        <span className="font-mono text-[10px] text-on-surface-variant text-right">{fmt(result.std)}</span>
        <span className="font-mono text-[10px] text-on-surface-variant text-right">
          ±{((result.std / result.baseValue) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ── KPI Row ──────────────────────────────────────────────────────────────────

function KpiRow({ r, nSims }: { r: MonteCarloKpiResult; nSims: number }) {
  const [open, setOpen] = useState(false);
  const downside = pctChange(r.baseValue, r.p05);
  const upside   = pctChange(r.baseValue, r.p95);
  const level    = riskLevel(downside);
  const rc       = RISK_CONFIG[level];

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? `${rc.border} bg-surface-container/20` : 'border-outline/15 hover:border-outline/30'}`}>
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
      >
        {/* Risk dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${rc.dot}`} />

        {/* KPI ID badge */}
        <span className="font-mono text-[9px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant w-14 text-center shrink-0">
          {r.kpiId}
        </span>

        {/* Name */}
        <span className="font-sans text-sm text-on-surface font-medium flex-1 text-left">{r.kpiName}</span>

        {/* Unit */}
        <span className="font-mono text-[9px] text-on-surface-variant shrink-0">{r.unit}</span>

        {/* P05 downside chip */}
        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${rc.color} ${rc.bg} shrink-0`}>
          {downside < 0 ? '' : '+'}{downside.toFixed(1)}% P05
        </span>

        {/* Upside chip */}
        <span className="font-mono text-[10px] text-green-400 font-bold shrink-0 hidden md:block">
          +{upside.toFixed(1)}% P95
        </span>

        {/* Risk label */}
        <span className={`font-mono text-[8px] uppercase tracking-widest ${rc.color} shrink-0 hidden lg:block`}>
          {rc.label}
        </span>

        {open
          ? <ChevronUp   className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
        }
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Interpretation narrative */}
          <div className={`rounded-lg p-3 ${rc.bg} border ${rc.border} flex gap-2`}>
            {level === 'critical' || level === 'warning'
              ? <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${rc.color}`} />
              : <Info className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${rc.color}`} />
            }
            <p className={`font-sans text-xs leading-relaxed ${rc.color}`}>
              {interpretDownside(r.kpiName, downside, r.p05, r.unit, nSims)}
              {' '}The median outcome sits at <strong>{fmt(r.p50)} {r.unit}</strong>, while the most favourable 5% of
              simulations see it reach <strong>{fmt(r.p95)} {r.unit}</strong>{' '}
              ({upside > 0 ? `+${upside.toFixed(1)}%` : `${upside.toFixed(1)}%`} above base).
            </p>
          </div>

          {/* Distribution bar */}
          <DistributionBar result={r} />

          {/* Percentile table */}
          <PercentileTable result={r} />
        </div>
      )}
    </div>
  );
}

// ── Summary Cards ─────────────────────────────────────────────────────────────

function RiskSummaryBanner({ result, scenario }: { result: MonteCarloResult; scenario: Scenario }) {
  const downsides = result.results.map(r => pctChange(r.baseValue, r.p05));
  const critical  = downsides.filter(d => riskLevel(d) === 'critical').length;
  const warning   = downsides.filter(d => riskLevel(d) === 'warning').length;
  const watch     = downsides.filter(d => riskLevel(d) === 'watch').length;
  const safe      = downsides.filter(d => riskLevel(d) === 'safe').length;

  const sorted = [...result.results].sort((a, b) => pctChange(b.baseValue, b.p05) - pctChange(a.baseValue, a.p05));
  const worst  = sorted[0]!;
  const worstDelta = pctChange(worst.baseValue, worst.p05);

  const avgDownside = downsides.reduce((a, b) => a + b, 0) / downsides.length;

  return (
    <div className="space-y-4">
      {/* Narrative headline */}
      <div className="rounded-xl border border-outline/20 bg-surface-container-low p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-mtn-yellow/10">
            <Activity className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-semibold text-on-surface mb-1">
              Simulation Complete — {result.nSimulations.toLocaleString()} Scenarios Modelled
            </p>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Under the <strong className="text-on-surface">{scenario.name}</strong> stress scenario with ±{(result.uncertaintyPct * 100).toFixed(0)}% uncertainty,
              the engine ran {result.nSimulations.toLocaleString()} independent simulations by randomly perturbing each KPI impact within its uncertainty band.
              Across all {result.results.length} tracked KPIs, the average downside at the 5th percentile is{' '}
              <strong className={avgDownside < -5 ? 'text-error' : avgDownside < -2 ? 'text-mtn-yellow' : 'text-green-400'}>
                {avgDownside.toFixed(1)}%
              </strong>{' '}
              below base. {critical > 0
                ? `${critical} KPI${critical > 1 ? 's face' : ' faces'} critical exposure — immediate attention is recommended.`
                : warning > 0
                  ? `${warning} KPI${warning > 1 ? 's are' : ' is'} in warning territory — monitor closely.`
                  : 'All KPIs demonstrate resilience under this scenario.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Risk breakdown chips */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Critical', count: critical, icon: ShieldAlert,   color: 'text-error',      bg: 'bg-error/10',      border: 'border-error/30' },
          { label: 'Warning',  count: warning,  icon: AlertTriangle, color: 'text-mtn-yellow', bg: 'bg-mtn-yellow/10', border: 'border-mtn-yellow/30' },
          { label: 'Watch',    count: watch,    icon: TrendingDown,  color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
          { label: 'Resilient',count: safe,     icon: CheckCircle2,  color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
        ].map(({ label, count, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-xl border ${border} ${bg} p-3 text-center`}>
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <p className={`font-mono text-2xl font-bold ${color}`}>{count}</p>
            <p className={`font-mono text-[8px] uppercase tracking-widest ${color} mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Most exposed KPI */}
      <div className="rounded-xl border border-error/30 bg-error/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-error" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-error">Most Exposed KPI at P05</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-base font-bold text-on-surface">{worst.kpiName}</p>
            <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">
              Base: {fmt(worst.baseValue)} {worst.unit} → P05: {fmt(worst.p05)} {worst.unit}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-error">{worstDelta.toFixed(1)}%</p>
            <p className="font-mono text-[8px] text-on-surface-variant uppercase">P05 deviation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MonteCarloPage() {
  const [scenario,    setScenario]    = useState<Scenario | null>(null);
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [n,           setN]           = useState(1000);
  const [uncertainty, setUncertainty] = useState(20);
  const [severity,    setSeverity]    = useState(1.0);
  const [result,      setResult]      = useState<MonteCarloResult | null>(null);
  const [running,     setRunning]     = useState(false);
  const [error,       setError]       = useState('');
  const [sortBy,      setSortBy]      = useState<'risk' | 'name'>('risk');

  const handleRun = async () => {
    if (!scenario) return;
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await runMonteCarlo(scenario.id, n, severity, uncertainty / 100);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Simulation failed. Check the backend is running.');
    } finally {
      setRunning(false);
    }
  };

  const sortedResults = result
    ? [...result.results].sort((a, b) =>
        sortBy === 'risk'
          ? pctChange(a.baseValue, a.p05) - pctChange(b.baseValue, b.p05)
          : a.kpiName.localeCompare(b.kpiName)
      )
    : [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-mtn-yellow/10">
              <Dices className="w-5 h-5 text-mtn-yellow" />
            </div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Monte Carlo Simulation</h1>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl">
            Rather than a single deterministic stress test, Monte Carlo runs thousands of randomised
            simulations — each slightly different — to build a probability distribution of outcomes.
            This tells you not just <em>what might happen</em>, but <em>how likely each outcome is</em>.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-on-surface-variant shrink-0">
          <BarChart3 className="w-5 h-5" />
          <Sigma className="w-5 h-5" />
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">

        {/* ── Config Panel ── */}
        <div className="md:col-span-4 space-y-4">
          <Card className="space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-outline/10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Simulation Parameters</span>
            </div>

            {/* Scenario selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Stress Scenario</p>
              </div>
              <p className="font-sans text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                Choose the macro or operational stress event to simulate. The engine will perturb its KPI impacts randomly across all runs.
              </p>
              <button
                onClick={() => setPickerOpen(o => !o)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  scenario ? 'border-mtn-yellow/40 bg-mtn-yellow/5' : 'border-outline/20 hover:border-mtn-yellow/40'
                }`}
              >
                {scenario ? (
                  <div>
                    <span className="font-mono text-[9px] text-mtn-yellow uppercase tracking-widest">{scenario.id}</span>
                    <p className="font-sans text-sm text-on-surface font-medium mt-0.5">{scenario.name}</p>
                  </div>
                ) : (
                  <span className="font-sans text-sm text-on-surface-variant">Select a scenario…</span>
                )}
              </button>
              {pickerOpen && (
                <div className="mt-2 border border-outline/20 rounded-xl h-72 flex flex-col overflow-hidden">
                  <ScenarioPicker
                    activeId={scenario?.id}
                    onSelect={s => { setScenario(s); setPickerOpen(false); setResult(null); }}
                  />
                </div>
              )}
            </div>

            {/* N simulations */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Number of Simulations</p>
              <p className="font-sans text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                More simulations give smoother, more accurate percentile estimates — but take longer to compute.
              </p>
              <div className="flex gap-2">
                {N_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setN(opt)}
                    className={`flex-1 py-2 rounded-lg font-mono text-[10px] border transition-all ${
                      n === opt
                        ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10 font-bold'
                        : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
                    }`}
                  >
                    {opt >= 1000 ? `${opt / 1000}k` : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Uncertainty */}
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Uncertainty Band</p>
                <p className="font-mono text-[11px] font-bold text-mtn-yellow">±{uncertainty}%</p>
              </div>
              <p className="font-sans text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                How much each impact value is allowed to deviate. A wider band reflects greater real-world uncertainty.
              </p>
              <input
                type="range" min={5} max={40} step={5} value={uncertainty}
                onChange={e => setUncertainty(Number(e.target.value))}
                className="w-full accent-[#FFD100]"
              />
              <div className="flex justify-between font-mono text-[8px] text-on-surface-variant mt-0.5">
                <span>Tight ±5%</span><span>Wide ±40%</span>
              </div>
            </div>

            {/* Severity */}
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Severity Multiplier</p>
                <p className="font-mono text-[11px] font-bold text-mtn-yellow">{severity.toFixed(1)}×</p>
              </div>
              <p className="font-sans text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                Scales the magnitude of all scenario impacts. 1.0× = base severity; 2.0× = twice as severe.
              </p>
              <input
                type="range" min={0.5} max={3.0} step={0.1} value={severity}
                onChange={e => setSeverity(Number(e.target.value))}
                className="w-full accent-[#FFD100]"
              />
              <div className="flex justify-between font-mono text-[8px] text-on-surface-variant mt-0.5">
                <span>Mild 0.5×</span><span>Extreme 3.0×</span>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={!scenario || running}
              className="w-full py-3.5 rounded-xl font-mono font-bold text-sm uppercase tracking-widest bg-mtn-yellow text-black flex items-center justify-center gap-2.5 hover:bg-mtn-yellow/90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {running ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Simulating {n.toLocaleString()} runs…
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </button>

            {error && (
              <div className="rounded-lg bg-error/10 border border-error/30 p-3 flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                <p className="font-mono text-[9px] text-error">{error}</p>
              </div>
            )}
          </Card>

          {/* Methodology note */}
          <div className="rounded-xl border border-outline/15 bg-surface-container-low p-4 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">How it works</p>
            <ol className="space-y-1.5">
              {[
                'Load base-case KPI values from the data pipeline',
                'For each simulation, add Gaussian noise (±uncertainty%) to every impact value',
                'Apply the perturbed impacts to compute stressed KPI outcomes',
                'Repeat N times and compute P05 / P50 / P95 percentile distributions',
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-[8px] text-mtn-yellow mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="font-sans text-[10px] text-on-surface-variant leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Results Panel ── */}
        <div className="md:col-span-8 space-y-5">

          {/* Loading skeleton */}
          {running && (
            <div className="space-y-3">
              <div className="rounded-xl border border-outline/20 bg-surface-container-low p-5 flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-mtn-yellow/30 border-t-mtn-yellow rounded-full animate-spin shrink-0" />
                <div>
                  <p className="font-sans text-sm font-medium text-on-surface">Running {n.toLocaleString()} simulations…</p>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Perturbing impact values with Gaussian noise and computing KPI distributions. This may take a moment.
                  </p>
                </div>
              </div>
              {[1,2,3,4,5].map(i => <SkeletonBlock key={i} className="h-14 rounded-xl" />)}
            </div>
          )}

          {/* Empty state */}
          {!running && !result && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-outline/20 rounded-xl space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container">
                <Dices className="w-10 h-10 text-on-surface-variant" />
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-on-surface mb-1">No simulation yet</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant max-w-xs">
                  Select a scenario on the left, configure your parameters, then hit Run Simulation
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !running && scenario && (
            <>
              {/* Risk summary banner */}
              <RiskSummaryBanner result={result} scenario={scenario} />

              {/* KPI list header */}
              <div className="flex items-center justify-between pt-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
                  {result.results.length} KPIs — click to expand full distribution
                </p>
                <div className="flex gap-1">
                  {(['risk', 'name'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 rounded border transition-colors ${
                        sortBy === s
                          ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
                          : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
                      }`}
                    >
                      Sort by {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI rows */}
              <div className="space-y-2">
                {sortedResults.map(r => (
                  <KpiRow key={r.kpiId} r={r} nSims={result.nSimulations} />
                ))}
              </div>

              {/* Footer note */}
              <div className="rounded-xl border border-outline/10 bg-surface-container-low/50 p-4 flex gap-3">
                <Info className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Reading this report:</strong> P05 is your key risk metric — only 5% of simulated outcomes
                  fall below it, making it the statistical equivalent of a "stress floor." The IQR band (P25–P75) shows where half of all
                  outcomes are expected to land. Std deviation measures how much outcomes vary; a higher value signals greater uncertainty in that KPI.
                  Results are sensitive to the uncertainty band and severity multiplier — re-run with different settings to stress-test your assumptions.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
