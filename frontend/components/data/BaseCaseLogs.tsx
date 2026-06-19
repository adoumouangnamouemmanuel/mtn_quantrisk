'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchBaseCaseLogs } from '@/lib/api';
import type { BaseCaseLogEntry } from '@/lib/types';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export function BaseCaseLogs() {
  const [logs, setLogs] = useState<BaseCaseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBaseCaseLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetchBaseCaseLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-mtn-yellow" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Base Case Change Log</p>
        </div>
        <button
          onClick={refresh}
          className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-10 rounded-lg" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-on-surface-variant font-mono text-[10px] uppercase tracking-widest border border-dashed border-outline/20 rounded-xl">
          No changes recorded yet — upload a CSV or PDF to update the base case
        </div>
      ) : (
        <div className="rounded-xl border border-outline/20 overflow-hidden">
          <div className="grid grid-cols-[auto_80px_1fr_1fr_80px_1fr] gap-0 px-3 py-2 border-b border-outline/20 bg-surface-container">
            {['Time', 'KPI', 'Old', 'New', 'Δ%', 'Source'].map(h => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-outline/10 max-h-72 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => {
              const up = log.delta > 0;
              return (
                <div key={i} className="grid grid-cols-[auto_80px_1fr_1fr_80px_1fr] gap-0 px-3 py-2 hover:bg-surface-container transition-colors items-center">
                  <span className="font-mono text-[9px] text-on-surface-variant whitespace-nowrap pr-3">
                    {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-mono text-[9px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant w-fit">{log.kpiId}</span>
                  <span className="font-mono text-xs text-on-surface-variant">{log.oldValue.toLocaleString()}</span>
                  <span className="font-mono text-xs text-on-surface font-medium">{log.newValue.toLocaleString()}</span>
                  <div className={`flex items-center gap-0.5 font-mono text-[10px] ${up ? 'text-green-400' : 'text-error'}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {up ? '+' : ''}{log.deltaPct}%
                  </div>
                  <span className="font-mono text-[9px] text-on-surface-variant truncate">{log.source}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
