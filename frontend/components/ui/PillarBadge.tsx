import React from 'react';
import { PillarId } from '@/lib/types';

interface PillarBadgeProps {
  pillar: PillarId;
  className?: string;
}

export function PillarBadge({ pillar, className = '' }: PillarBadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded bg-surface-container text-mtn-yellow font-mono text-xs font-bold border border-outline/20 ${className}`}>
      {pillar}
    </span>
  );
}
