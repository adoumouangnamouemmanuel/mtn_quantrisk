"use client";

import React, { useEffect, useState } from 'react';
import { fetchKpis } from '@/lib/api';
import { Kpi } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatPct } from '@/lib/format';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function KriRegisterPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKpis().then(data => {
      setKpis(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Full KRI Book</h1>
        <p className="text-on-surface-variant mt-1">Comprehensive list of Key Risk Indicators</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/20 bg-surface-container/50">
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">FY25 Value</th>
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">Thresholds (L-U)</th>
                <th className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}><SkeletonBlock className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : (
                kpis.map((kpi) => {
                  const valStr = kpi.unit === '%' ? formatPct(kpi.fy25Value) : formatNumber(kpi.fy25Value, 1);
                  const lowerStr = kpi.lowerThreshold !== null ? (kpi.unit === '%' ? formatPct(kpi.lowerThreshold) : formatNumber(kpi.lowerThreshold, 1)) : '-';
                  const upperStr = kpi.upperThreshold !== null ? (kpi.unit === '%' ? formatPct(kpi.upperThreshold) : formatNumber(kpi.upperThreshold, 1)) : '-';
                  
                  return (
                    <tr key={kpi.id} className="hover:bg-rowHover transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-outline">{kpi.id}</td>
                      <td className="px-6 py-4 font-sans text-sm font-medium text-on-surface">{kpi.name}</td>
                      <td className="px-6 py-4 font-sans text-sm text-on-surface-variant">{kpi.category}</td>
                      <td className="px-6 py-4 font-data text-sm">{valStr} {kpi.unit}</td>
                      <td className="px-6 py-4 font-data text-sm text-on-surface-variant">
                        {lowerStr} — {upperStr}
                      </td>
                      <td className="px-6 py-4">
                        <Chip variant={kpi.currentStatus === 'Critical' ? 'error' : kpi.currentStatus === 'Warning' ? 'warning' : 'success'} size="sm">
                          {kpi.currentStatus}
                        </Chip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
