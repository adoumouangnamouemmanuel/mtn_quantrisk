"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { MOCK_QUARTERLY } from '@/lib/mockData';
import { ThemeTokens } from '@/lib/theme';
import { KpiId } from '@/lib/types';

export default function QuarterlyPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiId>('FIN01');

  const kpis: {id: KpiId; label: string}[] = [
    { id: 'FIN01', label: 'Service Revenue' },
    { id: 'FIN02', label: 'EBITDA' },
    { id: 'OPS04', label: 'ARPU' },
    { id: 'EXT03', label: 'Cedi/USD' },
  ];

  const data = MOCK_QUARTERLY[selectedKpi] || [];
  
  const chartData = {
    labels: data.map(d => d.quarter),
    datasets: [
      {
        label: selectedKpi,
        data: data.map(d => d.value),
        backgroundColor: ThemeTokens.colors.mtnYellow,
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Quarterly Trends</h1>
          <p className="text-on-surface-variant mt-1">Historical quarterly performance (2020-2025)</p>
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
          <BarChart data={chartData} height="100%" />
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant font-mono text-sm">
            No quarterly data available for {selectedKpi}
          </div>
        )}
      </Card>
    </div>
  );
}
