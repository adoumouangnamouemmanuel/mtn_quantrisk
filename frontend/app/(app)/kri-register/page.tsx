"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { fetchKpis } from '@/lib/api';
import { Kpi } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatPct } from '@/lib/format';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { BookOpen, CheckCircle2, AlertTriangle, XCircle, Eye, ArrowUpDown, Search, Target, DollarSign, Activity, Cpu, Scale, Globe } from 'lucide-react';
import { LiveRiskEvents } from '@/components/intelligence/LiveRiskEvents';
import { RISK_CATEGORIES, type RiskCategory } from '@/lib/riskTaxonomy';
import { ThemeTokens } from '@/lib/theme';

// KPI risk category → live-intelligence NLP category (for the Live panel)
const BOOK_TO_RISK: Record<string, string> = {
  strategic:     'competitive',
  financial:     'fx_financial',
  operational:   'operational',
  technological: 'technological',
  governance:    'regulatory',
  external:      'political',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  strategic:     <Target className="w-3.5 h-3.5" />,
  financial:     <DollarSign className="w-3.5 h-3.5" />,
  operational:   <Activity className="w-3.5 h-3.5" />,
  technological: <Cpu className="w-3.5 h-3.5" />,
  governance:    <Scale className="w-3.5 h-3.5" />,
  external:      <Globe className="w-3.5 h-3.5" />,
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Safe:     <CheckCircle2  className="w-3 h-3" />,
  Watch:    <Eye           className="w-3 h-3" />,
  Warning:  <AlertTriangle className="w-3 h-3" />,
  Critical: <XCircle      className="w-3 h-3" />,
};

