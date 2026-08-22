"use client";

import { useEffect, useState, useMemo } from 'react';
import { fetchScenarios, runScenario, downloadScenarioComparisonExcel } from '@/lib/api';
import { Scenario, ScenarioOutput, ComparisonRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { GitCompare, Download, ArrowRight, ArrowDown, ArrowUp, Minus, AlertTriangle } from 'lucide-react';
import { formatNumber, formatPct } from '@/lib/format';

export default function ComparePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [resultA, setResultA] = useState<ScenarioOutput | null>(null);
  const [resultB, setResultB] = useState<ScenarioOutput | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios()
      .then((s) => {
        setScenarios(s);
        if (s[0] && s[1]) {
          setSelectedA(s[0].id);
          setSelectedB(s[1].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCompare = async () => {
    if (!selectedA || !selectedB) return;
    setRunning(true);
    setError(null);
    try {
      const [a, b] = await Promise.all([
        runScenario(selectedA, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 }),
        runScenario(selectedB, 1.0, { cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 }),
      ]);
      setResultA(a);
      setResultB(b);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run scenarios');
    } finally {
      setRunning(false);
    }
  };

  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (!resultA || !resultB) return [];
    const mapA = new Map(resultA.results.map((r) => [r.kpiId, r]));
    const mapB = new Map(resultB.results.map((r) => [r.kpiId, r]));
    const allKpis = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();

    return allKpis.map((kpiId) => {
      const a = mapA.get(kpiId);
      const b = mapB.get(kpiId);
      const baseValue = a?.baseValue ?? b?.baseValue ?? 0;
      const scenarioAValue = a?.scenarioValue ?? baseValue;
      const scenarioBValue = b?.scenarioValue ?? baseValue;
      const deltaA = a?.deltaPct ?? 0;
      const deltaB = b?.deltaPct ?? 0;
      return {
        kpiId,
        baseValue,
        scenarioAValue,
        scenarioBValue,
        deltaA,
        deltaB,
        worseOf: deltaA < deltaB ? 'A' : deltaB < deltaA ? 'B' : 'tie',
      };
    });
  }, [resultA, resultB]);

  const scenarioA = scenarios.find((s) => s.id === selectedA);
  const scenarioB = scenarios.find((s) => s.id === selectedB);

  const worseCountA = comparisonRows.filter((r) => r.worseOf === 'A').length;
  const worseCountB = comparisonRows.filter((r) => r.worseOf === 'B').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Scenario Comparison</h1>
          <p className="text-on-surface-variant mt-0.5">Side-by-side KPI impact analysis of two scenarios</p>
        </div>
      </div>

      {/* Scenario selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-mono text-on-surface-variant mb-1.5">Scenario A</label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline/20 text-on-surface text-sm focus:border-yellow-500/50 focus:outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleCompare} disabled={!selectedA || !selectedB || running}>
            {running ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Running…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> Compare
              </span>
            )}
          </Button>
        </div>

        <div>
          <label className="block text-xs font-mono text-on-surface-variant mb-1.5">Scenario B</label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline/20 text-on-surface text-sm focus:border-yellow-500/50 focus:outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Results */}
      {comparisonRows.length > 0 && (
        <>
          {/* Verdict banner */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-red-400">{worseCountA}</div>
                  <div className="text-xs text-on-surface-variant">KPIs worse in A</div>
                </div>
                <div className="text-on-surface-variant text-sm">
                  <span className="font-medium">{scenarioA?.name}</span> vs <span className="font-medium">{scenarioB?.name}</span>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-red-400">{worseCountB}</div>
                  <div className="text-xs text-on-surface-variant">KPIs worse in B</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadScenarioComparisonExcel(selectedA, selectedB).catch(console.error)}
              >
                <Download className="w-4 h-4 mr-1.5" /> Export Excel
              </Button>
            </div>
            {worseCountA !== worseCountB && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-on-surface-variant">
                  <strong className="text-on-surface">{worseCountA > worseCountB ? scenarioA?.name : scenarioB?.name}</strong> impacts more KPIs negatively — it is the more severe scenario.
                </span>
              </div>
            )}
          </Card>

          {/* Comparison table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline/10">
                    <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">KPI</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Base</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-on-surface-variant" style={{ color: '#60A5FA' }}>
                      {scenarioA?.name}
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-on-surface-variant" style={{ color: '#F472B6' }}>
                      {scenarioB?.name}
                    </th>
                    <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Worse</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.kpiId} className="border-b border-outline/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs font-medium text-on-surface">{row.kpiId}</td>
                      <td className="px-4 py-2.5 text-right text-on-surface-variant">{formatNumber(row.baseValue)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={row.deltaA < 0 ? 'text-red-400' : row.deltaA > 0 ? 'text-emerald-400' : 'text-on-surface-variant'}>
                          {formatNumber(row.scenarioAValue)}
                          <span className="ml-1 text-[10px] font-mono">
                            ({row.deltaA > 0 ? '+' : ''}{formatPct(row.deltaA)})
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={row.deltaB < 0 ? 'text-red-400' : row.deltaB > 0 ? 'text-emerald-400' : 'text-on-surface-variant'}>
                          {formatNumber(row.scenarioBValue)}
                          <span className="ml-1 text-[10px] font-mono">
                            ({row.deltaB > 0 ? '+' : ''}{formatPct(row.deltaB)})
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {row.worseOf === 'tie' ? (
                          <Minus className="w-4 h-4 text-on-surface-variant mx-auto" />
                        ) : (
                          <Chip
                            size="sm"
                            variant={row.worseOf === 'A' ? 'info' : 'warning'}
                          >
                            {row.worseOf}
                          </Chip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!resultA && !running && !loading && (
        <Card className="p-12 text-center">
          <GitCompare className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm">Select two scenarios and click Compare to see a side-by-side analysis.</p>
        </Card>
      )}
    </div>
  );
}
