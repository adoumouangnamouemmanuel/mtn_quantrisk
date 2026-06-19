"use client";

import React, { useEffect, useState } from 'react';
import { fetchKpis } from '@/lib/api';
import { Kpi } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatPct } from '@/lib/format';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { BookOpen, DollarSign, PieChart, Cpu, Globe, CheckCircle2, AlertTriangle, XCircle, Eye, ArrowUpDown } from 'lucide-react';

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Financial:   <DollarSign className="w-3.5 h-3.5 text-mtn-yellow" />,
  Segment:     <PieChart   className="w-3.5 h-3.5 text-blue-400"   />,
  Operational: <Cpu        className="w-3.5 h-3.5 text-purple-400" />,
  External:    <Globe      className="w-3.5 h-3.5 text-green-400"  />,
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Safe:     <CheckCircle2  className="w-3 h-3" />,
  Watch:    <Eye           className="w-3 h-3" />,
  Warning:  <AlertTriangle className="w-3 h-3" />,
  Critical: <XCircle      className="w-3 h-3" />,
};

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Full KRI Book</h1>
          <p className="text-on-surface-variant mt-0.5">Comprehensive list of Key Risk Indicators</p>
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/20 bg-surface-container/50">
                {[
                  { label: 'ID' },
                  { label: 'Name' },
                  { label: 'Category' },
                  { label: 'FY25 Value', icon: <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-40" /> },
                  { label: 'Thresholds (L–U)' },
                  { label: 'Status' },
                ].map(({ label, icon }) => (
                  <th key={label} className="px-6 py-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">
                    {label}{icon}
                  </th>
                ))}
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
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-sans text-sm text-on-surface-variant">
                          {CATEGORY_ICON[kpi.category]}
                          {kpi.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-data text-sm">{valStr} {kpi.unit}</td>
                      <td className="px-6 py-4 font-data text-sm text-on-surface-variant">
                        {lowerStr} — {upperStr}
                      </td>
                      <td className="px-6 py-4">
                        <Chip variant={kpi.currentStatus === 'Critical' ? 'error' : kpi.currentStatus === 'Warning' ? 'warning' : kpi.currentStatus === 'Watch' ? 'info' : 'success'} size="sm">
                          <span className="flex items-center gap-1">
                            {STATUS_ICON[kpi.currentStatus]}
                            {kpi.currentStatus}
                          </span>
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
