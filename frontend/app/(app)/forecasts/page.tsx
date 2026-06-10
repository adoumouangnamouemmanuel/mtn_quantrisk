"use client";

import React, { useEffect, useState } from 'react';
import { fetchForecast } from '@/lib/api';
import { ForecastPoint } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { ThemeTokens } from '@/lib/theme';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function ForecastsPage() {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast('FIN01', 90).then(data => {
      setForecast(data);
      setLoading(false);
    });
  }, []);

  const chartData = {
    labels: forecast.map(f => f.date),
    datasets: [
      {
        label: 'Historical',
        data: forecast.map(f => f.isHistorical ? f.median : null),
        borderColor: ThemeTokens.colors.onSurfaceVariant,
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Forecast (P50)',
        data: forecast.map(f => !f.isHistorical ? f.p50 : null),
        borderColor: ThemeTokens.colors.mtnYellow,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: 'Confidence Interval',
        data: forecast.map(f => !f.isHistorical ? f.p95 : null),
        backgroundColor: ThemeTokens.colors.mtnYellow + '33', // 20% opacity
        borderColor: 'transparent',
        fill: 1, // fill to previous dataset
        tension: 0.1,
      },
      {
        label: 'Lower Bound',
        data: forecast.map(f => !f.isHistorical ? f.p05 : null),
        borderColor: 'transparent',
        tension: 0.1,
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Predictive Forecasts</h1>
        <p className="text-on-surface-variant mt-1">90-day forward-looking estimates based on current momentum</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <h2 className="text-sm font-mono text-outline uppercase tracking-widest mb-4">FIN01 - Service Revenue (GHSm)</h2>
        <div className="flex-1">
          {loading ? (
            <SkeletonBlock className="h-full w-full" />
          ) : (
            <LineChart data={chartData as unknown as React.ComponentProps<typeof LineChart>['data']} height="100%" />
          )}
        </div>
      </Card>
    </div>
  );
}
