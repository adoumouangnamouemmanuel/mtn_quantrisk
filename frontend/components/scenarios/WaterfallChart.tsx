"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { ThemeTokens } from '@/lib/theme';
import { formatNumber } from '@/lib/format';
import { Table, LayoutList } from 'lucide-react';

interface WaterfallChartProps {
  title: string;
  kpiId: string;
  result: { baseValue: number; scenarioValue: number };
  drivers: Array<{ name: string; contribution: number }>;
}

export function WaterfallChart({ title, kpiId, result, drivers }: WaterfallChartProps) {
  const [viewAsTable, setViewAsTable] = useState(false);

  const { chartData, tableData } = useMemo(() => {
    // For a waterfall, we need [start, end] for each bar
    const labels = ['Base'];
    const data: Array<number | [number, number]> = [[0, result.baseValue]];
    const bgColors = [ThemeTokens.colors.surfaceContainerHigh]; // Base color

    const tData = [
      { label: 'Base', start: 0, end: result.baseValue, delta: result.baseValue }
    ];

    let current = result.baseValue;
    
    drivers.forEach(step => {
      labels.push(step.name);
      data.push([current, current + step.contribution]);
      bgColors.push(step.contribution >= 0 ? ThemeTokens.colors.mtnYellow : ThemeTokens.colors.error);
      
      tData.push({
        label: step.name,
        start: current,
        end: current + step.contribution,
        delta: step.contribution
      });
      
      current += step.contribution;
    });

    labels.push('Scenario');
    data.push([0, result.scenarioValue]);
    bgColors.push(ThemeTokens.colors.surfaceContainerHigh); // End color
    
    tData.push({ label: 'Scenario', start: 0, end: result.scenarioValue, delta: result.scenarioValue });

    return {
      chartData: {
        labels,
        datasets: [{
          label: kpiId,
          data,
          backgroundColor: bgColors,
          borderRadius: 2
        }]
      },
      tableData: tData
    };
  }, [result, drivers, kpiId]);

  return (
    <Card className="p-4 bg-surface-container-low flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        <button 
          onClick={() => setViewAsTable(!viewAsTable)}
          className="text-on-surface-variant hover:text-white transition-colors"
          title={viewAsTable ? "View as chart" : "View as table"}
          aria-label="Toggle table view"
        >
          {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 min-h-[250px]">
        {viewAsTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Component</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Start</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Impact</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">End</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-white">
                {tableData.map((row, i) => (
                  <tr key={i} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                    <td className="py-2">{row.label}</td>
                    <td className="py-2 text-right text-on-surface-variant">{formatNumber(row.start)}</td>
                    <td className={`py-2 text-right ${row.delta < 0 && i !== 0 && i !== tableData.length - 1 ? 'text-error' : row.delta > 0 && i !== 0 && i !== tableData.length - 1 ? 'text-mtn-yellow' : ''}`}>
                      {row.delta > 0 && i !== 0 && i !== tableData.length - 1 ? '+' : ''}{formatNumber(row.delta)}
                    </td>
                    <td className="py-2 text-right">{formatNumber(row.end)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <BarChart 
            data={chartData} 
            height={250} 
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: (context: any) => {
                      const val = context.raw;
                      if (Array.isArray(val)) {
                        return `Impact: ${formatNumber(val[1] - val[0])}`;
                      }
                      return `Value: ${formatNumber(val)}`;
                    }
                  }
                }
              }
            }}
          />
        )}
      </div>
    </Card>
  );
}
