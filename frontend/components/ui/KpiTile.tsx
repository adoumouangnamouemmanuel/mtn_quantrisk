import React from 'react';
import { Card } from './Card';
import { Chip } from './Chip';
import { Sparkline } from './Sparkline';
import { Kpi } from '@/lib/types';
import { formatNumber, formatPct } from '@/lib/format';
import { ThemeTokens } from '@/lib/theme';
import { CheckCircle2, AlertTriangle, XCircle, Eye, DollarSign, PieChart, Cpu, Globe } from 'lucide-react';

const STATUS_ICON = {
  Safe:     <CheckCircle2 className="w-3 h-3" />,
  Watch:    <Eye          className="w-3 h-3" />,
  Warning:  <AlertTriangle className="w-3 h-3" />,
  Critical: <XCircle     className="w-3 h-3" />,
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Financial:   <DollarSign className="w-3 h-3" />,
  Segment:     <PieChart   className="w-3 h-3" />,
  Operational: <Cpu        className="w-3 h-3" />,
  External:    <Globe      className="w-3 h-3" />,
};

interface KpiTileProps {
  kpi: Kpi;
  onClick?: () => void;
}

export function KpiTile({ kpi, onClick }: KpiTileProps) {
  const isWarning = kpi.currentStatus === 'Warning';
  const isCritical = kpi.currentStatus === 'Critical';
  
  let chipVariant: 'success' | 'warning' | 'error' | 'default' = 'default';
  let sparklineColor = ThemeTokens.colors.mtnYellow;

  if (isCritical) {
    chipVariant = 'error';
    sparklineColor = ThemeTokens.colors.error;
  } else if (isWarning) {
    chipVariant = 'warning';
  } else if (kpi.currentStatus === 'Safe') {
    chipVariant = 'success';
    sparklineColor = '#10b981'; // emerald-500
  }

  const formattedValue = kpi.unit === '%' ? formatPct(kpi.fy25Value) : formatNumber(kpi.fy25Value, 1);

  return (
    <Card 
      variant={isCritical ? 'error' : 'default'}
      className={`hover:bg-rowHover transition-colors cursor-pointer ${onClick ? '' : 'pointer-events-none'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-on-surface-variant/60">
            {CATEGORY_ICON[kpi.category]}
          </div>
          <div>
            <div className="text-on-surface-variant font-mono text-xs mb-1">{kpi.id} · {kpi.category}</div>
            <div className="text-on-surface font-sans font-medium text-sm leading-tight">{kpi.name}</div>
          </div>
        </div>
        <Chip variant={chipVariant} size="sm">
          <span className="flex items-center gap-1">
            {STATUS_ICON[kpi.currentStatus]}
            {kpi.currentStatus}
          </span>
        </Chip>
      </div>

      <div className="flex items-end justify-between mt-6">
        <div>
          <div className="text-2xl font-data font-bold tracking-tight">
            {formattedValue} <span className="text-sm font-mono text-on-surface-variant">{kpi.unit}</span>
          </div>
        </div>
        
        <div className="w-20 h-8">
          <Sparkline data={kpi.trend24m} color={sparklineColor} width={80} height={32} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
