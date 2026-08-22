"use client";

import { useEffect, useState, useCallback } from 'react';
import { fetchEventForecast, fetchKpis } from '@/lib/api';
import type { EventForecast, EventForecastPoint, Kpi, KpiId } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { ThemeTokens } from '@/lib/theme';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { useAppState } from '@/stores/useAppState';
import { KpiStrip } from '@/components/forecasts/KpiStrip';
import { formatNumber, formatPct } from '@/lib/format';
import { Tooltip } from '@/components/ui/Tooltip';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import {
  Table, LayoutList, TrendingUp, TrendingDown, Sparkles,
  ArrowUpRight, ArrowDownRight, Info,
} from 'lucide-react';
import type React from 'react';

export default function ForecastsPage() {
  const { state, dispatch } = useAppState();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [forecast, setForecast] = useState<EventForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAsTable, setViewAsTable] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<EventForecastPoint | null>(null);

  const activeKpiId = state.activeForecastKpi;
  const kpi = kpis.find(k => k.id === activeKpiId);

  useEffect(() => {
    fetchKpis().then(setKpis).catch(() => {});
  }, []);

  const load = useCallback((id: KpiId) => {
    setLoading(true);
    setSelectedPoint(null);
    fetchEventForecast(id, 90)
      .then(data => { setForecast(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(activeKpiId);
  }, [activeKpiId, load]);

  const handleSelectKpi = (id: KpiId) => {
    dispatch({ type: 'SET_ACTIVE_FORECAST_KPI', payload: id });
  };

  const isPct = kpi?.unit === '%';
  const fmt = (val: number) => isPct ? formatPct(val) : formatNumber(val, 1);

  const points = forecast?.points ?? [];
  const chartData = {
    labels: points.map(f => f.date),
    datasets: [
      {
        label: 'Forecast (P50)',
        data: points.map(f => f.p50),
        borderColor: ThemeTokens.colors.mtnYellow,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: points.map(p =>
          selectedPoint?.date === p.date ? '#FFD000' : ThemeTokens.colors.mtnYellow
        ),
      },
      {
        label: 'Upper (P95)',
        data: points.map(f => f.p95),
        backgroundColor: ThemeTokens.colors.mtnYellow + '22',
        borderColor: 'transparent',
        fill: 1,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: 'Lower (P05)',
        data: points.map(f => f.p05),
        backgroundColor: ThemeTokens.colors.error + '22',
        borderColor: 'transparent',
        fill: 1,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };


  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-5 animate-in fade-in duration-500">
      {/* Header — minimal text, tooltip explains the model */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-hero font-bold text-on-surface">Forecasts</h1>
        <Tooltip content="Real-time forecast: ARIMA baseline blended with live news risk events. Each point is adjustable — click a row to see the contributing events." maxWidth={300}>
          <Info className="w-4 h-4 text-on-surface-variant cursor-help" />
        </Tooltip>
        {forecast && (
          <span className="ml-auto font-mono text-[10px] px-2 py-1 rounded" style={{ background: forecast.llmUsed ? 'rgba(130,177,255,0.1)' : 'rgba(255,255,255,0.04)', color: forecast.llmUsed ? ThemeTokens.colors.secondary : ThemeTokens.colors.onSurfaceVariant }}>
            {forecast.llmUsed ? 'LLM-assisted' : 'Model + events'}
          </span>
        )}
      </div>

      <KpiStrip activeKpiId={activeKpiId} onSelectKpi={handleSelectKpi} kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">
        {/* Chart / table */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col p-5 bg-surface-container-low border border-outline/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono text-outline uppercase tracking-widest">
                {kpi?.id} · {kpi?.name} ({kpi?.unit})
              </h2>
              <div className="flex items-center space-x-3">
                <FeedbackWidget page="forecasts" context={{ kpiId: activeKpiId, kpiLabel: kpi?.name }} label="Accurate?" />
                <button
                  onClick={() => setViewAsTable(!viewAsTable)}
                  className="text-on-surface-variant hover:text-white transition-colors"
                  title={viewAsTable ? 'View as chart' : 'View as table'}
                  aria-label="Toggle table view"
                >
                  {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex-1 relative min-h-[320px]">
              {loading ? (
                <SkeletonBlock className="h-full w-full absolute inset-0" />
              ) : viewAsTable ? (
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline/20 sticky top-0 bg-surface-container-low z-10">
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Date</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">P50</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Adj.</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Events</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant"></th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs text-white">
                      {points.map((p, i) => (
                        <tr
                          key={i}
                          onClick={() => setSelectedPoint(p)}
                          className={`border-b border-outline/10 hover:bg-surface-container cursor-pointer transition-colors ${selectedPoint?.date === p.date ? 'bg-mtn-yellow/5' : ''}`}
                        >
                          <td className="py-2">{p.date}</td>
                          <td className="py-2 text-right text-mtn-yellow font-bold">{fmt(p.p50)}</td>
                          <td className={`py-2 text-right ${p.adjustmentPct && p.adjustmentPct < 0 ? 'text-error' : p.adjustmentPct && p.adjustmentPct > 0 ? 'text-success' : 'text-on-surface-variant'}`}>
                            {p.adjustmentPct ? `${p.adjustmentPct > 0 ? '+' : ''}${p.adjustmentPct.toFixed(2)}%` : '—'}
                          </td>
                          <td className="py-2 text-right">{p.events?.length ?? 0}</td>
                          <td className="py-2 text-right">
                            {p.events && p.events.length > 0 && <Info className="w-3 h-3 text-on-surface-variant inline" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <LineChart
                  data={chartData as unknown as React.ComponentProps<typeof LineChart>['data']}
                  height="100%"
                  onElementClick={(index: number) => {
                    const pt = points[index];
                    if (pt) setSelectedPoint(pt);
                  }}
                  options={{
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label: (context: any) => {
                            const val = context.raw;
                            if (val === null) return null;
                            return `${context.dataset.label}: ${fmt(val)}${kpi?.unit}`;
                          },
                        },
                      },
                      legend: {
                        display: true,
                        position: 'top' as const,
                        labels: { color: 'rgba(240,237,232,0.5)', font: { size: 10, family: 'monospace' }, boxWidth: 12, padding: 12 },
                      },
                    },
                    scales: {
                      x: {
                        grid: { color: ThemeTokens.colors.outline + '20' },
                        ticks: { color: 'rgba(240,237,232,0.4)', font: { size: 9 }, maxTicksLimit: 12 },
                      },
                      y: {
                        grid: { color: ThemeTokens.colors.outline + '20' },
                        ticks: {
                          color: 'rgba(240,237,232,0.4)',
                          font: { size: 9 },
                          callback: (val: number) => fmt(val),
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Right: narrative + drill-down */}
        <div className="lg:col-span-4 space-y-4">
          {loading ? (
            <SkeletonBlock className="h-full w-full" />
          ) : forecast ? (
            <>
              {/* Narrative + Trend Summary */}
              <Card className="p-4 bg-surface-container-low border border-outline/20">
                <div className="flex items-center gap-2 mb-2">
                  {forecast.llmUsed ? <Sparkles className="w-3.5 h-3.5 text-secondary" /> : <Info className="w-3.5 h-3.5 text-on-surface-variant" />}
                  <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {forecast.llmUsed ? 'LLM Narrative' : 'Model Narrative'}
                  </span>
                </div>
                <p className="font-sans text-xs text-on-surface leading-relaxed">{forecast.narrative}</p>
                <div className="mt-3 pt-3 border-t border-outline/10 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-mono text-[9px] uppercase text-on-surface-variant">Events</p>
                    <p className="font-mono text-base font-bold text-white">{forecast.eventCount}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-on-surface-variant">↑ Pressure</p>
                    <p className="font-mono text-base font-bold text-success">+{forecast.aggregatePressure.up.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-on-surface-variant">↓ Pressure</p>
                    <p className="font-mono text-base font-bold text-error">-{forecast.aggregatePressure.down.toFixed(1)}</p>
                  </div>
                </div>
                {/* Trend indicator */}
                {points.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-outline/10 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase text-on-surface-variant">Net trend</span>
                    <span className={`flex items-center gap-1 font-mono text-xs font-bold ${forecast.aggregatePressure.net >= 0 ? 'text-success' : 'text-error'}`}>
                      {forecast.aggregatePressure.net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {forecast.aggregatePressure.net >= 0 ? '+' : ''}{forecast.aggregatePressure.net.toFixed(2)} GHSm
                    </span>
                  </div>
                )}
              </Card>

              {/* Drill-down for a selected point */}
              <Card className="p-4 bg-surface-container-low border border-outline/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {selectedPoint ? `Point · ${selectedPoint.date}` : 'Select a point'}
                  </span>
                  {selectedPoint?.adjustmentPct !== undefined && selectedPoint.adjustmentPct !== 0 && (
                    <span className={`font-mono text-xs font-bold ${selectedPoint.adjustmentPct < 0 ? 'text-error' : 'text-success'}`}>
                      {selectedPoint.adjustmentPct > 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                      {selectedPoint.adjustmentPct > 0 ? '+' : ''}{selectedPoint.adjustmentPct.toFixed(2)}%
                    </span>
                  )}
                </div>

                {!selectedPoint ? (
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Click a row in the table (or switch to table view) to drill into the exact events driving that forecast point.
                  </p>
                ) : (selectedPoint.events?.length ?? 0) === 0 ? (
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    No qualifying live events pressure this point — it follows the trained ARIMA baseline.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {selectedPoint.events!.map((e, idx) => (
                      <a
                        key={idx}
                        href={e.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 rounded-lg border border-outline/10 hover:bg-surface-container transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-sans text-[11px] text-on-surface line-clamp-2 leading-snug">{e.title}</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ background: ThemeTokens.colors.surfaceContainerHigh, color: ThemeTokens.colors.mtnYellow }}>
                            {e.category.slice(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[9px] text-on-surface-variant">
                          <span>sev {e.severity.toFixed(1)}</span>
                          <span>rel {(e.mtnRelevance * 100).toFixed(0)}%</span>
                          <span>{e.ageDays.toFixed(0)}d old</span>
                          <span className={e.pressureDirection === 'down' ? 'text-error' : 'text-success'}>
                            {e.pressureDirection === 'down' ? <TrendingDown className="w-2.5 h-2.5 inline" /> : <TrendingUp className="w-2.5 h-2.5 inline" />}
                            {e.pressurePct > 0 ? '+' : ''}{e.pressurePct.toFixed(2)}%
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
