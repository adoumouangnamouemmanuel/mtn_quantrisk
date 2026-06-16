"use client";

import React, { useMemo, useState } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { ThemeTokens } from '@/lib/theme';
import { Table, LayoutList } from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface BinarySearchTrajectoryProps {
  data: Array<{ iteration: number; severity: number; kpiValue: number }>;
}

export function BinarySearchTrajectory({ data }: BinarySearchTrajectoryProps) {
  const [viewAsTable, setViewAsTable] = useState(false);

  const chartData = useMemo(() => {
    return {
      labels: data.map(d => `Iter ${d.iteration}`),
      datasets: [
        {
          label: 'Severity Multiplier',
          data: data.map(d => d.severity),
          borderColor: ThemeTokens.colors.mtnYellow,
          backgroundColor: ThemeTokens.colors.mtnYellow,
          yAxisID: 'y',
          borderWidth: 2,
        },
        {
          label: 'KPI Value',
          data: data.map(d => d.kpiValue),
          borderColor: ThemeTokens.colors.secondary,
          backgroundColor: ThemeTokens.colors.secondary,
          yAxisID: 'y1',
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    };
  }, [data]);

  const options = {
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Severity',
          color: ThemeTokens.colors.mtnYellow,
          font: { family: 'Space Mono, monospace', size: 10 }
        },
        grid: { color: ThemeTokens.colors.outline + '33' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'KPI Value',
          color: ThemeTokens.colors.secondary,
          font: { family: 'Space Mono, monospace', size: 10 }
        },
        grid: { drawOnChartArea: false } // only draw grid lines for one axis
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={() => setViewAsTable(!viewAsTable)}
          className="text-on-surface-variant hover:text-white transition-colors bg-surface-container-low p-1 rounded"
          title={viewAsTable ? "View as chart" : "View as table"}
          aria-label="Toggle table view"
        >
          {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      {viewAsTable ? (
        <div className="overflow-y-auto h-full custom-scrollbar pt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/20">
                <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Iteration</th>
                <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Severity</th>
                <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">KPI Value</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-white">
              {data.map((row, i) => (
                <tr key={i} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                  <td className="py-2">{row.iteration}</td>
                  <td className="py-2 text-right text-mtn-yellow">{row.severity.toFixed(2)}x</td>
                  <td className="py-2 text-right text-secondary">{formatNumber(row.kpiValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <LineChart data={chartData} options={options} height="100%" />
      )}
    </div>
  );
}
