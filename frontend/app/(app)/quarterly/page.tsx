"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { fetchQuarterly } from '@/lib/api';
import { ThemeTokens } from '@/lib/theme';
import { KpiId, QuarterlyPoint } from '@/lib/types';

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

export default function QuarterlyPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('FIN01');
  const [data, setData] = useState<QuarterlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchQuarterly(selectedKpi)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedKpi]);

  const chartData = {
    labels: data.map(d => d.quarter),
    datasets: [
      {
        label: KPIS.find(k => k.id === selectedKpi)?.label ?? selectedKpi,
        data: data.map(d => d.value),
        backgroundColor: data.map((_, i) =>
          i === data.length - 1
            ? ThemeTokens.colors.mtnYellow
            : ThemeTokens.colors.mtnYellow + '88'
        ),
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Quarterly Trends</h1>
          <p className="text-on-surface-variant mt-1">Historical quarterly performance (FY20–FY25)</p>
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

      <Card className="h-[500px]">
        {loading ? (
          <SkeletonBlock className="h-full w-full" />
        ) : data.length > 0 ? (
          <BarChart data={chartData} height="100%" />
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant font-mono text-sm">
            No data for {selectedKpi}
          </div>
        )}
      </Card>
    </div>
  );
}
