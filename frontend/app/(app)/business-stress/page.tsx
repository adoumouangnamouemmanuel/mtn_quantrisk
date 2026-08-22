'use client';

import { useMemo, useRef, useState } from 'react';
import { runStressTest } from '@/lib/api';
import type { StressTestResult } from '@/lib/api';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, BriefcaseBusiness,
  Check, ChevronRight, CircleDollarSign, Download, FileSpreadsheet,
  Gauge, Info, Play, RotateCcw, ShieldCheck, Sparkles, Target,
  TrendingDown, UploadCloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Shocks = { revenue: number; fx: number; opex: number; churn: number };

const YEARS = ['FY2026', 'FY2027', 'FY2028'] as const;

const PRESETS: { name: string; key: string; description: string; shocks: Shocks; tone: string }[] = [
  { name: 'Cedi pressure', key: 'cedi_pressure', description: 'FX-led cost escalation', shocks: { revenue: -4, fx: 22, opex: 9, churn: 2 }, tone: '#FFD000' },
  { name: 'Price war', key: 'price_war', description: 'ARPU and retention shock', shocks: { revenue: -12, fx: 5, opex: 4, churn: 11 }, tone: '#FF8A80' },
  { name: 'Network outage', key: 'network_outage', description: 'Operational disruption', shocks: { revenue: -8, fx: 3, opex: 14, churn: 7 }, tone: '#82B1FF' },
  { name: 'Custom case', key: 'custom', description: 'Build your own scenario', shocks: { revenue: -6, fx: 10, opex: 7, churn: 4 }, tone: '#80DEEA' },
];

function ShockSlider({ label, detail, value, min, max, suffix, onChange }: {
  label: string; detail: string; value: number; min: number; max: number; suffix: string;
  onChange: (value: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface">{label}</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{detail}</p>
        </div>
        <span className={`font-mono text-sm font-bold ${value > 0 ? 'text-error' : 'text-mtn-yellow'}`}>
          {value > 0 ? '+' : ''}{value}{suffix}
        </span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-[#FFD000]"
        style={{ background: `linear-gradient(90deg,#FFD000 ${pct}%,rgba(255,255,255,.1) ${pct}%)` }}
      />
    </div>
  );
}

function ProjectionChart({ base, stressed, p05, p95 }: {
  base: number[]; stressed: number[]; p05?: number[]; p95?: number[];
}) {
  const allVals = [...base, ...stressed, ...(p05 ?? []), ...(p95 ?? [])];
  const min = Math.min(...allVals) * 0.90;
  const max = Math.max(...allVals) * 1.06;
  const x = (i: number) => 42 + i * 174;
  const y = (v: number) => 164 - ((v - min) / Math.max(max - min, 1)) * 120;
  const points = (values: number[]) => values.map((value, index) => `${x(index)},${y(value)}`).join(' ');

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/20 p-3">
      <svg viewBox="0 0 430 200" className="w-full h-48" role="img" aria-label="Base and stressed EBITDA projection">
        {[44, 84, 124, 164].map(line => <line key={line} x1="42" x2="400" y1={line} y2={line} stroke="rgba(255,255,255,.06)" />)}
        <defs>
          <linearGradient id="stressArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A80" stopOpacity=".22" />
            <stop offset="100%" stopColor="#FF8A80" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Confidence band P05-P95 */}
        {p05 && p95 && (
          <polygon
            points={`${x(0)},${y(p95[0]!)} ${points(p95)} ${x(2)},${y(p95[2]!)} ${x(2)},${y(p05[2]!)} ${[...p05].reverse().map((v, i) => `${x(2 - i)},${y(v)}`).join(' ')} ${x(0)},${y(p05[0]!)}`}
            fill="rgba(255,138,128,0.08)"
          />
        )}
        <polygon points={`${x(0)},164 ${points(stressed)} ${x(2)},164`} fill="url(#stressArea)" />
        <polyline points={points(base)} fill="none" stroke="rgba(240,237,232,.35)" strokeWidth="2" strokeDasharray="5 5" />
        <polyline points={points(stressed)} fill="none" stroke="#FFD000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {stressed.map((value, index) => (
          <g key={YEARS[index]!}>
            <circle cx={x(index)} cy={y(value)} r="5" fill="#07070D" stroke="#FFD000" strokeWidth="3" />
            <text x={x(index)} y="190" textAnchor="middle" fill="#A09BB0" fontSize="10">{YEARS[index]!}</text>
          </g>
        ))}
      </svg>
      <div className="absolute top-3 right-3 flex gap-3 text-[9px] font-mono text-on-surface-variant">
        <span className="flex items-center gap-1"><i className="w-4 border-t border-dashed border-white/40" /> Base</span>
        <span className="flex items-center gap-1 text-mtn-yellow"><i className="w-4 border-t-2 border-mtn-yellow" /> Stressed</span>
        {p05 && <span className="flex items-center gap-1 text-orange-400"><i className="w-4 border-t border-orange-400/40" /> P05–P95</span>}
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, icon: Icon, danger = false }: {
  label: string; value: string; delta: string; icon: typeof Activity; danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{label}</span>
        <Icon className={`h-4 w-4 ${danger ? 'text-error' : 'text-mtn-yellow'}`} />
      </div>
      <p className="mt-3 text-2xl font-data font-bold text-on-surface">{value}</p>
      <p className={`mt-1 text-[10px] font-mono ${danger ? 'text-error' : 'text-green-400'}`}>{delta}</p>
    </div>
  );
}

