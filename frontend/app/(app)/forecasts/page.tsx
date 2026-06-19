"use client";

import { useEffect, useState } from 'react';
import { fetchForecast } from '@/lib/api';
import type { ForecastPoint, KpiId } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { ThemeTokens } from '@/lib/theme';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import type React from 'react';

const KPIS: { id: KpiId; label: string }[] = [
  { id: 'FIN01', label: 'Service Revenue' },
  { id: 'FIN02', label: 'EBITDA' },
  { id: 'FIN03', label: 'EBITDA Margin' },
  { id: 'FIN04', label: 'PAT' },
  { id: 'SEG01', label: 'Data Revenue' },
  { id: 'SEG03', label: 'MoMo Revenue' },
  { id: 'OPS01', label: 'Total Subscribers' },
  { id: 'OPS04', label: 'ARPU' },
  { id: 'EXT01', label: 'Inflation' },
  { id: 'EXT02', label: 'BoG Policy Rate' },
  { id: 'EXT03', label: 'Cedi/USD' },
];

export default function ForecastsPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('FIN01');
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchForecast(selectedKpi, 90)
      .then(data => { setForecast(data); setLoading(false); })
      .catch(console.error);
  }, [selectedKpi]);

  const kpiLabel = KPIS.find(k => k.id === selectedKpi)?.label ?? selectedKpi;

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
        label: 'P95',
        data: forecast.map(f => !f.isHistorical ? f.p95 : null),
        backgroundColor: ThemeTokens.colors.mtnYellow + '33',
        borderColor: 'transparent',
        fill: 1,
        tension: 0.1,
      },
      {
        label: 'P05',
        data: forecast.map(f => !f.isHistorical ? f.p05 : null),
        borderColor: 'transparent',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Predictive Forecasts</h1>
          <p className="text-on-surface-variant mt-1">90-day forward-looking estimates based on current momentum</p>
        </div>
        <select
          value={selectedKpi}
          onChange={e => setSelectedKpi(e.target.value as KpiId)}
          className="bg-surface-container border border-outline/30 rounded-md py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-mtn-yellow font-sans"
        >
          {KPIS.map(k => (
            <option key={k.id} value={k.id}>{k.id} — {k.label}</option>
          ))}
        </select>
      </div>

      <Card className="h-[560px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono text-outline uppercase tracking-widest">
            {selectedKpi} — {kpiLabel} (90-day forecast)
          </h2>
          <FeedbackWidget
            page="forecasts"
            context={{ kpiId: selectedKpi, kpiLabel }}
            label="Accurate?"
          />
        </div>
        <div className="flex-1">
          {loading ? (
            <SkeletonBlock className="h-full w-full" />
          ) : (
            <LineChart data={chartData as unknown as React.ComponentProps<typeof LineChart>['data']} height="100%" />
          )}
        </div>
      </Card>
    </div>
  );
}
