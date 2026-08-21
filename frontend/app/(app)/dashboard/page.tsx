"use client";

import React, { useEffect, useState } from 'react';
import { useAppState } from '@/stores/useAppState';
import { fetchKpis, fetchNewsSummary, fetchAlertSummary, fetchEconomicsRiskContext, NewsSummary, AlertSummary, EconomicsRiskContext } from '@/lib/api';
import { KpiTile } from '@/components/ui/KpiTile';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Kpi } from '@/lib/types';
import Link from 'next/link';
import { LayoutDashboard, Newspaper, Bell, AlertOctagon, AlertTriangle, Eye, TrendingUp } from 'lucide-react';
import { RISK_CATEGORY_LIST, RiskCategory } from '@/lib/riskTaxonomy';

// Icon per risk category — mirrors riskTaxonomy.ts lucide names.
import { Target, DollarSign, Activity, Cpu, Scale, Globe } from 'lucide-react';
const CATEGORY_ICON: Record<RiskCategory, React.ReactNode> = {
  strategic:     <Target      className="w-3.5 h-3.5" />,
  financial:     <DollarSign  className="w-3.5 h-3.5" />,
  operational:   <Activity    className="w-3.5 h-3.5" />,
  technological: <Cpu         className="w-3.5 h-3.5" />,
  governance:    <Scale       className="w-3.5 h-3.5" />,
  external:      <Globe       className="w-3.5 h-3.5" />,
};

const CATEGORY_COLOR: Record<RiskCategory, string> = {
  strategic:     'text-mtn-yellow',
  financial:     'text-green-400',
  operational:   'text-orange-400',
  technological: 'text-blue-400',
  governance:    'text-purple-400',
  external:      'text-cyan-400',
};

const CATEGORIES: RiskCategory[] = RISK_CATEGORY_LIST.map(c => c.id);

export default function DashboardPage() {
  const { dispatch } = useAppState();
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState<Kpi[]>([]);
  const [newsSummary, setNewsSummary] = useState<NewsSummary | null>(null);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);
  const [econCtx, setEconCtx] = useState<EconomicsRiskContext | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [data, news, alerts, econ] = await Promise.allSettled([
          fetchKpis('2026Q1'),
          fetchNewsSummary(),
          fetchAlertSummary(),
          fetchEconomicsRiskContext(),
        ]);

        if (data.status === 'fulfilled') {
          setKpis(data.value);
          const baseCase = data.value.reduce((acc, kpi) => {
            acc[kpi.id] = kpi.fy25Value;
            return acc;
          }, {} as Record<string, number>);
          dispatch({ type: 'SET_BASE_CASE', payload: baseCase });
        }
        if (news.status === 'fulfilled')   setNewsSummary(news.value);
        if (alerts.status === 'fulfilled') setAlertSummary(alerts.value);
        if (econ.status === 'fulfilled')   setEconCtx(econ.value);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  const categories = CATEGORIES;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mtn-yellow/10 border border-mtn-yellow/20 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Core Anchors</h1>
            <p className="text-on-surface-variant mt-0.5">MTN Ghana Q1 2026 performance anchors · period ended 31 March 2026</p>
          </div>
        </div>
      </div>

      {/* ── Live Intelligence strip ── */}
      {(newsSummary || alertSummary) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Articles today */}
          <Link href="/news" className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-blue-400/30 group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Articles today</p>
              <p className="text-xl font-hero font-bold text-on-surface">
                {newsSummary?.articlesToday ?? '—'}
              </p>
              {newsSummary?.topRiskCategory && (
                <p className="text-xs text-on-surface-variant truncate">Top: {newsSummary.topRiskCategory}</p>
              )}
            </div>
          </Link>

          {/* Active alerts */}
          <Link href="/alerts" className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-red-400/30 group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Active alerts</p>
              <p className="text-xl font-hero font-bold text-on-surface">
                {alertSummary?.total_active ?? '—'}
              </p>
              {alertSummary && alertSummary.total_active > 0 && (
                <div className="flex items-center gap-2 mt-0.5">
                  {alertSummary.critical > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-red-400 font-mono">
                      <AlertOctagon className="w-3 h-3" />{alertSummary.critical}
                    </span>
                  )}
                  {alertSummary.warning > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-400 font-mono">
                      <AlertTriangle className="w-3 h-3" />{alertSummary.warning}
                    </span>
                  )}
                  {alertSummary.watch > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-yellow-400 font-mono">
                      <Eye className="w-3 h-3" />{alertSummary.watch}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>

          {/* Ghana Macro tile */}
          <Link href="/economics" className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-emerald-400/30 group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Ghana Macro</p>
              <p className="text-xs text-on-surface-variant truncate mt-0.5">
                {econCtx ? econCtx.summary : 'World Bank data'}
              </p>
              {econCtx && (
                <div className="flex gap-1.5 mt-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    econCtx.inflation_risk === 'Critical' ? 'bg-red-100 text-red-700' :
                    econCtx.inflation_risk === 'Warning'  ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>CPI: {econCtx.inflation_risk}</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const categoryKpis = kpis.filter(k => k.category === category);
            if (categoryKpis.length === 0) return null;
            const meta = RISK_CATEGORY_LIST.find(c => c.id === category)!;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4 border-b border-outline/20 pb-2">
                  <span className={CATEGORY_COLOR[category]}>
                    {CATEGORY_ICON[category]}
                  </span>
                  <h2 className="text-sm font-mono text-outline uppercase tracking-widest">
                    {meta.label} Metrics
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryKpis.map(kpi => (
                    <KpiTile key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
