import React from 'react';
import { Card } from './Card';
import { Chip } from './Chip';
import { Sparkline } from './Sparkline';
import { Kpi } from '@/lib/types';
import { formatNumber, formatPct } from '@/lib/format';
import { ThemeTokens } from '@/lib/theme';

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
        <div>
          <div className="text-on-surface-variant font-mono text-xs mb-1">{kpi.id} | {kpi.category}</div>
          <div className="text-on-surface font-sans font-medium text-sm">{kpi.name}</div>
        </div>
        <Chip variant={chipVariant} size="sm">{kpi.currentStatus}</Chip>
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
