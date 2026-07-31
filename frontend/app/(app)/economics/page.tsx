'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Users, Globe, RefreshCw, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';
import {
  fetchGhanaEconomics, fetchEconomicsRiskContext,
  type GhanaEconomics, type EconomicsRiskContext, type EconomicIndicator,
} from '@/lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  Critical: 'text-red-600 bg-red-50 border-red-200',
  Warning:  'text-amber-600 bg-amber-50 border-amber-200',
  Watch:    'text-yellow-600 bg-yellow-50 border-yellow-200',
  Normal:   'text-emerald-600 bg-emerald-50 border-emerald-200',
  Unavailable: 'text-zinc-500 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-600',
};

const INDICATOR_META: Record<string, { label: string; icon: React.ElementType; invert?: boolean }> = {
  inflation:    { label: 'CPI Inflation',       icon: TrendingUp,   invert: true },
  gdp_growth:   { label: 'GDP Growth',           icon: BarChart2 },
  fx_usd_ghs:   { label: 'GHS / USD Rate',       icon: DollarSign,  invert: true },
  unemployment: { label: 'Unemployment Rate',    icon: Users,        invert: true },
  debt_service: { label: 'PPG Debt Service / GNI', icon: Globe,     invert: true },
  fdi_inflows:  { label: 'FDI Net Inflows / GDP',icon: TrendingDown },
};

function Sparkline({ history, invert }: { history: { year: number; value: number }[]; invert?: boolean }) {
  if (!history.length) return null;
  const vals = history.map(h => h.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 80, H = 32;
  const pts = vals.map((v, i) => {
    const x = vals.length === 1 ? W / 2 : (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');
  const last = vals[vals.length - 1] ?? 0;
  const prev = vals[vals.length - 2] ?? last;
  const up = last >= prev;
  const good = invert ? !up : up;
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={good ? '#10b981' : '#ef4444'} strokeWidth={1.5} />
    </svg>
  );
}

function IndicatorCard({ id, data }: { id: string; data: EconomicIndicator }) {
  const meta: { label: string; icon: React.ElementType; invert?: boolean } =
    INDICATOR_META[id] ?? { label: id, icon: BarChart2 };
  const Icon = meta.icon;
  if (data.latest === null) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex items-center gap-3 opacity-50">
        <Icon size={18} className="text-zinc-400" />
        <div>
          <p className="text-xs text-zinc-500">{meta.label}</p>
          <p className="text-sm font-medium text-zinc-400">Source unavailable</p>
        </div>
      </div>
    );
  }
  const val = data.latest!;
  const formatted = val >= 100 ? val.toFixed(1) : val.toFixed(2);
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700">
            <Icon size={15} className="text-zinc-500 dark:text-zinc-300" />
          </div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{meta.label}</p>
        </div>
        <span className="text-[10px] text-zinc-400">{data.period ?? data.year}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatted}</span>
          <span className="text-xs text-zinc-400 ml-1">{data.unit}</span>
        </div>
        <Sparkline history={data.history} invert={meta.invert} />
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400">
        <span>{data.frequency ?? 'Annual'}</span>
        {data.sourceUrl ? (
          <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="truncate hover:text-yellow-500">
            {data.source ?? 'Official source'}
          </a>
        ) : <span>{data.source}</span>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EconomicsPage() {
  const [data, setData]     = useState<GhanaEconomics | null>(null);
  const [ctx, setCtx]       = useState<EconomicsRiskContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const econ = await fetchGhanaEconomics(refresh);
      const riskCtx = await fetchEconomicsRiskContext();
      setData(econ);
      setCtx(riskCtx);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load economics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const indicatorIds = ['inflation', 'gdp_growth', 'fx_usd_ghs', 'unemployment', 'debt_service', 'fdi_inflows'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ghana Macro Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Latest official Ghana observations with World Bank historical fallback — cached for 6 hours.
          </p>
        </div>
        <button
          onClick={() => void load(true)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Risk context banner */}
      {ctx && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Info size={16} className="text-zinc-400 shrink-0" />
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">{ctx.summary}</span>
            <div className="flex gap-2 ml-auto flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RISK_COLOR[ctx.inflation_risk]}`}>
                Inflation: {ctx.inflation_risk}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RISK_COLOR[ctx.growth_risk]}`}>
                Growth: {ctx.growth_risk}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RISK_COLOR[ctx.fx_risk]}`}>
                FX: {ctx.fx_risk}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {indicatorIds.map(id => (
            <div key={id} className="rounded-xl border border-zinc-200 dark:border-zinc-700 h-28 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {/* Indicator grid */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {indicatorIds.map(id => (
            <IndicatorCard
              key={id}
              id={id}
              data={(data.indicators as Record<string, EconomicIndicator>)[id] ?? { latest: null, year: null, unit: '', description: '', history: [] }}
            />
          ))}
        </div>
      )}

      {/* History table */}
      {data && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">World Bank annual history (last 8 observations)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                <tr>
                  <th className="text-left px-4 py-2 text-zinc-500 font-medium">Year</th>
                  {indicatorIds.map(id => (
                    <th key={id} className="text-right px-4 py-2 text-zinc-500 font-medium whitespace-nowrap">
                      {INDICATOR_META[id]?.label ?? id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {(() => {
                  const years = new Set<number>();
                  indicatorIds.forEach(id => {
                    const ind = (data.indicators as Record<string, EconomicIndicator>)[id];
                    ind?.history?.forEach(h => years.add(h.year));
                  });
                  return [...years].sort((a, b) => b - a).map(year => (
                    <tr key={year} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-200">{year}</td>
                      {indicatorIds.map(id => {
                        const ind = (data.indicators as Record<string, EconomicIndicator>)[id];
                        const row = ind?.history?.find(h => h.year === year);
                        return (
                          <td key={id} className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-300">
                            {row ? row.value.toFixed(2) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Source attribution */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <CheckCircle2 size={12} />
        <span>Source: {data?.source ?? 'World Bank Open Data'}</span>
        {lastRefresh && <span>· Last fetched {lastRefresh.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
