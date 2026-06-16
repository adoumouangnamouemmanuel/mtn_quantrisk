import React from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight } from 'lucide-react';
import { StatusLevel, KpiId } from '@/lib/types';
import { formatNumber, formatPct } from '@/lib/format';
import { MOCK_KPIS } from '@/lib/mockData';

interface KpiImpactResult {
  kpiId: KpiId;
  baseValue: number;
  scenarioValue: number;
  deltaPct: number;
  status: StatusLevel;
}

interface KpiImpactGridProps {
  results: KpiImpactResult[];
  severityScore: number;
}

const ANCHOR_KPIS: KpiId[] = ['FIN01', 'FIN02', 'FIN03', 'FIN04', 'FIN05', 'SEG03', 'OPS04'];

function ImpactTile({ 
  kpiId, result 
}: { 
  kpiId: KpiId; 
  result?: KpiImpactResult; 
}) {
  const kpi = MOCK_KPIS.find(k => k.id === kpiId);
  if (!kpi) return null;

  const baseVal = kpi.fy25Value;
  const scenVal = result ? result.scenarioValue : baseVal;
  const delta = result ? result.deltaPct : 0;
  const status = result ? result.status : 'Safe';

  const isPct = kpi.unit === '%';
  const displayBase = isPct ? formatPct(baseVal) : formatNumber(baseVal, 1);
  const displayScen = isPct ? formatPct(scenVal) : formatNumber(scenVal, 1);

  let borderColor = 'border-outline/20';
  let scenColor = 'text-white';
  if (status === 'Critical') {
    borderColor = 'border-l-4 border-l-error';
    scenColor = 'text-error';
  } else if (status === 'Warning') {
    borderColor = 'border-l-4 border-l-warning';
    scenColor = 'text-warning';
  }

  return (
    <Card className={`p-4 ${borderColor} bg-surface-container-low`}>
      <div className="flex justify-between items-start mb-3">
        <span className="font-mono text-xs uppercase text-on-surface-variant">
          {kpiId} <span className="opacity-50">| {kpi.name}</span>
        </span>
        <Chip variant={status === 'Critical' ? 'error' : status === 'Warning' ? 'warning' : 'default'} size="sm">
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </Chip>
      </div>

      <div className="flex items-center space-x-3">
        <span className="font-mono text-xl md:text-2xl text-white font-bold">
          {displayBase}
        </span>
        <ArrowRight className="w-4 h-4 text-on-surface-variant" />
        <span className={`font-mono text-xl md:text-2xl font-bold ${scenColor}`}>
          {displayScen}
        </span>
        <span className="font-mono text-xs text-on-surface-variant ml-1">
          {kpi.unit}
        </span>
      </div>
    </Card>
  );
}

export function KpiImpactGrid({ results, severityScore }: KpiImpactGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {ANCHOR_KPIS.map(id => (
        <ImpactTile key={id} kpiId={id} result={results.find(r => r.kpiId === id)} />
      ))}
      
      {/* 8th Tile: OVERALL SEVERITY */}
      <Card className={`p-4 border-l-4 ${severityScore > 10 ? 'border-l-error' : severityScore > 5 ? 'border-l-warning' : 'border-l-mtn-yellow'} bg-surface-container-low flex flex-col justify-between`}>
        <span className="font-mono text-xs uppercase text-on-surface-variant mb-3">
          Composite Score
        </span>
        <div>
          <span className="font-sans text-xs text-on-surface-variant block mb-1">
            OVERALL SEVERITY
          </span>
          <span className="font-mono text-3xl text-white font-bold">
            {severityScore.toFixed(1)}
          </span>
        </div>
      </Card>
    </div>
  );
}
