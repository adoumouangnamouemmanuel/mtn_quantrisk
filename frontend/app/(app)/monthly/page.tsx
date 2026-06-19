"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { fetchMonthly } from '@/lib/api';
import { ThemeTokens } from '@/lib/theme';
import { KpiId, MonthlyPoint } from '@/lib/types';
import { Calendar } from 'lucide-react';

const KPIS: { id: KpiId; label: string }[] = [
  { id: 'OPS01', label: 'Total Subscribers' },
  { id: 'OPS04', label: 'ARPU' },
  { id: 'EXT01', label: 'Inflation' },
  { id: 'EXT03', label: 'Cedi/USD' },
  { id: 'FIN01', label: 'Service Revenue' },
  { id: 'SEG03', label: 'MoMo Revenue' },
];

export default function MonthlyPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('OPS01');
  const [data, setData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMonthly(selectedKpi, 36)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedKpi]);

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: KPIS.find(k => k.id === selectedKpi)?.label ?? selectedKpi,
        data: data.map(d => d.value),
        borderColor: ThemeTokens.colors.mtnYellow,
        backgroundColor: ThemeTokens.colors.mtnYellow + '1A',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Monthly Trends</h1>
            <p className="text-on-surface-variant mt-0.5">High-frequency trailing 36-month tracking</p>
          </div>
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
          <LineChart data={chartData} height="100%" />
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant font-mono text-sm">
            No data for {selectedKpi}
          </div>
        )}
      </Card>
    </div>
  );
}
