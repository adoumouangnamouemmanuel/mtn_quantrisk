"use client";

import React, { useEffect, useState } from 'react';
import { fetchForecast } from '@/lib/api';
import { ForecastPoint, KpiId } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { ThemeTokens } from '@/lib/theme';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { useAppState } from '@/stores/useAppState';
import { KpiStrip } from '@/components/forecasts/KpiStrip';
import { ForecastSidebar } from '@/components/forecasts/ForecastSidebar';
import { MOCK_KPIS } from '@/lib/mockData';
import { formatNumber, formatPct } from '@/lib/format';
import { Table, LayoutList } from 'lucide-react';

export default function ForecastsPage() {
  const { state, dispatch } = useAppState();
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsTable, setViewAsTable] = useState(false);

  const activeKpiId = state.activeForecastKpi;
  const kpi = MOCK_KPIS.find(k => k.id === activeKpiId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchForecast(activeKpiId, 90).then(data => {
      setForecast(data);
      setLoading(false);
    });
  }, [activeKpiId]);

  const handleSelectKpi = (id: KpiId) => {
    dispatch({ type: 'SET_ACTIVE_FORECAST_KPI', payload: id });
  };

  const isPct = kpi?.unit === '%';

  const chartData = {
    labels: forecast.map(f => f.date),
    datasets: [
      {
        label: 'Historical',
        data: forecast.map(f => f.isHistorical ? f.median : null),
        borderColor: ThemeTokens.colors.onSurfaceVariant,
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Forecast (P50)',
        data: forecast.map(f => !f.isHistorical ? f.p50 : null),
        borderColor: ThemeTokens.colors.mtnYellow,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: 'Confidence Interval (P95)',
        data: forecast.map(f => !f.isHistorical ? f.p95 : null),
        backgroundColor: ThemeTokens.colors.mtnYellow + '33', // 20% opacity
        borderColor: 'transparent',
        fill: 1, // fill to Forecast (P50)
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 0
      },
      {
        label: 'Lower Bound (P05)',
        data: forecast.map(f => !f.isHistorical ? f.p05 : null),
        backgroundColor: ThemeTokens.colors.error + '33',
        borderColor: 'transparent',
        fill: 1, // fill to Forecast (P50)
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 0
      }
    ]
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Predictive Forecasts</h1>
        <p className="text-on-surface-variant mt-1">90-day forward-looking estimates based on 36-month ARIMA momentum</p>
      </div>

      <KpiStrip activeKpiId={activeKpiId} onSelectKpi={handleSelectKpi} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* Main Chart */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col p-6 bg-surface-container-low border border-outline/20">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-sm font-mono text-outline uppercase tracking-widest">
                {kpi?.id} - {kpi?.name} ({kpi?.unit})
              </h2>
              <button 
                onClick={() => setViewAsTable(!viewAsTable)}
                className="text-on-surface-variant hover:text-white transition-colors"
                title={viewAsTable ? "View as chart" : "View as table"}
                aria-label="Toggle table view"
              >
                {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-1 relative">
              {loading ? (
                <SkeletonBlock className="h-full w-full absolute inset-0" />
              ) : viewAsTable ? (
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline/20 sticky top-0 bg-surface-container-low z-10">
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Date</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Actual/Base</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Lower Bound (p05)</th>
                        <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Upper Bound (p95)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs text-white">
                      {forecast.map((f, i) => (
                        <tr key={i} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                          <td className="py-2">{f.date}</td>
                          <td className={`py-2 text-right ${f.isHistorical ? 'text-on-surface-variant' : 'text-mtn-yellow font-bold'}`}>
                            {isPct ? formatPct(f.isHistorical ? f.median : f.p50) : formatNumber(f.isHistorical ? f.median : f.p50, 1)}
                          </td>
                          <td className="py-2 text-right text-error">{f.isHistorical ? '-' : isPct ? formatPct(f.p05) : formatNumber(f.p05, 1)}</td>
                          <td className="py-2 text-right text-success">{f.isHistorical ? '-' : isPct ? formatPct(f.p95) : formatNumber(f.p95, 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <LineChart 
                  data={chartData as unknown as React.ComponentProps<typeof LineChart>['data']} 
                  height="100%" 
                  options={{
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label: (context: any) => {
                            const val = context.raw;
                            if (val === null) return null;
                            const formatted = isPct ? formatPct(val) : formatNumber(val, 1);
                            return `${context.dataset.label}: ${formatted}${kpi?.unit}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: ThemeTokens.colors.outline + '20' }
                      },
                      y: {
                        grid: { color: ThemeTokens.colors.outline + '20' }
                      }
                    }
                  }}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          {loading ? (
            <SkeletonBlock className="h-full w-full" />
          ) : (
            <ForecastSidebar kpiId={activeKpiId} forecast={forecast} />
          )}
        </div>
      </div>
    </div>
  );
}
