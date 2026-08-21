'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatNumber } from '@/lib/format';
import { CheckCircle2, TrendingUp, HelpCircle, Database } from 'lucide-react';

export interface TrendPointDetail {
  period: string;
  value: number;
  unit: string;
  quality: string; // Reported | Interpolated | Estimated | Source
  index?: number;
  prevValue?: number | null;
  nextValue?: number | null;
  sourceFile?: string | null;
}

const QUALITY_META: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  Reported: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-green-400',
    desc: 'Actual reported figure from the source document.',
  },
  Interpolated: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-blue-400',
    desc: 'Linearly interpolated between two reported points.',
  },
  Estimated: {
    icon: <HelpCircle className="w-4 h-4" />,
    color: 'text-amber-400',
    desc: 'Statistical estimate — not directly reported.',
  },
  Source: {
    icon: <Database className="w-4 h-4" />,
    color: 'text-cyan-400',
    desc: 'Directly from the raw source file.',
  },
};

export function TrendDrillDown({ detail, onClose }: { detail: TrendPointDetail; onClose: () => void }) {
  const qMeta: { icon: React.ReactNode; color: string; desc: string } =
    QUALITY_META[detail.quality] ?? QUALITY_META['Source']!;
  const deltaPct = detail.prevValue != null && detail.prevValue !== 0
    ? ((detail.value - detail.prevValue) / detail.prevValue * 100)
    : null;
  const unitFmt = (v: number) =>
    detail.unit === '%' ? `${v.toFixed(1)}%` : `${formatNumber(v, 1)} ${detail.unit}`;

  return (
    <Card className="border-mtn-yellow/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={qMeta.color}>{qMeta.icon}</div>
          <div>
            <h3 className="text-sm font-mono text-on-surface">{detail.period}</h3>
            <p className="text-xs text-on-surface-variant">{detail.quality} observation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close drill-down"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Value</p>
          <p className="text-lg font-data font-bold text-on-surface mt-1">{unitFmt(detail.value)}</p>
        </div>
        {detail.prevValue != null && (
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Prev</p>
            <p className="text-sm font-data font-bold text-on-surface-variant mt-1">{unitFmt(detail.prevValue)}</p>
          </div>
        )}
        {deltaPct != null && (
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Δ</p>
            <p className={`text-sm font-data font-bold mt-1 ${deltaPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
            </p>
          </div>
        )}
        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Quality</p>
          <p className={`text-sm font-data font-bold mt-1 ${qMeta.color.split(' ')[0]}`}>{detail.quality}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-outline/10 p-3 text-xs text-on-surface-variant">
        <p className="leading-relaxed">{qMeta.desc}</p>
        {detail.sourceFile && (
          <p className="mt-2 font-mono text-[10px] text-on-surface-variant/70">Source: {detail.sourceFile}</p>
        )}
      </div>
    </Card>
  );
}
