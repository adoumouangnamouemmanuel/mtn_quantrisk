"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { MOCK_MONTHLY } from '@/lib/mockData';
import { ThemeTokens } from '@/lib/theme';
import { KpiId } from '@/lib/types';

export default function MonthlyPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('OPS01');

  const kpis: {id: KpiId; label: string}[] = [
    { id: 'OPS01', label: 'Total Subscribers' },
    { id: 'OPS04', label: 'ARPU' },
    { id: 'EXT01', label: 'Inflation' },
    { id: 'EXT03', label: 'Cedi/USD' },
  ];

  const data = MOCK_MONTHLY[selectedKpi] || [];
  
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: selectedKpi,
        data: data.map(d => d.value),
        borderColor: ThemeTokens.colors.mtnYellow,
        backgroundColor: ThemeTokens.colors.mtnYellow + '1A', // 10% opacity
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Monthly Trends</h1>
          <p className="text-on-surface-variant mt-1">High-frequency trailing 36-month tracking</p>
        </div>
        
        <select 
          value={selectedKpi}
          onChange={(e) => setSelectedKpi(e.target.value as KpiId)}
          className="bg-surface-container border border-outline/30 rounded-md py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-mtn-yellow font-sans"
        >
          {kpis.map(k => (
            <option key={k.id} value={k.id}>{k.id} - {k.label}</option>
          ))}
        </select>
      </div>

      <Card className="h-[500px]">
        {data.length > 0 ? (
          <LineChart data={chartData} height="100%" />
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant font-mono text-sm">
            No monthly data available for {selectedKpi}
          </div>
        )}
      </Card>
    </div>
  );
}
