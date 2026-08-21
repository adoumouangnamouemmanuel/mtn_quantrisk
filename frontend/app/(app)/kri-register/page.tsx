"use client";

import React, { useEffect, useState } from 'react';
import { fetchKpis } from '@/lib/api';
import { Kpi } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatPct } from '@/lib/format';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { BookOpen, CheckCircle2, AlertTriangle, XCircle, Eye, ArrowUpDown } from 'lucide-react';
import { LiveRiskEvents } from '@/components/intelligence/LiveRiskEvents';
import { RISK_CATEGORIES, nlpCategoryToRisk } from '@/lib/riskTaxonomy';

// KPI risk category → live-intelligence NLP category (for the Live panel)
const BOOK_TO_RISK: Record<string, string> = {
  strategic:     'competitive',
  financial:     'fx_financial',
  operational:   'operational',
  technological: 'technological',
  governance:    'regulatory',
  external:      'political',
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  strategic:     <span className="w-3.5 h-3.5" />,
  financial:     <span className="w-3.5 h-3.5" />,
  operational:   <span className="w-3.5 h-3.5" />,
  technological: <span className="w-3.5 h-3.5" />,
  governance:    <span className="w-3.5 h-3.5" />,
  external:      <span className="w-3.5 h-3.5" />,
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Safe:     <CheckCircle2  className="w-3 h-3" />,
  Watch:    <Eye           className="w-3 h-3" />,
  Warning:  <AlertTriangle className="w-3 h-3" />,
  Critical: <XCircle      className="w-3 h-3" />,
};

export default function KriRegisterPage() {
  const [kpis,        setKpis]        = useState<Kpi[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeBookCat, setActiveBookCat] = useState<string>('financial');

  useEffect(() => {
    fetchKpis('2026Q1').then(data => {
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
          <p className="text-on-surface-variant mt-0.5">Comprehensive list of Key Risk Indicators — Q1 2026 reported base case</p>
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
                  { label: 'Q1 2026 Value', icon: <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-40" /> },
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
                    <tr
                      key={kpi.id}
                      className={`cursor-pointer transition-colors ${activeBookCat === kpi.category ? 'bg-mtn-yellow/05' : 'hover:bg-rowHover'}`}
                      onClick={() => setActiveBookCat(kpi.category)}
                    >
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

      {/* Live Intelligence panel — updates when you click a KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(BOOK_TO_RISK).map(([bookCat, riskCat]) => (
          <LiveRiskEvents
            key={bookCat}
            category={riskCat}
            label={`${RISK_CATEGORIES[bookCat as keyof typeof RISK_CATEGORIES]?.label ?? bookCat} KPIs`}
            limit={4}
            className={activeBookCat === bookCat ? 'ring-1 ring-mtn-yellow/30' : ''}
          />
        ))}
      </div>

      <p className="text-xs text-on-surface-variant font-mono">
        Click any KPI row to highlight its Live Intelligence panel · articles update from live scraping pipeline
      </p>
    </div>
  );
}
