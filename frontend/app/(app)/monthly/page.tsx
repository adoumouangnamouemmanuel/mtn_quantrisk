"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { TrendDrillDown, TrendPointDetail } from '@/components/trends/TrendDrillDown';
import { Tooltip } from '@/components/ui/Tooltip';
import { fetchMonthly } from '@/lib/api';
import { ThemeTokens } from '@/lib/theme';
import { HistoryMetadata, KpiId, MonthlyPoint } from '@/lib/types';
import { Calendar } from 'lucide-react';
import { LiveRiskEvents } from '@/components/intelligence/LiveRiskEvents';

const KPIS: { id: KpiId; label: string; riskCategory: string; unit: string }[] = [
  { id: 'OPS01', label: 'Total Subscribers', riskCategory: 'competitive',  unit: 'M' },
  { id: 'OPS04', label: 'ARPU',              riskCategory: 'competitive',  unit: 'GHS' },
  { id: 'EXT01', label: 'Inflation',         riskCategory: 'macro',         unit: '%' },
  { id: 'EXT03', label: 'Cedi/USD',          riskCategory: 'fx_financial', unit: 'GHS/USD' },
  { id: 'FIN01', label: 'Service Revenue',   riskCategory: 'fx_financial', unit: 'GHSm' },
  { id: 'SEG03', label: 'MoMo Revenue',      riskCategory: 'fx_financial', unit: 'GHSm' },
];

export default function MonthlyPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('OPS01');
  const [data, setData] = useState<MonthlyPoint[]>([]);
  const [metadata, setMetadata] = useState<HistoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drillDown, setDrillDown] = useState<TrendPointDetail | null>(null);

  useEffect(() => {
    fetchMonthly(selectedKpi, 36)
      .then(series => {
        setData(series.points);
        setMetadata(series.metadata);
        setError(null);
        setDrillDown(null);
      })
      .catch(reason => {
        setData([]);
        setMetadata(null);
        setError(reason instanceof Error ? reason.message : 'Unable to load history');
      })
      .finally(() => setLoading(false));
  }, [selectedKpi]);

  const activeKpi = KPIS.find(k => k.id === selectedKpi)!;

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: activeKpi?.label ?? selectedKpi,
        data: data.map(d => d.value),
        borderColor: ThemeTokens.colors.mtnYellow,
        backgroundColor: ThemeTokens.colors.mtnYellow + '1A',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  function handlePointClick(index: number) {
    const pt = data[index];
    if (!pt) return;
    setDrillDown({
      period: pt.month,
      value: pt.value,
      unit: activeKpi.unit,
      quality: pt.quality,
      index,
      prevValue: index > 0 ? data[index - 1]?.value ?? null : null,
      nextValue: index < data.length - 1 ? data[index + 1]?.value ?? null : null,
      sourceFile: metadata?.sourceFile ?? null,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Monthly Trends</h1>
            <p className="text-on-surface-variant mt-0.5">Click any point to drill down — no synthetic monthly interpolation</p>
          </div>
        </div>

        <select
          value={selectedKpi}
          onChange={e => {
            setSelectedKpi(e.target.value as KpiId);
            setLoading(true);
          }}
          className="bg-surface-container border border-outline/30 rounded-md py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-mtn-yellow font-sans"
        >
          {KPIS.map(k => (
            <option key={k.id} value={k.id}>{k.id} — {k.label}</option>
          ))}
        </select>
      </div>

      {/* Provenance strip */}
      {metadata && (
        <div className="rounded-xl border border-outline/15 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono uppercase tracking-wider text-mtn-yellow">Showing {metadata.actualFrequency}</span>
            <span>{metadata.sourceFile}</span>
            <span>· {metadata.pointCount} observations</span>
            {metadata.containsReported && (
              <Tooltip content="Actual reported figures from source documents">
                <span className="cursor-help rounded border border-green-400/25 bg-green-400/10 px-2 py-0.5 text-green-400">Reported</span>
              </Tooltip>
            )}
            {metadata.containsInterpolated && (
              <Tooltip content="Linearly interpolated between reported points">
                <span className="cursor-help rounded border border-blue-400/25 bg-blue-400/10 px-2 py-0.5 text-blue-400">Interpolated</span>
              </Tooltip>
            )}
            {metadata.containsEstimated && (
              <Tooltip content="Statistical estimates — not directly reported">
                <span className="cursor-help rounded border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-amber-400">Estimated</span>
              </Tooltip>
            )}
          </div>
          <p className="mt-1">{metadata.note}</p>
        </div>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {drillDown && (
        <TrendDrillDown detail={drillDown} onClose={() => setDrillDown(null)} />
      )}

      <Card className="h-[500px]">
        {loading ? (
          <SkeletonBlock className="h-full w-full" />
        ) : data.length > 0 ? (
          <LineChart
            data={chartData}
            height="100%"
            onElementClick={(index: number) => handlePointClick(index)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant font-mono text-sm">
            No data for {selectedKpi}
          </div>
        )}
      </Card>

      {/* Live scraping intelligence for this KPI's risk category */}
      {activeKpi && (
        <LiveRiskEvents
          category={activeKpi.riskCategory}
          label={`${activeKpi.label} — ${activeKpi.riskCategory.replace('_', ' / ')}`}
          limit={5}
        />
      )}
    </div>
  );
}
