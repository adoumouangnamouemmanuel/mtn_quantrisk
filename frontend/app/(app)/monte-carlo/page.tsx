'use client';

import { useState } from 'react';
import { runMonteCarlo } from '@/lib/api';
import type { MonteCarloResult, MonteCarloKpiResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { ScenarioPicker } from '@/components/scenarios/ScenarioPicker';
import type { Scenario } from '@/lib/types';
import { Dices, ChevronDown, ChevronUp } from 'lucide-react';

const N_OPTIONS = [200, 500, 1000, 2000];

function DistributionBar({ result }: { result: MonteCarloKpiResult }) {
  const min = result.worstCase;
  const max = result.bestCase;
  const range = max - min || 1;
  const toX = (v: number) => `${((v - min) / range) * 100}%`;

  return (
    <div className="mt-2">
      <div className="relative h-5 bg-surface-container rounded overflow-hidden">
        {/* IQR band P25-P75 */}
        <div
          className="absolute top-0 bottom-0 bg-mtn-yellow/30"
          style={{ left: toX(result.p25), width: `${((result.p75 - result.p25) / range) * 100}%` }}
        />
        {/* P05-P95 band */}
        <div
          className="absolute top-0 bottom-0 bg-mtn-yellow/10"
          style={{ left: toX(result.p05), width: `${((result.p95 - result.p05) / range) * 100}%` }}
        />
        {/* P50 median line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-mtn-yellow" style={{ left: toX(result.p50) }} />
        {/* Base value */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-on-surface-variant/60" style={{ left: toX(result.baseValue) }} />
      </div>
      <div className="flex justify-between mt-1 font-mono text-[8px] text-on-surface-variant">
        <span>Worst {result.worstCase.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
        <span className="text-mtn-yellow">P50 {result.p50.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
        <span>Best {result.bestCase.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
      </div>
    </div>
  );
}

function KpiRow({ r }: { r: MonteCarloKpiResult }) {
  const [open, setOpen] = useState(false);
  const downside = ((r.p05 - r.baseValue) / r.baseValue) * 100;

  return (
    <div className="border border-outline/15 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left"
      >
        <span className="font-mono text-[9px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant w-14 text-center shrink-0">{r.kpiId}</span>
        <span className="font-sans text-sm text-on-surface flex-1">{r.kpiName}</span>
        <span className="font-mono text-xs text-on-surface-variant">{r.unit}</span>
        <span className={`font-mono text-xs font-bold ${downside < -5 ? 'text-error' : downside < -2 ? 'text-mtn-yellow' : 'text-green-400'}`}>
          P05: {downside.toFixed(1)}%
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 bg-surface-container/30">
          <DistributionBar result={r} />
          <div className="grid grid-cols-5 gap-2 mt-3">
            {(['p05', 'p25', 'p50', 'p75', 'p95'] as const).map(p => (
              <div key={p} className="text-center">
                <p className="font-mono text-[8px] uppercase text-on-surface-variant">{p.toUpperCase()}</p>
                <p className="font-mono text-xs text-on-surface font-bold mt-0.5">{r[p].toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="font-mono text-[8px] uppercase text-on-surface-variant">Base</p>
              <p className="font-mono text-xs text-on-surface-variant">{r.baseValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase text-on-surface-variant">Std Dev</p>
              <p className="font-mono text-xs text-on-surface-variant">{r.std.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonteCarloPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [n, setN] = useState(1000);
  const [uncertainty, setUncertainty] = useState(20);
  const [severity, setSeverity] = useState(1.0);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => {
    if (!scenario) return;
    setRunning(true);
    setError('');
    try {
      const res = await runMonteCarlo(scenario.id, n, severity, uncertainty / 100);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Monte Carlo Simulation</h1>
        <p className="text-on-surface-variant mt-1">Run stochastic simulations to see the distribution of outcomes across {n.toLocaleString()} scenarios</p>
      </div>

      <div className="grid md:grid-cols-12 gap-5 items-start">

        {/* ── Config Panel ─── */}
        <div className="md:col-span-4 space-y-4">
          <Card className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Simulation Parameters</p>

            {/* Scenario selector */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Scenario</p>
              <button
                onClick={() => setPickerOpen(o => !o)}
                className="w-full text-left p-3 rounded-lg border border-outline/20 hover:border-mtn-yellow/40 transition-colors"
              >
                {scenario ? (
                  <span className="font-sans text-sm text-on-surface">{scenario.id} — {scenario.name}</span>
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
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Simulations</p>
              <div className="flex gap-2">
                {N_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setN(opt)}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] border transition-colors ${
                      n === opt ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10' : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
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
                <p className="font-mono text-[10px] text-mtn-yellow">±{uncertainty}%</p>
              </div>
              <input
                type="range" min={5} max={40} step={5} value={uncertainty}
                onChange={e => setUncertainty(Number(e.target.value))}
                className="w-full accent-[#FFD100]"
              />
              <div className="flex justify-between font-mono text-[8px] text-on-surface-variant mt-0.5">
                <span>±5%</span><span>±40%</span>
              </div>
            </div>

            {/* Severity */}
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Severity Multiplier</p>
                <p className="font-mono text-[10px] text-mtn-yellow">{severity.toFixed(1)}×</p>
              </div>
              <input
                type="range" min={0.5} max={3.0} step={0.1} value={severity}
                onChange={e => setSeverity(Number(e.target.value))}
                className="w-full accent-[#FFD100]"
              />
              <div className="flex justify-between font-mono text-[8px] text-on-surface-variant mt-0.5">
                <span>0.5×</span><span>3.0×</span>
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={!scenario || running}
              className="w-full py-3 rounded-xl font-mono font-bold text-sm uppercase tracking-widest bg-mtn-yellow text-black flex items-center justify-center gap-2 hover:bg-mtn-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {running ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Running…</>
              ) : (
                <><Dices className="w-4 h-4" /> Run Simulation</>
              )}
            </button>

            {error && <p className="font-mono text-[9px] text-error">{error}</p>}
          </Card>

          {result && (
            <Card className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Summary</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Simulations', value: result.nSimulations.toLocaleString() },
                  { label: 'Uncertainty', value: `±${(result.uncertaintyPct * 100).toFixed(0)}%` },
                  { label: 'Scenario', value: result.scenarioId },
                  { label: 'KPIs tracked', value: result.results.length },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-mono text-[8px] uppercase text-on-surface-variant">{label}</p>
                    <p className="font-mono text-sm text-on-surface font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── Results ─── */}
        <div className="md:col-span-8 space-y-3">
          {running && !result && (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <SkeletonBlock key={i} className="h-14 rounded-lg" />)}
            </div>
          )}

          {!running && !result && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-outline/20 rounded-xl">
              <Dices className="w-10 h-10 text-on-surface-variant mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                Select a scenario and run the simulation to see KPI distributions
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant px-1">
                {result.nSimulations.toLocaleString()} simulations — click a KPI to expand distribution
              </p>
              {result.results.map(r => <KpiRow key={r.kpiId} r={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
