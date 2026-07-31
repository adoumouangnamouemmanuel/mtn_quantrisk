'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, BriefcaseBusiness,
  Check, ChevronRight, CircleDollarSign, Download, FileSpreadsheet,
  Gauge, Info, Play, RotateCcw, ShieldCheck, Sparkles, Target,
  TrendingDown, UploadCloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PlanRow = { metric: string; unit: string; values: [number, number, number] };
type Shocks = { revenue: number; fx: number; opex: number; churn: number };

const YEARS = ['FY2026', 'FY2027', 'FY2028'] as const;
const DEFAULT_PLAN: PlanRow[] = [
  { metric: 'Service revenue', unit: 'GHS m', values: [18240, 20790, 23540] },
  { metric: 'EBITDA', unit: 'GHS m', values: [10030, 11640, 13380] },
  { metric: 'CAPEX', unit: 'GHS m', values: [3560, 3920, 4260] },
  { metric: 'Subscribers', unit: 'm', values: [30.8, 32.4, 34.1] },
];

const PRESETS: { name: string; description: string; shocks: Shocks; tone: string }[] = [
  { name: 'Cedi pressure', description: 'FX-led cost escalation', shocks: { revenue: -4, fx: 22, opex: 9, churn: 2 }, tone: '#FFD000' },
  { name: 'Price war', description: 'ARPU and retention shock', shocks: { revenue: -12, fx: 5, opex: 4, churn: 11 }, tone: '#FF8A80' },
  { name: 'Network outage', description: 'Operational disruption', shocks: { revenue: -8, fx: 3, opex: 14, churn: 7 }, tone: '#82B1FF' },
  { name: 'Custom case', description: 'Build your own scenario', shocks: { revenue: -6, fx: 10, opex: 7, churn: 4 }, tone: '#80DEEA' },
];

