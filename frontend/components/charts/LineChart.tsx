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
}

export function LineChart({ data, height = 300, options = {} }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);

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

    return () => {
      destroyChart(chartRef.current);
    };
  }, [data, options]);

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
