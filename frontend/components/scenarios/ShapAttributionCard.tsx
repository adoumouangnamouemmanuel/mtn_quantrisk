"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { ThemeTokens } from '@/lib/theme';
import { formatNumber } from '@/lib/format';
import { Info, Table, LayoutList } from 'lucide-react';

interface ShapAttributionCardProps {
  attributions: Array<{ feature: string; contribution: number }>;
  unavailable?: boolean;
}

export function ShapAttributionCard({ attributions, unavailable }: ShapAttributionCardProps) {
  const [viewAsTable, setViewAsTable] = useState(false);

  const { chartData, topFeatures } = useMemo(() => {
    const topFeatures = attributions.slice(0, 8);
    const labels = topFeatures.map(f => f.feature);
    const data = topFeatures.map(f => f.contribution);
    const bgColors = data.map(val => val < 0 ? ThemeTokens.colors.error : ThemeTokens.colors.mtnYellow);

    return {
      topFeatures,
      chartData: {
        labels,
        datasets: [{
          label: 'SHAP Value',
          data,
          backgroundColor: bgColors,
          borderRadius: 2
        }]
      }
    };
  }, [attributions]);

  return (
    <Card className="p-4 bg-surface-container-low flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-sans text-lg font-bold text-white">Why This Result</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-on-surface-variant cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-surface-container-high text-on-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                SHAP values show each input feature&apos;s contribution to the predicted KPI change.
              </div>
            </div>
          </div>
          <p className="font-sans text-sm text-on-surface-variant">Top feature attributions from XGBoost</p>
        </div>
        <button 
          onClick={() => setViewAsTable(!viewAsTable)}
          className="text-on-surface-variant hover:text-white transition-colors"
          title={viewAsTable ? "View as chart" : "View as table"}
          aria-label="Toggle table view"
        >
          {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 min-h-[300px]">
        {unavailable || attributions.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-outline/20 rounded-lg">
            <Info className="w-6 h-6 text-on-surface-variant mb-3" />
            <p className="font-sans text-sm text-on-surface mb-1">Attribution Unavailable</p>
            <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">
              SHAP driver attribution could not be computed because the trained model is
              missing or the explainer failed. The scenario impact itself is still valid.
            </p>
          </div>
        ) : viewAsTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Feature</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-white">
                {topFeatures.map((f, i) => (
                  <tr key={i} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                    <td className="py-2 uppercase">{f.feature}</td>
                    <td className={`py-2 text-right font-bold ${f.contribution < 0 ? 'text-error' : 'text-mtn-yellow'}`}>
                      {f.contribution > 0 ? '+' : ''}{formatNumber(f.contribution)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <BarChart 
            data={chartData} 
            horizontal={true} 
            height={300} 
            options={{
              indexAxis: 'y',
              scales: {
                x: {
                  grid: { color: ThemeTokens.colors.outline + '33' }
                },
                y: {
                  grid: { display: false },
                  ticks: {
                    font: { family: 'Space Mono, monospace', size: 10 }
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