function downloadTemplate() {
  const rows = [
    ['Metric', 'Unit', ...YEARS],
    ...DEFAULT_PLAN.map(row => [row.metric, row.unit, ...row.values.map(String)]),
  ];
  const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'quantrisk_3_year_business_plan.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

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

function ProjectionChart({ base, stressed }: { base: number[]; stressed: number[] }) {
  const all = [...base, ...stressed];
  const min = Math.min(...all) * 0.92;
  const max = Math.max(...all) * 1.04;
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

export default function BusinessStressPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [shocks, setShocks] = useState<Shocks>(PRESETS[0]!.shocks);
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);

  const results = useMemo(() => {
    const ebitda = plan.find(row => row.metric === 'EBITDA')?.values ?? [0, 0, 0];
    const revenue = plan.find(row => row.metric === 'Service revenue')?.values ?? [0, 0, 0];
    const stressFactor = 1 + (shocks.revenue / 100) - (shocks.opex * 0.006) - (shocks.fx * 0.003) - (shocks.churn * 0.004);
    const stressed = ebitda.map((value, index) => Math.max(0, value * stressFactor * (1 - index * 0.012)));
    const baseTotal = ebitda.reduce((sum, value) => sum + value, 0);
    const stressedTotal = stressed.reduce((sum, value) => sum + value, 0);
    const revenueAtRisk = revenue.reduce((sum, value) => sum + value, 0) * Math.abs(Math.min(0, shocks.revenue)) / 100;
    return {
      ebitda,
      stressed,
      impact: baseTotal - stressedTotal,
      revenueAtRisk,
      margin: stressed[2]! / Math.max(revenue[2]! * (1 + shocks.revenue / 100), 1) * 100,
      resilience: Math.max(18, Math.min(96, 91 - Math.abs(shocks.revenue) * 1.5 - shocks.fx * .35 - shocks.opex * .8 - shocks.churn)),
    };
  }, [plan, shocks]);

  function choosePreset(index: number) {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    if (!preset) return;
    setShocks(preset.shocks);
    setHasRun(false);
  }

  function updatePlan(rowIndex: number, yearIndex: number, value: number) {
    setPlan(current => current.map((row, index) => {
      if (index !== rowIndex) return row;
      const values = [...row.values] as [number, number, number];
      values[yearIndex] = value;
      return { ...row, values };
    }));
    setHasRun(false);
  }

  function runSimulation() {
    setRunning(true);
    window.setTimeout(() => {
      setHasRun(true);
      setRunning(false);
    }, 650);
  }

  const workflowSteps: { number: string; title: string; state: string; icon: LucideIcon }[] = [
    { number: '01', title: 'Business plan', state: fileName ? 'File ready' : 'Demo plan loaded', icon: FileSpreadsheet },
    { number: '02', title: 'Stress design', state: PRESETS[selectedPreset]?.name ?? 'Custom case', icon: Gauge },
    { number: '03', title: 'Decision output', state: hasRun ? 'Results generated' : 'Ready to simulate', icon: Target },
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
              <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-300">PROTOTYPE</span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
              Upload a three-year business plan, apply management-defined shocks, and explore financial resilience before decisions are made.
            </p>
          </div>
        </div>
        <button onClick={runSimulation} disabled={running} className="group flex items-center gap-2 rounded-xl bg-mtn-yellow px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(255,208,0,.14)] transition hover:bg-mtn-yellow-bright disabled:opacity-60">
          {running ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-black" />}
          {running ? 'Running 10,000 paths' : 'Run simulation'}
          {!running && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {workflowSteps.map(({ number, title, state, icon: Icon }, index) => (
          <div key={number} className={`relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 ${index === (hasRun ? 2 : fileName ? 1 : 0) ? 'border-mtn-yellow/35 bg-mtn-yellow/[0.06]' : 'border-white/7 bg-white/[0.02]'}`}>
            <span className="font-mono text-xl font-black text-mtn-yellow/30">{number}</span>
            <Icon className="h-4 w-4 text-on-surface-variant" />
            <div><p className="text-xs font-bold text-on-surface">{title}</p><p className="text-[9px] font-mono text-on-surface-variant">{state}</p></div>
            {index < 2 && <ChevronRight className="ml-auto h-4 w-4 text-white/15" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <section className="space-y-6">
          <div className="card-ambient rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><p className="font-hero text-lg font-bold text-on-surface">Three-year management plan</p><p className="text-xs text-on-surface-variant">CSV or Excel · FY2026–FY2028 · maximum 10 MB</p></div>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-mono text-on-surface-variant transition hover:border-mtn-yellow/30 hover:text-mtn-yellow"><Download className="h-3.5 w-3.5" /> Template</button>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={event => setFileName(event.target.files?.[0]?.name ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="group w-full rounded-xl border border-dashed border-mtn-yellow/25 bg-mtn-yellow/[0.025] p-5 text-left transition hover:border-mtn-yellow/55 hover:bg-mtn-yellow/[0.05]">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mtn-yellow/10"><UploadCloud className="h-5 w-5 text-mtn-yellow" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">{fileName ?? 'Drop financial plan here or browse'}</p>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">Required columns will be mapped and validated before modelling</p>
                </div>
                {fileName ? <Check className="h-5 w-5 text-green-400" /> : <span className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-mono text-on-surface-variant">Browse</span>}
              </div>
            </button>
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/7">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-white/[0.035] text-[9px] font-mono uppercase tracking-widest text-on-surface-variant"><tr><th className="px-4 py-3 text-left">Metric</th>{YEARS.map(year => <th key={year} className="px-3 py-3 text-right">{year}</th>)}</tr></thead>
                <tbody>{plan.map((row, rowIndex) => <tr key={row.metric} className="border-t border-white/5"><td className="px-4 py-3"><p className="text-xs font-semibold text-on-surface">{row.metric}</p><p className="text-[9px] font-mono text-on-surface-variant">{row.unit}</p></td>{row.values.map((value, yearIndex) => <td key={YEARS[yearIndex]!} className="px-3 py-2 text-right"><input aria-label={`${row.metric} ${YEARS[yearIndex]!}`} type="number" value={value} onChange={event => updatePlan(rowIndex, yearIndex, Number(event.target.value))} className="w-28 rounded-lg border border-white/7 bg-black/20 px-2 py-2 text-right font-data text-xs text-on-surface transition focus:border-mtn-yellow/50" /></td>)}</tr>)}</tbody>
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
              <div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-mtn-yellow" /><p className="font-hero text-lg font-bold text-on-surface">Resilience outlook</p></div><p className="mt-1 text-[10px] text-on-surface-variant">Illustrative frontend result · methodology pending approval</p></div>
              <span className={`rounded-full border px-2 py-1 text-[9px] font-mono font-bold ${hasRun ? 'border-green-400/25 bg-green-400/10 text-green-300' : 'border-white/10 text-on-surface-variant'}`}>{hasRun ? 'COMPLETE' : 'PREVIEW'}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard label="Resilience score" value={`${results.resilience.toFixed(0)}/100`} delta={results.resilience > 65 ? 'Moderate capacity' : 'Management action required'} icon={ShieldCheck} danger={results.resilience <= 65} />
              <MetricCard label="EBITDA impact" value={`GHS ${results.impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}m`} delta={`${((results.impact / Math.max(results.ebitda.reduce((a,b) => a+b, 0), 1)) * -100).toFixed(1)}% vs plan`} icon={TrendingDown} danger />
              <MetricCard label="Revenue at risk" value={`GHS ${results.revenueAtRisk.toLocaleString(undefined, { maximumFractionDigits: 0 })}m`} delta="Across three-year horizon" icon={CircleDollarSign} danger />
              <MetricCard label="FY28 margin" value={`${results.margin.toFixed(1)}%`} delta="Stressed EBITDA margin" icon={BarChart3} danger={results.margin < 40} />
            </div>
            <div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-on-surface">EBITDA trajectory</p><span className="text-[9px] font-mono text-on-surface-variant">GHS million</span></div><ProjectionChart base={results.ebitda} stressed={results.stressed} /></div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-surface-container-low/80 p-5">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-mtn-yellow" /><p className="text-sm font-bold text-on-surface">Management signals</p></div>
            <div className="mt-4 space-y-3">
              {[
                ['Liquidity buffer', results.resilience > 60 ? 'Monitor' : 'Escalate', 'Protect funding headroom under FX pressure.'],
                ['Cost response', shocks.opex > 10 ? 'Priority' : 'Prepared', 'Phase discretionary spend and vendor exposure.'],
                ['Customer defence', shocks.churn > 6 ? 'Priority' : 'Monitor', 'Target retention offers in vulnerable segments.'],
              ].map(([title, status, detail]) => <div key={title} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${status === 'Priority' || status === 'Escalate' ? 'bg-error' : 'bg-mtn-yellow'}`} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-xs font-semibold text-on-surface">{title}</p><span className="text-[9px] font-mono text-on-surface-variant">{status}</span></div><p className="mt-1 text-[10px] leading-relaxed text-on-surface-variant">{detail}</p></div></div>)}
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.045] p-4 text-xs text-blue-200/80">
            <Info className="h-4 w-4 shrink-0 text-blue-300" />
            <p className="leading-relaxed"><strong className="text-blue-200">Frontend preview:</strong> calculations are illustrative and not decision-grade. The sample workbook, parameter definitions, model equations, validation rules and audit trail will be connected when supplied.</p>
          </div>
          <button onClick={() => { setPlan(DEFAULT_PLAN); choosePreset(0); setFileName(null); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[10px] font-mono text-on-surface-variant transition hover:border-white/20 hover:text-on-surface"><RotateCcw className="h-3.5 w-3.5" /> Reset workspace</button>
        </aside>
      </div>
    </div>
  );
}
