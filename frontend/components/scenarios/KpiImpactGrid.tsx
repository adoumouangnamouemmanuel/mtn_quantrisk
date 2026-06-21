import React from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight, Info } from 'lucide-react';
import { StatusLevel, KpiId } from '@/lib/types';
import { formatNumber, formatPct } from '@/lib/format';
import { MOCK_KPIS } from '@/lib/mockData';

function interpretImpact(kpiName: string, deltaPct: number, status: StatusLevel): string {
  const dir  = deltaPct < 0 ? 'falls' : 'rises';
  const abs  = Math.abs(deltaPct).toFixed(1);
  const tone = status === 'Critical' ? 'breaches critical threshold'
             : status === 'Warning'  ? 'enters warning territory'
             : status === 'Watch'    ? 'under watch — monitor closely'
             : 'remains within safe bounds';
  return `${kpiName} ${dir} ${abs}% — ${tone}.`;
}

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

  const statusStyle = {
    Critical: { border: 'border-l-4 border-l-error',        bg: 'bg-error/[0.04]',        scenColor: 'text-error',      badgeVariant: 'error'    as const },
    Warning:  { border: 'border-l-4 border-l-mtn-yellow',   bg: 'bg-mtn-yellow/[0.04]',   scenColor: 'text-mtn-yellow', badgeVariant: 'warning'  as const },
    Watch:    { border: 'border-l-4 border-l-orange-400',   bg: 'bg-orange-400/[0.04]',   scenColor: 'text-orange-400', badgeVariant: 'default'  as const },
    Safe:     { border: 'border-outline/20',                 bg: '',                        scenColor: 'text-green-400',  badgeVariant: 'default'  as const },
  }[status];

  const historicalAnalogueText = kpiId === 'FIN03' ? 'FY22 Low: 51.1%'
    : kpiId === 'FIN01' ? 'FY22 Shock Growth: +44%'
    : kpiId === 'SEG03' ? 'FY22 Active Base: 12.1M'
    : 'Calibrated to trailing 36-month internal shock bounds.';

  return (
    <Card className={`p-4 ${statusStyle.border} ${statusStyle.bg} relative group overflow-hidden`}>
      {/* KPI header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] uppercase text-on-surface-variant shrink-0">{kpiId}</span>
          <span className="text-on-surface-variant/30 text-[10px] hidden sm:inline">·</span>
          <span className="font-sans text-[10px] text-on-surface-variant truncate hidden sm:block">
            {kpi.name.substring(0, 14)}
          </span>
          <div className="relative shrink-0">
            <Info className="w-3 h-3 text-on-surface-variant/50 hover:text-white transition-colors cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 bg-surface-container-high border border-outline/20 text-on-surface text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans shadow-xl">
              <span className="font-bold text-white block mb-1">Historical Context</span>
              {historicalAnalogueText}
            </div>
          </div>
        </div>
        <Chip variant={statusStyle.badgeVariant} size="sm">
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </Chip>
      </div>

      {/* Base → Scenario values */}
      <div className="flex items-center gap-2 sm:gap-3 truncate mb-3">
        <span className="font-mono text-lg sm:text-2xl text-white font-bold truncate" title={displayBase}>
          {displayBase}
        </span>
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-on-surface-variant shrink-0" />
        <span className={`font-mono text-lg sm:text-2xl font-bold truncate ${statusStyle.scenColor}`} title={displayScen}>
          {displayScen}
        </span>
        <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant ml-1 shrink-0">
          {kpi.unit}
        </span>
      </div>

      {/* Interpretation sentence */}
      <div className="pt-2 border-t border-outline/10">
        <p className={`font-sans text-[10px] leading-snug ${statusStyle.scenColor} opacity-80`}>
          {interpretImpact(kpi.name, delta, status)}
        </p>
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
