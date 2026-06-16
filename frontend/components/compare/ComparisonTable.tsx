"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScenarioOutput, Kpi, ComparisonRow } from '@/lib/types';
import { formatNumber } from '@/lib/format';
import { ArrowDownRight, ArrowUpRight, ArrowRight } from 'lucide-react';

interface ComparisonTableProps {
  kpis: Kpi[];
  outputA: ScenarioOutput;
  outputB: ScenarioOutput;
}

const ANCHOR_KPIS = ['FIN01', 'FIN02', 'FIN03', 'FIN04', 'FIN05', 'SEG03', 'OPS04'];

function DeltaCell({ deltaPct }: { deltaPct: number }) {
  if (deltaPct === 0) {
    return (
      <div className="flex items-center justify-end text-on-surface-variant">
        <ArrowRight className="w-3 h-3 mr-1" />
        0.0%
      </div>
    );
  }
  
  const isPositive = deltaPct > 0;
  const colorClass = isPositive ? 'text-success' : 'text-error';
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`flex items-center justify-end ${colorClass}`}>
      <Icon className="w-3 h-3 mr-1" />
      {Math.abs(deltaPct).toFixed(1)}%
    </div>
  );
}

export function ComparisonTable({ kpis, outputA, outputB }: ComparisonTableProps) {
  const rows: ComparisonRow[] = useMemo(() => {
    return ANCHOR_KPIS.map(kpiId => {
      const kpi = kpis.find(k => k.id === kpiId);
      if (!kpi) return null;

      const resA = outputA.results.find(r => r.kpiId === kpiId);
      const resB = outputB.results.find(r => r.kpiId === kpiId);

      const deltaA = resA ? resA.deltaPct : 0;
      const deltaB = resB ? resB.deltaPct : 0;

      let worseOf: 'A' | 'B' | 'tie' = 'tie';
      // Lower is worse for these KPIs generally (revenue, margin). 
      // If a KPI like "churn" was here, higher would be worse.
      // We assume negative delta is worse for all anchor KPIs.
      if (deltaA < deltaB - 0.1) worseOf = 'A';
      else if (deltaB < deltaA - 0.1) worseOf = 'B';

      return {
        kpiId,
        baseValue: kpi.fy25Value,
        scenarioAValue: resA ? resA.scenarioValue : kpi.fy25Value,
        scenarioBValue: resB ? resB.scenarioValue : kpi.fy25Value,
        deltaA,
        deltaB,
        worseOf
      };
    }).filter((x): x is ComparisonRow => x !== null);
  }, [kpis, outputA, outputB]);

  return (
    <Card className="bg-surface-container-low overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-surface-container border-b border-outline/20">
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant sticky left-0 bg-surface-container z-10">KPI</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">BASE</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">SCENARIO A</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Δ A</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">SCENARIO B</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Δ B</th>
              <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-center">WORSE OF</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm text-white">
            {rows.map((row) => (
              <tr key={row.kpiId} className="border-b border-outline/10 hover:bg-[#2C2C2C] transition-colors group">
                <td className="p-4 sticky left-0 bg-surface-container-low group-hover:bg-[#2C2C2C] transition-colors z-10 border-r border-outline/10 md:border-none">
                  {row.kpiId}
                </td>
                <td className="p-4 text-right text-on-surface-variant">{formatNumber(row.baseValue)}</td>
                <td className="p-4 text-right">{formatNumber(row.scenarioAValue)}</td>
                <td className="p-4 text-right font-bold"><DeltaCell deltaPct={row.deltaA} /></td>
                <td className="p-4 text-right">{formatNumber(row.scenarioBValue)}</td>
                <td className="p-4 text-right font-bold"><DeltaCell deltaPct={row.deltaB} /></td>
                <td className="p-4 text-center">
                  <Chip 
                    variant={row.worseOf === 'A' ? 'error' : row.worseOf === 'B' ? 'warning' : 'default'} 
                    size="sm"
                  >
                    {row.worseOf === 'tie' ? 'TIE' : row.worseOf}
                  </Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
