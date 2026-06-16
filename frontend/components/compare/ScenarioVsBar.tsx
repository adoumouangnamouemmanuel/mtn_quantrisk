"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { ThemeTokens } from '@/lib/theme';
import { ScenarioOutput, Kpi, Scenario } from '@/lib/types';
import { Table, LayoutList } from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface ScenarioVsBarProps {
  kpis: Kpi[];
  outputA: ScenarioOutput;
  outputB: ScenarioOutput;
  scenarioA: Scenario;
  scenarioB: Scenario;
}

const ANCHOR_KPIS = ['FIN01', 'FIN02', 'FIN03', 'FIN04', 'FIN05', 'SEG03', 'OPS04'];

export function ScenarioVsBar({ kpis, outputA, outputB, scenarioA, scenarioB }: ScenarioVsBarProps) {
  const [viewMode, setViewMode] = useState<'pct' | 'abs'>('pct');
  const [viewAsTable, setViewAsTable] = useState(false);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const baseData: number[] = [];
    const aData: number[] = [];
    const bData: number[] = [];

    ANCHOR_KPIS.forEach(kpiId => {
      const kpi = kpis.find(k => k.id === kpiId);
      if (!kpi) return;
      labels.push(kpiId);

      const resA = outputA.results.find(r => r.kpiId === kpiId);
      const resB = outputB.results.find(r => r.kpiId === kpiId);

      if (viewMode === 'pct') {
        baseData.push(0);
        aData.push(resA ? resA.deltaPct : 0);
        bData.push(resB ? resB.deltaPct : 0);
      } else {
        baseData.push(kpi.fy25Value);
        aData.push(resA ? resA.scenarioValue : kpi.fy25Value);
        bData.push(resB ? resB.scenarioValue : kpi.fy25Value);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Base',
          data: baseData,
          backgroundColor: ThemeTokens.colors.mtnYellow,
          borderRadius: 2
        },
        {
          label: `A: ${scenarioA.id}`,
          data: aData,
          backgroundColor: ThemeTokens.colors.secondary,
          borderRadius: 2
        },
        {
          label: `B: ${scenarioB.id}`,
          data: bData,
          backgroundColor: ThemeTokens.colors.error,
          borderRadius: 2
        }
      ]
    };
  }, [kpis, outputA, outputB, scenarioA, scenarioB, viewMode]);

  return (
    <Card className="p-4 md:p-6 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h3 className="font-sans text-lg font-bold text-white">Scenario Comparison</h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-surface border border-outline/20 rounded overflow-hidden">
            <button 
              className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${viewMode === 'pct' ? 'bg-surface-container-high text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => setViewMode('pct')}
            >
              % Deviation
            </button>
            <button 
              className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${viewMode === 'abs' ? 'bg-surface-container-high text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => setViewMode('abs')}
            >
              Absolute
            </button>
          </div>
          
          <button 
            onClick={() => setViewAsTable(!viewAsTable)}
            className="text-on-surface-variant hover:text-white transition-colors p-2"
            title={viewAsTable ? "View as chart" : "View as table"}
            aria-label="Toggle table view"
          >
            {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="h-[300px] mb-4">
        {viewAsTable ? (
          <div className="overflow-y-auto h-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">KPI</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Base</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">A: {scenarioA.id}</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">B: {scenarioB.id}</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-white">
                {chartData.labels.map((label, i) => (
                  <tr key={label} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                    <td className="py-2">{label}</td>
                    <td className="py-2 text-right text-mtn-yellow">{formatNumber(chartData.datasets[0]!.data[i] as number)}</td>
                    <td className="py-2 text-right text-secondary">{formatNumber(chartData.datasets[1]!.data[i] as number)}</td>
                    <td className="py-2 text-right text-error">{formatNumber(chartData.datasets[2]!.data[i] as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <BarChart data={chartData} height={300} />
        )}
      </div>

      {!viewAsTable && (
        <div className="flex justify-center space-x-6 pt-4 border-t border-outline/10">
          {chartData.datasets.map((ds, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ds.backgroundColor as string }} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {ds.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
