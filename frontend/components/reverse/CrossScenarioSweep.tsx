"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { ThemeTokens } from '@/lib/theme';
import { PillarId } from '@/lib/types';

interface CrossScenarioSweepProps {
  result?: Array<{
    scenarioId: string;
    scenarioName: string;
    pillar: PillarId;
    requiredSeverityMultiplier: number;
    breachKpiValue: number;
  }>;
}

const PILLAR_COLORS: Record<PillarId, string> = {
  'A': '#3b82f6', // blue
  'B': '#10b981', // emerald
  'C': '#8b5cf6', // violet
  'D': '#f59e0b', // amber
  'E': '#ef4444', // red
  'F': '#ec4899', // pink
  'G': '#64748b', // slate
};

export function CrossScenarioSweep({ result }: CrossScenarioSweepProps) {
  const [activePillars, setActivePillars] = useState<Set<PillarId>>(new Set(['A','B','C','D','E','F','G']));

  const togglePillar = (p: PillarId) => {
    const newSet = new Set(activePillars);
    if (newSet.has(p)) {
      if (newSet.size > 1) newSet.delete(p);
    } else {
      newSet.add(p);
    }
    setActivePillars(newSet);
  };

  const chartData = useMemo(() => {
    if (!result) return null;
    
    const filtered = result.filter(r => activePillars.has(r.pillar));
    
    const labels = filtered.map(r => `${r.scenarioId} - ${r.scenarioName.length > 25 ? r.scenarioName.substring(0, 25) + '...' : r.scenarioName}`);
    const data = filtered.map(r => r.requiredSeverityMultiplier);
    const bgColors = filtered.map(r => {
      if (r.requiredSeverityMultiplier > 2.0) return 'transparent';
      return PILLAR_COLORS[r.pillar];
    });
    const borderColors = filtered.map(r => PILLAR_COLORS[r.pillar]);
    const borderWidths = filtered.map(r => r.requiredSeverityMultiplier > 2.0 ? 1 : 0);

    return {
      labels,
      datasets: [{
        label: 'Required Severity',
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: borderWidths,
        borderRadius: 2
      }]
    };
  }, [result, activePillars]);

  return (
    <Card className="p-6 bg-surface-container-low h-full flex flex-col">
      <h3 className="font-sans text-lg font-bold text-white mb-2">
        Ranked Breach Severity Across All 56 Scenarios
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(PILLAR_COLORS) as PillarId[]).map(p => (
          <button 
            key={p} 
            onClick={() => togglePillar(p)}
            className={`px-3 py-1 text-xs font-mono rounded-full transition-colors border ${activePillars.has(p) ? 'border-transparent text-white' : 'border-outline/50 text-on-surface-variant'}`}
            style={{ backgroundColor: activePillars.has(p) ? PILLAR_COLORS[p] : 'transparent' }}
          >
            Pillar {p}
          </button>
        ))}
      </div>

      {chartData && chartData.labels.length > 0 ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
          {/* For Chart.js, if we have many bars, we need to set a fixed height on the container inside the scrollable area */}
          <div style={{ height: Math.max(300, chartData.labels.length * 30) }}>
            <BarChart 
              data={chartData} 
              horizontal={true} 
              height="100%"
              options={{
                maintainAspectRatio: false,
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
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label: (ctx: any) => {
                        const val = ctx.raw as number;
                        if (val > 2.0) return `Severity: ${val.toFixed(2)}x (OUT OF RANGE)`;
                        return `Severity: ${val.toFixed(2)}x`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-on-surface-variant font-mono text-sm p-8 border-2 border-dashed border-outline/10 rounded">
          {result ? 'No scenarios match the selected filters.' : 'Run the solver to see cross-scenario ranking.'}
        </div>
      )}
    </Card>
  );
}
