"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReverseStressInput, ReverseOperator, KpiId, Kpi } from '@/lib/types';
import { fetchKpis } from '@/lib/api';
import { Target } from 'lucide-react';

interface TargetBuilderCardProps {
  onSolve: (input: ReverseStressInput) => void;
  isSolving: boolean;
}

const ANCHOR_KPI_IDS: KpiId[] = ['FIN01', 'FIN02', 'FIN03', 'FIN04', 'FIN05', 'SEG03', 'OPS04'];

export function TargetBuilderCard({ onSolve, isSolving }: TargetBuilderCardProps) {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [kpiId, setKpiId] = useState<KpiId>('FIN01');
  const [operator, setOperator] = useState<ReverseOperator>('dropsBy');
  const [threshold, setThreshold] = useState<number>(10);

  useEffect(() => {
    fetchKpis().then(all => setKpis(all.filter(k => ANCHOR_KPI_IDS.includes(k.id))));
  }, []);

  const activeKpi = kpis.find(k => k.id === kpiId);
  const unit = operator === 'dropsBy' || operator === 'risesAbove' ? '%' : activeKpi?.unit ?? '';

  return (
    <Card className="p-6 bg-surface-container-low border border-mtn-yellow/20">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-mtn-yellow" />
        <h3 className="font-sans text-sm font-bold text-mtn-yellow uppercase tracking-widest">
          What outcome would be unacceptable?
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* KPI Dropdown */}
        <div className="w-full md:w-auto relative">
          <select
            value={kpiId}
            onChange={e => setKpiId(e.target.value as KpiId)}
            className="w-full appearance-none bg-surface border border-outline/20 text-white font-mono text-sm py-3 pl-4 pr-10 rounded focus:border-mtn-yellow focus:outline-none transition-colors"
          >
            {ANCHOR_KPI_IDS.map(id => {
              const kpi = kpis.find(k => k.id === id);
              return (
                <option key={id} value={id}>
                  {id}{kpi ? ` — ${kpi.name}` : ''}
                </option>
              );
            })}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-on-surface-variant">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Operator Dropdown */}
        <div className="w-full md:w-auto relative shrink-0">
          <select
            value={operator}
            onChange={e => setOperator(e.target.value as ReverseOperator)}
            className="w-full appearance-none bg-surface border border-outline/20 text-on-surface font-sans text-sm py-3 pl-4 pr-10 rounded focus:border-mtn-yellow focus:outline-none transition-colors"
          >
            <option value="lt">{"<"} (less than)</option>
            <option value="gt">{">"} (greater than)</option>
            <option value="dropsBy">drops by</option>
            <option value="risesAbove">rises above</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-on-surface-variant">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Threshold Input */}
        <div className="w-full md:w-32 relative shrink-0">
          <input
            type="number"
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value) || 0)}
            className="w-full bg-surface border border-outline/20 text-white font-mono text-xl font-bold py-2 pl-4 pr-12 rounded focus:border-mtn-yellow focus:outline-none transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant font-mono text-xs">
            {unit}
          </div>
        </div>

        {/* Solve Button */}
        <div className="w-full md:w-auto ml-auto">
          <Button
            variant="primary"
            onClick={() => onSolve({ kpiId, operator, threshold })}
            disabled={isSolving}
            fullWidth
            className="py-3 px-8 font-mono tracking-widest text-sm uppercase relative overflow-hidden"
          >
            {isSolving ? 'SOLVING...' : 'SOLVE'}
            {isSolving && (
              <div className="absolute bottom-0 left-0 h-1 bg-on-surface w-full">
                <div className="h-full bg-mtn-yellow animate-pulse" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {activeKpi && (
        <p className="mt-3 text-xs font-mono text-on-surface-variant">
          Base case: <span className="text-white">{activeKpi.fy25Value.toLocaleString()} {activeKpi.unit}</span>
          {' '}| Thresholds: <span className="text-warning">{activeKpi.lowerThreshold?.toLocaleString()}</span>
          {' '}— <span className="text-success">{activeKpi.upperThreshold?.toLocaleString()}</span>
        </p>
      )}
    </Card>
  );
}
