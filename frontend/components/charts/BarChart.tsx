"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, destroyChart, ChartInstance } from '@/lib/chartjs';
import { commonChartOptions } from './ChartTheme';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      borderRadius?: number;
    }>;
  };
  height?: number | string;
  horizontal?: boolean;
  options?: Record<string, unknown>;
}

export function BarChart({ data, height = 300, horizontal = false, options = {} }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);

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

    return () => {
      destroyChart(chartRef.current);
    };
  }, [data, horizontal, options]);

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
