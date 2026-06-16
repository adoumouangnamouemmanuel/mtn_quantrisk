import React from 'react';

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({ 
  data, 
  color = '#FFCB00', 
  width = 100, 
  height = 30, 
  strokeWidth = 2,
  className = '' 
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    // ensure stroke doesn't get clipped at top/bottom
    const adjustedY = Math.max(strokeWidth, Math.min(height - strokeWidth, y));
    return `${x},${adjustedY}`;
  }).join(' ');

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={`overflow-visible ${className}`}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
