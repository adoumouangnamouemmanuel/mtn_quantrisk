"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PillarId } from '@/lib/types';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { Table, LayoutList } from 'lucide-react';

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
  const [viewAsTable, setViewAsTable] = useState(false);

  const togglePillar = (p: PillarId) => {
    const newSet = new Set(activePillars);
    if (newSet.has(p)) {
      if (newSet.size > 1) newSet.delete(p);
    } else {
      newSet.add(p);
    }
    setActivePillars(newSet);
  };

  const gridItems = useMemo(() => {
    if (!result) return [];
    return result.filter(r => activePillars.has(r.pillar));
  }, [result, activePillars]);

  // Helper to determine background opacity based on severity
  // Lower severity is MORE dangerous, so maybe more opaque? Or standard color.
  const getSeverityStyle = (item: typeof gridItems[0]) => {
    if (item.requiredSeverityMultiplier > 2.0) {
      return { backgroundColor: 'transparent', borderColor: PILLAR_COLORS[item.pillar], opacity: 0.3 };
    }
    // E.g., 0.5x is 100% opacity, 2.0x is 40% opacity
    const opacity = Math.max(0.4, 1 - ((item.requiredSeverityMultiplier - 0.5) / 1.5) * 0.6);
    return { 
      backgroundColor: PILLAR_COLORS[item.pillar], 
      borderColor: 'transparent',
      opacity 
    };
  };

  return (
    <Card className="p-6 bg-surface-container-low h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-sans text-lg font-bold text-white">
          Ranked Breach Severity Across All Scenarios
        </h3>
        <button 
          onClick={() => setViewAsTable(!viewAsTable)}
          className="text-on-surface-variant hover:text-white transition-colors"
          title={viewAsTable ? "View as grid" : "View as table"}
          aria-label="Toggle table view"
        >
          {viewAsTable ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
        </button>
      </div>
      
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

      {gridItems.length > 0 ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {viewAsTable ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Scenario</th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Required Severity</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-white">
                {gridItems.map((item) => (
                  <tr key={item.scenarioId} className="border-b border-outline/10 hover:bg-surface-container transition-colors">
                    <td className="py-2 flex items-center space-x-2">
                      <PillarBadge pillar={item.pillar} />
                      <span className="font-mono text-[10px] text-on-surface-variant">{item.scenarioId}</span>
                      <span>{item.scenarioName}</span>
                    </td>
                    <td className={`py-2 text-right font-bold ${item.requiredSeverityMultiplier > 2.0 ? 'text-error' : 'text-mtn-yellow'}`}>
                      {item.requiredSeverityMultiplier > 2.0 ? '>2.0x' : `${item.requiredSeverityMultiplier.toFixed(2)}x`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {gridItems.map((item) => (
                <div key={item.scenarioId} className="relative group cursor-help">
                  <div 
                    className="w-full aspect-square rounded-md border transition-transform hover:scale-110 relative overflow-hidden flex items-center justify-center"
                    style={getSeverityStyle(item)}
                  >
                    <span className="font-mono text-[8px] text-white opacity-80 z-10 font-bold mix-blend-overlay">
                      {item.scenarioId}
                    </span>
                    {item.requiredSeverityMultiplier > 2.0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono text-[10px] text-on-surface-variant/50 rotate-45">OUT</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-surface-container-highest border border-outline/20 text-on-surface p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <PillarBadge pillar={item.pillar} />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {item.scenarioId}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-white font-bold mb-2 leading-tight">
                      {item.scenarioName}
                    </p>
                    <div className="flex justify-between items-end border-t border-outline/10 pt-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">Required<br/>Severity</span>
                      <span className="font-mono text-lg font-bold text-mtn-yellow">
                        {item.requiredSeverityMultiplier > 2.0 ? '>2.0x' : `${item.requiredSeverityMultiplier.toFixed(2)}x`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-on-surface-variant font-mono text-sm p-8 border-2 border-dashed border-outline/10 rounded">
          {result ? 'No scenarios match the selected filters.' : 'Run the solver to see cross-scenario ranking.'}
        </div>
      )}
    </Card>
  );
}
