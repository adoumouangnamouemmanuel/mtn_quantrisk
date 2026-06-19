"use client";

import React, { useEffect } from 'react';
import { useAppState } from '@/stores/useAppState';
import { fetchKpis } from '@/lib/api';
import { KpiTile } from '@/components/ui/KpiTile';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Kpi } from '@/lib/types';
import { LayoutDashboard, DollarSign, PieChart, Cpu, Globe } from 'lucide-react';

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  Financial:   { icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-mtn-yellow' },
  Segment:     { icon: <PieChart   className="w-3.5 h-3.5" />, color: 'text-blue-400'   },
  Operational: { icon: <Cpu        className="w-3.5 h-3.5" />, color: 'text-purple-400' },
  External:    { icon: <Globe      className="w-3.5 h-3.5" />, color: 'text-green-400'  },
};

export default function DashboardPage() {
  const { dispatch } = useAppState();
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState<Kpi[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchKpis();
        setKpis(data);
        
        // Update base case in store
        const baseCase = data.reduce((acc, kpi) => {
          acc[kpi.id] = kpi.fy25Value;
          return acc;
        }, {} as Record<string, number>);
        
        dispatch({ type: 'SET_BASE_CASE', payload: baseCase });
      } catch (error) {
        console.error("Failed to fetch KPIs", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  const categories = ['Financial', 'Segment', 'Operational', 'External'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mtn-yellow/10 border border-mtn-yellow/20 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Core Anchors</h1>
            <p className="text-on-surface-variant mt-0.5">Live monitoring of 14 foundational KPIs (FY25 Base Case)</p>
          </div>
        </div>
      </div>

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
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4 border-b border-outline/20 pb-2">
                  <span className={CATEGORY_META[category]?.color ?? 'text-on-surface-variant'}>
                    {CATEGORY_META[category]?.icon}
                  </span>
                  <h2 className="text-sm font-mono text-outline uppercase tracking-widest">
                    {category} Metrics
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