// Tiny SVG sparkline for 24-month trend
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <span className="text-on-surface-variant text-[10px]">—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function KriRegisterPage() {
  const [kpis,        setKpis]        = useState<Kpi[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeBookCat, setActiveBookCat] = useState<string>('financial');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKpis('2026Q1')
      .then(data => {
        setKpis(data);
        setError(null);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      if (filterCategory && kpi.category !== filterCategory) return false;
      if (filterStatus && kpi.currentStatus !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return kpi.id.toLowerCase().includes(q) || kpi.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [kpis, filterCategory, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    kpis.forEach(k => { counts[k.currentStatus] = (counts[k.currentStatus] ?? 0) + 1; });
    return counts;
  }, [kpis]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Full KRI Book</h1>
          <p className="text-on-surface-variant mt-0.5">Comprehensive list of Key Risk Indicators — Q1 2026 reported base case</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-on-surface-variant">{status}</span> <span className="text-on-surface font-bold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-mtn-yellow/40">
          <Search className="h-4 w-4 text-on-surface-variant" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search KPIs..."
            className="bg-transparent py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
        <select
          value={filterCategory ?? ''}
          onChange={e => setFilterCategory(e.target.value || null)}
          className="bg-surface-container border border-outline/30 rounded-md py-2 px-3 text-xs font-mono text-on-surface"
        >
          <option value="">All Categories</option>
          {Object.entries(RISK_CATEGORIES).map(([id, meta]) => (
            <option key={id} value={id}>{meta.label}</option>
          ))}
        </select>
        <select
          value={filterStatus ?? ''}
          onChange={e => setFilterStatus(e.target.value || null)}
          className="bg-surface-container border border-outline/30 rounded-md py-2 px-3 text-xs font-mono text-on-surface"
        >
          <option value="">All Statuses</option>
          <option value="Safe">Safe</option>
          <option value="Watch">Watch</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
        {(filterCategory || filterStatus || searchQuery) && (
          <button
            onClick={() => { setFilterCategory(null); setFilterStatus(null); setSearchQuery(''); }}
            className="text-xs font-mono text-mtn-yellow hover:underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto font-mono text-[10px] text-on-surface-variant">
          {filteredKpis.length} of {kpis.length} KPIs
        </span>
      </div>

      {/* KPI Table */}
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
                  { label: 'Trend' },
                  { label: 'Status' },
                ].map(({ label, icon }) => (
                  <th key={label} className="px-6 py-3 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                    {label}{icon}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {loading ? (
                Array.from({ length: 5 }).map((i) => (
                  <tr key={String(i)}>
                    <td className="px-6 py-4" colSpan={7}><SkeletonBlock className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : filteredKpis.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-on-surface-variant" colSpan={7}>
                    No KPIs match the current filters.
                  </td>
                </tr>
              ) : (
                filteredKpis.map((kpi) => {
                  const valStr = kpi.unit === '%' ? formatPct(kpi.fy25Value) : formatNumber(kpi.fy25Value, 1);
                  const lowerStr = kpi.lowerThreshold !== null ? (kpi.unit === '%' ? formatPct(kpi.lowerThreshold) : formatNumber(kpi.lowerThreshold, 1)) : '-';
                  const upperStr = kpi.upperThreshold !== null ? (kpi.unit === '%' ? formatPct(kpi.upperThreshold) : formatNumber(kpi.upperThreshold, 1)) : '-';
                  const catMeta = RISK_CATEGORIES[kpi.category as RiskCategory] ?? null;
                  const trendArr = kpi.trend24m ?? [];
                  const lastVal = trendArr[trendArr.length - 1] ?? 0;
                  const firstVal = trendArr[0] ?? 0;
                  const trendColor = trendArr.length > 1 && lastVal > firstVal
                    ? '#22c55e' : '#ef4444';
                  
                  return (
                    <tr
                      key={kpi.id}
                      className={`cursor-pointer transition-colors ${selectedKpi?.id === kpi.id ? 'bg-mtn-yellow/05' : 'hover:bg-rowHover'}`}
                      onClick={() => setSelectedKpi(selectedKpi?.id === kpi.id ? null : kpi)}
                    >
                      <td className="px-6 py-3 font-mono text-sm text-outline">{kpi.id}</td>
                      <td className="px-6 py-3 font-sans text-sm font-medium text-on-surface">{kpi.name}</td>
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-1.5 font-sans text-sm text-on-surface-variant">
                          {catMeta ? CATEGORY_ICONS[kpi.category] : null}
                          {kpi.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-data text-sm">
                        <span className="text-on-surface font-bold">{valStr}</span> <span className="text-on-surface-variant">{kpi.unit}</span>
                      </td>
                      <td className="px-6 py-3 font-data text-sm text-on-surface-variant">
                        {lowerStr} — {upperStr}
                      </td>
                      <td className="px-6 py-3">
                        <Sparkline data={kpi.trend24m ?? []} color={trendColor} />
                      </td>
                      <td className="px-6 py-3">
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

      {/* Selected KPI detail card */}
      {selectedKpi && (
        <Card className="border-mtn-yellow/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-mono text-on-surface">{selectedKpi.id} — {selectedKpi.name}</h3>
              <p className="text-xs text-on-surface-variant">{selectedKpi.category} · {selectedKpi.unit}</p>
            </div>
            <Chip variant={selectedKpi.currentStatus === 'Critical' ? 'error' : selectedKpi.currentStatus === 'Warning' ? 'warning' : selectedKpi.currentStatus === 'Watch' ? 'info' : 'success'} size="sm">
              {selectedKpi.currentStatus}
            </Chip>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Value</p>
              <p className="text-lg font-data font-bold text-on-surface mt-1">
                {selectedKpi.unit === '%' ? formatPct(selectedKpi.fy25Value) : formatNumber(selectedKpi.fy25Value, 1)} {selectedKpi.unit}
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Lower Threshold</p>
              <p className="text-sm font-data font-bold text-on-surface-variant mt-1">
                {selectedKpi.lowerThreshold !== null ? (selectedKpi.unit === '%' ? formatPct(selectedKpi.lowerThreshold) : formatNumber(selectedKpi.lowerThreshold, 1)) : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Upper Threshold</p>
              <p className="text-sm font-data font-bold text-on-surface-variant mt-1">
                {selectedKpi.upperThreshold !== null ? (selectedKpi.unit === '%' ? formatPct(selectedKpi.upperThreshold) : formatNumber(selectedKpi.upperThreshold, 1)) : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">24M Trend</p>
              <div className="mt-1">
                <Sparkline data={selectedKpi.trend24m ?? []} color={ThemeTokens.colors.mtnYellow} />
              </div>
            </div>
          </div>
          {selectedKpi.notes && (
            <div className="mt-3 pt-3 border-t border-outline/10">
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Notes</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{selectedKpi.notes}</p>
            </div>
          )}
        </Card>
      )}

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
        Click any KPI row to view details · Live Intelligence panels update from the scraping pipeline
      </p>
    </div>
  );
}