function TornadoChart({ tornado }: { tornado: StressTestResult['tornado'] }) {
  if (!tornado || tornado.length === 0) return null;
  const maxSpread = tornado[0]!.spread;
  return (
    <div className="rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-mtn-yellow" />
        <p className="text-sm font-bold text-on-surface">Sensitivity Tornado</p>
      </div>
      <div className="space-y-3">
        {tornado.map(t => {
          const pct = maxSpread > 0 ? (t.spread / maxSpread) * 100 : 0;
          return (
            <div key={t.param} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-on-surface-variant w-28 text-right shrink-0">{t.label}</span>
              <div className="flex-1 h-5 rounded bg-surface-container overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 left-0 rounded bg-mtn-yellow/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-on-surface font-bold w-24 text-right shrink-0">
                GHS {t.spread.toLocaleString()}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BusinessStressPage() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [shocks, setShocks] = useState<Shocks>(PRESETS[0]!.shocks);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_PLAN = {
    revenue: [18240, 20790, 23540],
    ebitda: [10030, 11640, 13380],
    capex: [3560, 3920, 4260],
    subscribers: [30.8, 32.4, 34.1],
  };
  const [plan, setPlan] = useState(DEFAULT_PLAN);

  function choosePreset(index: number) {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    if (!preset) return;
    setShocks(preset.shocks);
    setResult(null);
  }

  function updatePlan(rowIndex: number, yearIndex: number, value: number) {
    const keys = ['revenue', 'ebitda', 'capex', 'subscribers'] as const;
    const key = keys[rowIndex];
    if (!key) return;
    setPlan(current => {
      const updated = { ...current };
      const arr = [...updated[key]];
      arr[yearIndex] = value;
      updated[key] = arr;
      return updated;
    });
    setResult(null);
  }

  async function runSimulation() {
    setRunning(true);
    setError(null);
    try {
      const res = await runStressTest({
        plan,
        shocks,
        nSimulations: 10000,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed. Check the backend is running.');
    } finally {
      setRunning(false);
    }
  }

  const det = result?.deterministic;
  const mc = result?.monteCarlo;

  const workflowSteps: { number: string; title: string; state: string; icon: LucideIcon }[] = [
    { number: '01', title: 'Business plan', state: 'Demo plan loaded', icon: FileSpreadsheet },
    { number: '02', title: 'Stress design', state: PRESETS[selectedPreset]?.name ?? 'Custom case', icon: Gauge },
    { number: '03', title: 'Decision output', state: result ? 'Results generated' : 'Ready to simulate', icon: Target },
  ];

  return (
    <div className="relative mx-auto max-w-[1500px] space-y-6 pb-12">
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-mtn-yellow/[0.035] blur-3xl" />

      <header className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-mtn-yellow/25 bg-mtn-yellow/10 glow-yellow-sm">
            <BriefcaseBusiness className="h-6 w-6 text-mtn-yellow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hero text-3xl font-black text-on-surface">Business Stress Tester</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
              Upload a three-year business plan, apply management-defined shocks, and explore financial resilience with 10,000 Monte Carlo paths.
            </p>
          </div>
        </div>
        <button onClick={runSimulation} disabled={running} className="group flex items-center gap-2 rounded-xl bg-mtn-yellow px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(255,208,0,.14)] transition hover:bg-mtn-yellow-bright disabled:opacity-60">
          {running ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-black" />}
          {running ? 'Running 10,000 paths' : 'Run simulation'}
          {!running && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {workflowSteps.map(({ number, title, state, icon: Icon }, index) => (
          <div key={number} className={`relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 ${index === (result ? 2 : 1) ? 'border-mtn-yellow/35 bg-mtn-yellow/[0.06]' : 'border-white/7 bg-white/[0.02]'}`}>
            <span className="font-mono text-xl font-black text-mtn-yellow/30">{number}</span>
            <Icon className="h-4 w-4 text-on-surface-variant" />
            <div><p className="text-xs font-bold text-on-surface">{title}</p><p className="text-[9px] font-mono text-on-surface-variant">{state}</p></div>
            {index < 2 && <ChevronRight className="ml-auto h-4 w-4 text-white/15" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-error/40 bg-error/10 p-4 flex gap-3 text-sm text-error">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <section className="space-y-6">
          <div className="card-ambient rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><p className="font-hero text-lg font-bold text-on-surface">Three-year management plan</p><p className="text-xs text-on-surface-variant">FY2026–FY2028 · editable values</p></div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/7">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-white/[0.035] text-[9px] font-mono uppercase tracking-widest text-on-surface-variant"><tr><th className="px-4 py-3 text-left">Metric</th>{YEARS.map(year => <th key={year} className="px-3 py-3 text-right">{year}</th>)}</tr></thead>
                <tbody>
                  {[
                    { key: 'revenue', metric: 'Service revenue', unit: 'GHS m' },
                    { key: 'ebitda', metric: 'EBITDA', unit: 'GHS m' },
                    { key: 'capex', metric: 'CAPEX', unit: 'GHS m' },
                    { key: 'subscribers', metric: 'Subscribers', unit: 'm' },
                  ].map(({ key, metric, unit }, rowIndex) => (
                    <tr key={key} className="border-t border-white/5">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-on-surface">{metric}</p>
                        <p className="text-[9px] font-mono text-on-surface-variant">{unit}</p>
                      </td>
                      {(plan as Record<string, number[]>)[key]!.map((value, yearIndex) => (
                        <td key={YEARS[yearIndex]!} className="px-3 py-2 text-right">
                          <input
                            aria-label={`${metric} ${YEARS[yearIndex]!}`}
                            type="number"
                            value={value}
                            onChange={event => updatePlan(rowIndex, yearIndex, Number(event.target.value))}
                            className="w-28 rounded-lg border border-white/7 bg-black/20 px-2 py-2 text-right font-data text-xs text-on-surface transition focus:border-mtn-yellow/50"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
            <div className="mb-4"><p className="font-hero text-lg font-bold text-on-surface">Stress scenario</p><p className="text-xs text-on-surface-variant">Choose a preset, then fine-tune the assumptions</p></div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{PRESETS.map((preset, index) => <button key={preset.name} onClick={() => choosePreset(index)} className={`rounded-xl border p-3 text-left transition ${selectedPreset === index ? 'border-mtn-yellow/45 bg-mtn-yellow/[0.07]' : 'border-white/7 bg-white/[0.02] hover:border-white/15'}`}><span className="mb-2 block h-1.5 w-6 rounded-full" style={{ background: preset.tone }} /><p className="text-xs font-bold text-on-surface">{preset.name}</p><p className="mt-1 text-[9px] text-on-surface-variant">{preset.description}</p></button>)}</div>
            <div className="mt-5 grid gap-x-8 gap-y-5 rounded-xl border border-white/5 bg-black/20 p-4 md:grid-cols-2">
              <ShockSlider label="Revenue shock" detail="Downside to service revenue" value={shocks.revenue} min={-25} max={0} suffix="%" onChange={value => setShocks(current => ({ ...current, revenue: value }))} />
              <ShockSlider label="FX depreciation" detail="GHS weakening against USD" value={shocks.fx} min={0} max={50} suffix="%" onChange={value => setShocks(current => ({ ...current, fx: value }))} />
              <ShockSlider label="Operating cost pressure" detail="Incremental opex inflation" value={shocks.opex} min={0} max={25} suffix="%" onChange={value => setShocks(current => ({ ...current, opex: value }))} />
              <ShockSlider label="Subscriber churn" detail="Additional customer attrition" value={shocks.churn} min={0} max={20} suffix="pp" onChange={value => setShocks(current => ({ ...current, churn: value }))} />
            </div>
          </div>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="card-ambient overflow-hidden rounded-2xl border border-mtn-yellow/20 bg-[linear-gradient(145deg,rgba(255,208,0,.07),rgba(14,14,24,.95)_42%)] p-5">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-mtn-yellow" /><p className="font-hero text-lg font-bold text-on-surface">Resilience outlook</p></div><p className="mt-1 text-[10px] text-on-surface-variant">{result ? `Backend • ${mc?.nSimulations.toLocaleString() ?? '—'} paths • ${new Date(result.generatedAt).toLocaleTimeString()}` : 'Run simulation for real results'}</p></div>
              <span className={`rounded-full border px-2 py-1 text-[9px] font-mono font-bold ${result ? 'border-green-400/25 bg-green-400/10 text-green-300' : 'border-white/10 text-on-surface-variant'}`}>{result ? 'COMPLETE' : 'PREVIEW'}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard label="Resilience score" value={`${(det?.resilience ?? 85).toFixed(0)}/100`} delta={det && det.resilience > 65 ? 'Moderate capacity' : 'Management action required'} icon={ShieldCheck} danger={det ? det.resilience <= 65 : false} />
              <MetricCard label="EBITDA impact" value={`GHS ${(det?.impact ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}m`} delta={`${det ? ((det.impact / Math.max(det.baseTotal, 1)) * -100).toFixed(1) : '—'}% vs plan`} icon={TrendingDown} danger />
              <MetricCard label="Revenue at risk" value={`GHS ${(det?.revenueAtRisk ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}m`} delta="Across three-year horizon" icon={CircleDollarSign} danger />
              <MetricCard label="FY28 margin" value={`${(det?.margin ?? 0).toFixed(1)}%`} delta="Stressed EBITDA margin" icon={BarChart3} danger={det ? det.margin < 40 : false} />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-on-surface">EBITDA trajectory</p>
                <span className="text-[9px] font-mono text-on-surface-variant">GHS million</span>
              </div>
              <ProjectionChart
                base={result?.plan.ebitda ?? plan.ebitda}
                stressed={det?.ebitda ?? plan.ebitda.map((e, i) => e * _stressFactor(shocks) * (1 - i * 0.012))}
                p05={mc?.p05}
                p95={mc?.p95}
              />
            </div>
          </div>

          {/* Monte Carlo confidence bands */}
          {mc && (
            <div className="rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-3">Monte Carlo Confidence Bands</p>
              <div className="space-y-2">
                {YEARS.map((year, i) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-on-surface-variant w-14 shrink-0">{year}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="font-mono text-[8px] text-error w-16 text-right">{mc.p05[i]?.toLocaleString()}</span>
                      <div className="flex-1 h-3 rounded bg-surface-container relative">
                        {(() => {
                          const allVals = mc.p05.concat(mc.p95);
                          const bandMin = Math.min(...allVals);
                          const bandMax = Math.max(...allVals);
                          const bandRange = bandMax - bandMin || 1;
                          const p05Pct = ((mc.p05[i]! - bandMin) / bandRange) * 80 + 10;
                          const p95Pct = ((mc.p95[i]! - bandMin) / bandRange) * 80 + 10;
                          const p50Pct = ((mc.p50[i]! - bandMin) / bandRange) * 80 + 10;
                          return (
                            <>
                              <div className="absolute top-0 bottom-0 bg-mtn-yellow/15 rounded" style={{ left: `${p05Pct}%`, width: `${p95Pct - p05Pct}%` }} />
                              <div className="absolute top-0 bottom-0 w-0.5 bg-mtn-yellow rounded" style={{ left: `${p50Pct}%` }} />
                            </>
                          );
                        })()}
                      </div>
                      <span className="font-mono text-[8px] text-green-400 w-16">{mc.p95[i]?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-mtn-yellow" /><p className="text-sm font-bold text-on-surface">Management signals</p></div>
            <div className="mt-4 space-y-3">
              {(result?.signals ?? [
                { title: 'Liquidity buffer', status: 'Monitor', detail: 'Protect funding headroom under FX pressure.' },
                { title: 'Cost response', status: 'Prepared', detail: 'Phase discretionary spend and vendor exposure.' },
                { title: 'Customer defence', status: 'Monitor', detail: 'Target retention offers in vulnerable segments.' },
              ]).map((sig) => <div key={sig.title} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${sig.status === 'Priority' || sig.status === 'Escalate' ? 'bg-error' : 'bg-mtn-yellow'}`} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-xs font-semibold text-on-surface">{sig.title}</p><span className="text-[9px] font-mono text-on-surface-variant">{sig.status}</span></div><p className="mt-1 text-[10px] leading-relaxed text-on-surface-variant">{sig.detail}</p></div></div>)}
            </div>
          </div>

          <button onClick={() => { choosePreset(0); setPlan(DEFAULT_PLAN); setResult(null); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[10px] font-mono text-on-surface-variant transition hover:border-white/20 hover:text-on-surface"><RotateCcw className="h-3.5 w-3.5" /> Reset workspace</button>
        </aside>
      </div>
    </div>
  );
}

function _stressFactor(shocks: Shocks): number {
  return 1 + (shocks.revenue / 100) - (shocks.opex * 0.006) - (shocks.fx * 0.003) - (shocks.churn * 0.004);
}
