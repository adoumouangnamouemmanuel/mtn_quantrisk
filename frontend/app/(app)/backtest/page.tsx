"use client";

import { useEffect, useState } from "react";
import { fetchAllBacktests, fetchBacktest } from "@/lib/api";
import type { BacktestResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ThemeTokens } from "@/lib/theme";
import {
  LineChart,
} from "@/components/charts/LineChart";
import {
  Target, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Activity, BarChart3, Info,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number, dec = 1) {
  return v.toLocaleString(undefined, {
    maximumFractionDigits: dec,
    minimumFractionDigits: dec,
  });
}

function accuracyGrade(mape: number): { label: string; color: string; bg: string } {
  if (mape <= 3) return { label: "Excellent", color: "text-green-400", bg: "bg-green-400/10" };
  if (mape <= 7) return { label: "Good", color: "text-blue-400", bg: "bg-blue-400/10" };
  if (mape <= 12) return { label: "Fair", color: "text-mtn-yellow", bg: "bg-mtn-yellow/10" };
  return { label: "Poor", color: "text-error", bg: "bg-error/10" };
}

// ── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, subtitle, icon: Icon, color = "text-on-surface",
}: {
  label: string; value: string; subtitle?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`mt-3 text-2xl font-data font-bold ${color}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 text-[10px] font-mono text-on-surface-variant">{subtitle}</p>
      )}
    </div>
  );
}

// ── Fold Detail Row ─────────────────────────────────────────────────────────

function FoldRow({ fold }: { fold: BacktestResult["folds"][0] }) {
  const grade = accuracyGrade(fold.mape);
  return (
    <div className="rounded-lg border border-outline/15 p-4 hover:border-outline/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
            Fold {fold.foldIndex + 1}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant">
            Train: {fold.trainStart} → {fold.trainEnd}
          </span>
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${grade.color} ${grade.bg}`}>
          {grade.label}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3 text-center">
        {[
          { label: "MAPE", value: `${fold.mape.toFixed(1)}%` },
          { label: "MAE", value: fmt(fold.mae) },
          { label: "RMSE", value: fmt(fold.rmse) },
          { label: "R²", value: fold.rSquared.toFixed(3) },
          { label: "Bias", value: `${fold.biasPct > 0 ? "+" : ""}${fold.biasPct.toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] font-mono uppercase text-on-surface-variant">{label}</p>
            <p className="text-sm font-mono font-bold text-on-surface mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Actual vs Predicted mini-chart */}
      {fold.actualValues.length > 0 && (
        <div className="mt-3 pt-3 border-t border-outline/10">
          <p className="text-[9px] font-mono uppercase text-on-surface-variant mb-2">
            Test Periods
          </p>
          <div className="flex gap-2">
            {fold.testPeriods.map((period, i) => (
              <div key={i} className="flex-1 rounded-lg bg-surface-container p-2 text-center">
                <p className="text-[8px] font-mono text-on-surface-variant">{period}</p>
                <p className="text-[10px] font-mono font-bold text-mtn-yellow">
                  {fmt(fold.predictedValues[i] ?? 0)}
                </p>
                <p className="text-[9px] font-mono text-on-surface-variant">
                  actual: {fmt(fold.actualValues[i] ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function BacktestPage() {
  const [allResults, setAllResults] = useState<BacktestResult[]>([]);
  const [selectedKpi, setSelectedKpi] = useState<string>("");
  const [detail, setDetail] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllBacktests()
      .then(results => {
        setAllResults(results);
        if (results.length > 0) setSelectedKpi(results[0]!.kpiId);
        setError(null);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedKpi) return;
    let cancelled = false;
    setLoadingDetail(true);
    setDetail(null);
    fetchBacktest(selectedKpi)
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [selectedKpi]);

  // Summary stats across all KPIs
  const avgMape = allResults.length
    ? allResults.reduce((s, r) => s + (r.aggregate?.mape ?? 0), 0) / allResults.length
    : 0;
  const avgDirection = allResults.length
    ? allResults.reduce((s, r) => s + (r.aggregate?.directionAccuracy ?? 0), 0) / allResults.length
    : 0;
  const bestKpi = [...allResults].sort((a, b) => (a.aggregate?.mape ?? 999) - (b.aggregate?.mape ?? 999))[0];
  const worstKpi = [...allResults].sort((a, b) => (b.aggregate?.mape ?? 0) - (a.aggregate?.mape ?? 0))[0];

  // Chart data for actual vs predicted
  const chartData = detail?.actualVsPredicted
    ? {
        labels: detail.actualVsPredicted.map(d => d.period),
        datasets: [
          {
            label: "Actual",
            data: detail.actualVsPredicted.map(d => d.actual),
            borderColor: ThemeTokens.colors.mtnYellow,
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 3,
            pointBackgroundColor: ThemeTokens.colors.mtnYellow,
          },
          {
            label: "Predicted",
            data: detail.actualVsPredicted.map(d => d.predicted),
            borderColor: ThemeTokens.colors.secondary,
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 3,
            pointBackgroundColor: ThemeTokens.colors.secondary,
            spanGaps: true,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Forecast Backtesting</h1>
          <p className="text-on-surface-variant mt-0.5">
            Walk-forward validation — actual vs predicted accuracy across historical periods
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-28" />
            ))}
          </div>
          <SkeletonBlock className="h-64" />
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Avg MAPE"
              value={`${avgMape.toFixed(1)}%`}
              subtitle="Mean absolute % error"
              icon={BarChart3}
              color={avgMape <= 7 ? "text-green-400" : "text-mtn-yellow"}
            />
            <MetricCard
              label="Direction Accuracy"
              value={`${avgDirection.toFixed(0)}%`}
              subtitle="Correct sign of change"
              icon={TrendingUp}
              color="text-blue-400"
            />
            <MetricCard
              label="Best KPI"
              value={bestKpi?.kpiId ?? "—"}
              subtitle={bestKpi?.aggregate ? `${bestKpi.aggregate.mape.toFixed(1)}% MAPE` : ""}
              icon={CheckCircle2}
              color="text-green-400"
            />
            <MetricCard
              label="Worst KPI"
              value={worstKpi?.kpiId ?? "—"}
              subtitle={worstKpi?.aggregate ? `${worstKpi.aggregate.mape.toFixed(1)}% MAPE` : ""}
              icon={AlertTriangle}
              color="text-error"
            />
          </div>

          {/* KPI selector tabs */}
          <div className="flex flex-wrap gap-2">
            {allResults.map(r => {
              const grade = accuracyGrade(r.aggregate?.mape ?? 0);
              return (
                <button
                  key={r.kpiId}
                  onClick={() => setSelectedKpi(r.kpiId)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                    selectedKpi === r.kpiId
                      ? "border-mtn-yellow/40 bg-mtn-yellow/10 text-mtn-yellow"
                      : "border-outline/20 text-on-surface-variant hover:border-outline/40"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${grade.color.replace("text-", "bg-")}`} />
                  {r.kpiId}
                  <span className="text-[9px] opacity-60">{r.aggregate?.mape.toFixed(1)}%</span>
                </button>
              );
            })}
          </div>

          {/* Detail view */}
          {loadingDetail ? (
            <SkeletonBlock className="h-80" />
          ) : detail && !detail.error ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Chart */}
              <div className="lg:col-span-8">
                <Card className="p-5 bg-surface-container-low border border-outline/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-mono text-outline uppercase tracking-widest">
                      {detail.kpiId} · {detail.kpiName} — Actual vs Predicted
                    </h2>
                    <span className="font-mono text-[10px] px-2 py-1 rounded bg-surface-container text-on-surface-variant">
                      {detail.modelName} · {detail.totalFolds} folds
                    </span>
                  </div>
                  {chartData && (
                    <div className="h-[320px]">
                      <LineChart
                        data={chartData as unknown as React.ComponentProps<typeof LineChart>["data"]}
                        height="100%"
                        options={{
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          plugins: {
                            legend: {
                              display: true,
                              position: "top" as const,
                              labels: {
                                color: "rgba(240,237,232,0.5)",
                                font: { size: 10, family: "monospace" },
                                boxWidth: 12,
                                padding: 12,
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { color: ThemeTokens.colors.outline + "20" },
                              ticks: {
                                color: "rgba(240,237,232,0.4)",
                                font: { size: 9 },
                                maxTicksLimit: 15,
                              },
                            },
                            y: {
                              grid: { color: ThemeTokens.colors.outline + "20" },
                              ticks: {
                                color: "rgba(240,237,232,0.4)",
                                font: { size: 9 },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-[9px] font-mono text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-mtn-yellow inline-block" /> Actual reported
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-blue-400 inline-block border-dashed" /> Model prediction
                    </span>
                    <span className="ml-auto">
                      {detail.actualVsPredicted.filter(d => d.predicted !== null).length} predicted points
                    </span>
                  </div>
                </Card>
              </div>

              {/* Aggregate metrics sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-4 bg-surface-container-low border border-outline/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3.5 h-3.5 text-mtn-yellow" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Aggregate Metrics
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "MAPE", value: `${detail.aggregate.mape.toFixed(1)}%`, desc: "Mean absolute % error" },
                      { label: "MdAPE", value: `${detail.aggregate.mdape.toFixed(1)}%`, desc: "Median absolute % error" },
                      { label: "MAE", value: fmt(detail.aggregate.mae), desc: "Mean absolute error" },
                      { label: "RMSE", value: fmt(detail.aggregate.rmse), desc: "Root mean squared error" },
                      { label: "R²", value: detail.aggregate.rSquared.toFixed(4), desc: "Coefficient of determination" },
                      { label: "Bias", value: `${detail.aggregate.biasPct > 0 ? "+" : ""}${detail.aggregate.biasPct.toFixed(1)}%`, desc: "Systematic over/under-prediction" },
                      { label: "Direction Acc.", value: `${detail.aggregate.directionAccuracy?.toFixed(0) ?? "—"}%`, desc: "Correct sign of change" },
                    ].map(({ label, value, desc }) => (
                      <div key={label} className="flex justify-between items-baseline">
                        <div>
                          <p className="text-xs text-on-surface">{label}</p>
                          <p className="text-[9px] text-on-surface-variant">{desc}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-on-surface">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline/10 text-center">
                    <p className="text-[9px] font-mono text-on-surface-variant">
                      {detail.totalFolds} folds · {detail.aggregate.totalTestPoints} test points
                    </p>
                  </div>
                </Card>

                <Card className="p-4 bg-surface-container-low border border-outline/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Reading this report
                    </span>
                  </div>
                  <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                    Walk-forward validation trains the model on historical quarters,
                    predicts the next {detail.testWindowSize} quarters, then slides forward.
                    {detail.aggregate.mape <= 7
                      ? " This model shows good predictive accuracy."
                      : " Consider retraining with more data or a different model family."}
                    {" "}Direction accuracy measures whether the model correctly predicts the
                    direction of change (up or down) regardless of magnitude.
                  </p>
                </Card>
              </div>
            </div>
          ) : detail?.error ? (
            <Card className="p-6 text-center text-sm text-on-surface-variant">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-mtn-yellow" />
              {detail.error}
            </Card>
          ) : null}

          {/* Per-fold detail */}
          {detail && detail.folds.length > 0 && (
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
                Fold Details — {detail.kpiId}
              </h3>
              <div className="space-y-3">
                {detail.folds.map(fold => (
                  <FoldRow key={fold.foldIndex} fold={fold} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
