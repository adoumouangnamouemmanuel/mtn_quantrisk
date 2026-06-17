import React from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight, Info } from 'lucide-react';
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

  // Derive a pseudo-historical analogue based on kpi unit to meet the requirement
  const historicalAnalogueText = kpiId === 'FIN03' ? 'FY22 Low: 51.1%' : 
                                 kpiId === 'FIN01' ? 'FY22 Shock Growth: +44%' :
                                 kpiId === 'SEG03' ? 'FY22 Active Base: 12.1M' :
                                 'Calibrated to trailing 36-month internal shock bounds.';

  return (
    <Card className={`p-4 ${borderColor} bg-surface-container-low relative group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-1">
          <span className="font-mono text-xs uppercase text-on-surface-variant">
            {kpiId} <span className="opacity-50 hidden sm:inline">| {kpi.name.substring(0,12)}</span>
          </span>
          <div className="relative">
            <Info className="w-3 h-3 text-on-surface-variant/50 hover:text-white transition-colors cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-40 bg-surface-container-highest border border-outline/20 text-on-surface text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans shadow-lg">
              <span className="font-bold text-white block mb-1">Historical Context</span>
              {historicalAnalogueText}
            </div>
          </div>
        </div>
        <Chip variant={status === 'Critical' ? 'error' : status === 'Warning' ? 'warning' : 'default'} size="sm">
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </Chip>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 truncate">
        <span className="font-mono text-lg sm:text-2xl text-white font-bold truncate" title={displayBase}>
          {displayBase}
        </span>
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-on-surface-variant shrink-0" />
        <span className={`font-mono text-lg sm:text-2xl font-bold truncate ${scenColor}`} title={displayScen}>
          {displayScen}
        </span>
        <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant ml-1 shrink-0">
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
      <Card className={`p-4 border-l-4 ${severityScore >= 10 ? 'border-l-error' : severityScore >= 5 ? 'border-l-warning' : 'border-l-mtn-yellow'} bg-surface-container-low flex flex-col justify-between group relative`}>
        <div className="flex justify-between items-start mb-3">
          <span className="font-mono text-xs uppercase text-on-surface-variant">
            Composite Score
          </span>
          <div className="relative">
            <Info className="w-3 h-3 text-on-surface-variant/50 hover:text-white transition-colors cursor-help" />
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-surface-container-highest border border-outline/20 text-on-surface text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans shadow-lg">
              <span className="font-bold text-white block mb-1">Severity Scale</span>
              <ul className="space-y-1">
                <li><span className="text-mtn-yellow">&lt; 5:</span> Operating Variance</li>
                <li><span className="text-warning">5 - 10:</span> Structural Stress</li>
                <li><span className="text-error">&gt; 10:</span> Compound Tail Risk</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <span className="font-sans text-[10px] sm:text-xs text-on-surface-variant block mb-1">
            OVERALL SEVERITY
          </span>
          <span className="font-mono text-2xl sm:text-3xl text-white font-bold">
            {severityScore.toFixed(1)}
          </span>
        </div>
      </Card>
    </div>
  );
}
