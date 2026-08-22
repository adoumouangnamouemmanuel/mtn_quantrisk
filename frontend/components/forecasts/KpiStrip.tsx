import React from 'react';
import { Card } from '@/components/ui/Card';
import type { Kpi, KpiId } from '@/lib/types';
import { formatNumber, formatPct } from '@/lib/format';

interface KpiStripProps {
  activeKpiId: KpiId;
  onSelectKpi: (id: KpiId) => void;
  kpis?: Kpi[];
}

const FORECAST_KPIS: KpiId[] = ['FIN01', 'FIN02', 'FIN03', 'SEG03', 'OPS04'];

export function KpiStrip({ activeKpiId, onSelectKpi, kpis = [] }: KpiStripProps) {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-1 custom-scrollbar">
      {FORECAST_KPIS.map(kpiId => {
        const kpi = kpis.find(k => k.id === kpiId);
        const isActive = kpiId === activeKpiId;
        const isPct = kpi?.unit === '%';
        const displayVal = kpi
          ? (isPct ? formatPct(kpi.fy25Value) : formatNumber(kpi.fy25Value, 1))
          : '—';
        const name = kpi?.name.substring(0, 14) ?? kpiId;

        return (
          <button
            key={kpiId}
            onClick={() => onSelectKpi(kpiId)}
            className={`flex-shrink-0 w-40 text-left transition-all duration-300 focus:outline-none ${isActive ? 'scale-105' : 'opacity-60 hover:scale-105 hover:opacity-100'}`}
          >
            <Card className={`p-3 border-b-2 ${isActive ? 'border-b-mtn-yellow bg-surface-container-high' : 'border-b-transparent bg-surface-container-low'}`}>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 truncate">
                {kpiId} · {name}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="font-mono text-xl font-bold text-white truncate">{displayVal}</span>
                <span className="font-mono text-[10px] text-on-surface-variant">{kpi?.unit}</span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
