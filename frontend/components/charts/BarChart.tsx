"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, destroyChart, ChartInstance } from '@/lib/chartjs';
import { commonChartOptions } from './ChartTheme';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: Array<number | [number, number]>;
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number | number[];
      borderRadius?: number;
    }>;
  };
  height?: number | string;
  horizontal?: boolean;
  options?: Record<string, unknown>;
  /** Called with the data index of the clicked bar (drill-down support). */
  onElementClick?: (index: number) => void;
}

export function BarChart({ data, height = 300, horizontal = false, options = {}, onElementClick }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const onClickRef = useRef(onElementClick);
  onClickRef.current = onElementClick;

  useEffect(() => {
    if (!canvasRef.current) return;

    const mergedOptions = {
      ...commonChartOptions,
      indexAxis: horizontal ? 'y' : 'x',
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

    chartRef.current = createChart(canvasRef.current, 'bar', {
      type: 'bar', // For Chart.js v3+, horizontal bar is just type 'bar' + indexAxis: 'y'
      data,
      options: mergedOptions,
    });

    // Resolve the nearest bar index on click → drill-down.
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
  }, [data, horizontal, options]);

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
