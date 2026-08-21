"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, destroyChart, ChartInstance } from '@/lib/chartjs';
import { commonChartOptions } from './ChartTheme';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
      borderDash?: number[];
    }>;
  };
  height?: number | string;
  options?: Record<string, unknown>; // We allow merging custom options
  /** Called with the data index of the clicked point (drill-down support). */
  onElementClick?: (index: number) => void;
}

export function LineChart({ data, height = 300, options = {}, onElementClick }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const onClickRef = useRef(onElementClick);
  onClickRef.current = onElementClick;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Merge options
    const mergedOptions = {
      ...commonChartOptions,
      ...options,
      plugins: {
        ...commonChartOptions.plugins,
        ...(options.plugins || {})
      },
      scales: {
        ...commonChartOptions.scales,
        ...(options.scales || {})
      }
    };

    chartRef.current = createChart(canvasRef.current, 'line', {
      type: 'line',
      data,
      options: mergedOptions,
    });

    // Resolve the nearest point index on click → drill-down.
    const canvas = canvasRef.current;
    function handleClick(ev: MouseEvent) {
      const chart = chartRef.current as unknown as { getElementsAtEventForMode: (e: MouseEvent, mode: string, opts: Record<string, unknown>, useFinalPosition: boolean) => Array<{ index: number }> } | null;
      if (!chart || typeof chart.getElementsAtEventForMode !== 'function') return;
      const els = chart.getElementsAtEventForMode(ev, 'nearest', { intersect: true }, true);
      const first = els[0];
      if (first && first.index !== undefined) {
        onClickRef.current?.(first.index);
      }
    }
    canvas.addEventListener('click', handleClick);

    return () => {
      destroyChart(chartRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [data, options]);

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
