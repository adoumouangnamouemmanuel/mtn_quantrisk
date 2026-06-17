import React from 'react';
import { Card } from '@/components/ui/Card';
import { KpiId, ForecastPoint } from '@/lib/types';
import { MOCK_KPIS } from '@/lib/mockData';
import { formatNumber, formatPct } from '@/lib/format';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ForecastSidebarProps {
  kpiId: KpiId;
  forecast: ForecastPoint[];
}

export function ForecastSidebar({ kpiId, forecast }: ForecastSidebarProps) {
  const kpi = MOCK_KPIS.find(k => k.id === kpiId);
  if (!kpi || forecast.length === 0) return null;

  const isPct = kpi.unit === '%';
  const format = (val: number) => isPct ? formatPct(val) : formatNumber(val, 1);

  const currentValue = kpi.fy25Value;
  
  // Find the last point (T+90)
  const lastPoint = forecast[forecast.length - 1];
  
  if (!lastPoint) return null;

  const baselinePrediction = lastPoint.p50;
  const stressBoundDown = lastPoint.p05;
  const stressBoundUp = lastPoint.p95;

  const deltaBaseline = baselinePrediction - currentValue;
  const isBaselinePositive = deltaBaseline >= 0;

  return (
    <Card className="p-6 bg-surface-container-low border border-outline/20 space-y-8 h-full">
      <div>
        <h2 className="font-sans text-sm font-bold text-white uppercase tracking-widest mb-1">
          {kpiId} Forecast Summary
        </h2>
        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          Based on historical ARIMA modeling over 36 trailing months.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-on-surface-variant mb-2">
            <ShieldCheck className="w-4 h-4 text-mtn-yellow" />
            <span className="font-mono text-xs uppercase tracking-widest">Current Value (T-0)</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl font-bold text-white">{format(currentValue)}</span>
            <span className="font-mono text-sm text-on-surface-variant">{kpi.unit}</span>
          </div>
        </div>

        <div className="h-px bg-outline/10 w-full" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-on-surface-variant">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="font-mono text-xs uppercase tracking-widest">T+90 Baseline (p50)</span>
            </div>
            <span className={`font-mono text-xs font-bold ${isBaselinePositive ? 'text-success' : 'text-error'}`}>
              {isBaselinePositive ? '+' : ''}{format(deltaBaseline)}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl font-bold text-white">{format(baselinePrediction)}</span>
            <span className="font-mono text-sm text-on-surface-variant">{kpi.unit}</span>
          </div>
        </div>

        <div className="h-px bg-outline/10 w-full" />

        <div>
          <div className="flex items-center space-x-2 text-on-surface-variant mb-2">
            <AlertTriangle className="w-4 h-4 text-error" />
            <span className="font-mono text-xs uppercase tracking-widest">Stress Bounds (p5 - p95)</span>
          </div>
          <div className="bg-surface border border-outline/10 rounded p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-on-surface-variant">Severe Downside (p5)</span>
              <span className="font-mono text-sm font-bold text-error">{format(stressBoundDown)}</span>
            </div>
            <div className="w-full bg-outline/10 h-1.5 rounded-full overflow-hidden flex">
              {/* Visual representation of the bounds relative to current value */}
              <div className="bg-error h-full" style={{ width: '20%' }} />
              <div className="bg-mtn-yellow h-full" style={{ width: '60%' }} />
              <div className="bg-success h-full" style={{ width: '20%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-on-surface-variant">Optimistic Upside (p95)</span>
              <span className="font-mono text-sm font-bold text-success">{format(stressBoundUp)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
