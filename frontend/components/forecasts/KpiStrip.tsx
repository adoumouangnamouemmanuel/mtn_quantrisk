import React from 'react';
import { Card } from '@/components/ui/Card';
import { KpiId } from '@/lib/types';
import { MOCK_KPIS } from '@/lib/mockData';
import { formatNumber, formatPct } from '@/lib/format';

interface KpiStripProps {
  activeKpiId: KpiId;
  onSelectKpi: (id: KpiId) => void;
}

const FORECAST_KPIS: KpiId[] = ['FIN01', 'FIN02', 'FIN03', 'SEG03', 'OPS04'];

export function KpiStrip({ activeKpiId, onSelectKpi }: KpiStripProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
      {FORECAST_KPIS.map(kpiId => {
        const kpi = MOCK_KPIS.find(k => k.id === kpiId);
        if (!kpi) return null;
        
        const isActive = kpiId === activeKpiId;
        const isPct = kpi.unit === '%';
        const displayVal = isPct ? formatPct(kpi.fy25Value) : formatNumber(kpi.fy25Value, 1);

        return (
          <button
            key={kpiId}
            onClick={() => onSelectKpi(kpiId)}
            className={`flex-shrink-0 w-48 text-left transition-all duration-300 focus:outline-none ${isActive ? 'scale-105' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
          >
            <Card className={`p-4 border-b-4 ${isActive ? 'border-b-mtn-yellow bg-surface-container-high' : 'border-b-transparent bg-surface-container-low'}`}>
              <div className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-1 truncate">
                {kpiId} | {kpi.name.substring(0, 15)}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="font-mono text-2xl font-bold text-white truncate">{displayVal}</span>
                <span className="font-mono text-xs text-on-surface-variant">{kpi.unit}</span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
