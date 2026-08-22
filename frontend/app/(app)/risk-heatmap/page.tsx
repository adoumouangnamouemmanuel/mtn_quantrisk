"use client";

import { useEffect, useState } from "react";
import { fetchKpis, fetchNews, fetchAlerts } from "@/lib/api";
import type { Kpi } from "@/lib/types";
import type { NewsArticle, NewsAlert } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { RISK_CATEGORIES, type RiskCategory } from "@/lib/riskTaxonomy";
import { formatNumber, formatPct } from "@/lib/format";
import {
  Grid3X3,
  AlertTriangle,
  Newspaper,
  Target,
  DollarSign,
  Activity,
  Cpu,
  Scale,
  Globe,
  ChevronRight,
  X,
} from "lucide-react";

const CATEGORY_ICONS: Record<RiskCategory, React.ReactNode> = {
  strategic: <Target className="w-5 h-5" />,
  financial: <DollarSign className="w-5 h-5" />,
  operational: <Activity className="w-5 h-5" />,
  technological: <Cpu className="w-5 h-5" />,
  governance: <Scale className="w-5 h-5" />,
  external: <Globe className="w-5 h-5" />,
};

// Map KPI category to risk taxonomy
function kpiToRiskCategory(category: string): RiskCategory {
  const map: Record<string, RiskCategory> = {
    Financial: "financial",
    Segment: "strategic",
    Operational: "operational",
    External: "external",
  };
  return map[category] ?? "operational";
}

// Map news category to risk taxonomy
function newsToRiskCategory(category: string | null): RiskCategory | null {
  if (!category) return null;
  const map: Record<string, RiskCategory> = {
    fx_financial: "financial",
    financial: "financial",
    regulatory: "governance",
    political: "governance",
    competitive: "strategic",
    operational: "operational",
    reputational: "governance",
    technological: "technological",
  };
  return map[category] ?? null;
}

interface CategoryHeatData {
  category: RiskCategory;
  kpiCount: number;
  kpiStatuses: Record<string, number>;
  newsCount: number;
  criticalAlerts: number;
  warningAlerts: number;
  avgSeverity: number;
  riskScore: number; // 0-100 composite
}

function computeRiskScore(data: CategoryHeatData): number {
  const statusWeight = (data.kpiStatuses["Critical"] ?? 0) * 30
    + (data.kpiStatuses["Warning"] ?? 0) * 15
    + (data.kpiStatuses["Watch"] ?? 0) * 5;
  const alertWeight = data.criticalAlerts * 20 + data.warningAlerts * 10;
  const severityWeight = data.avgSeverity * 5;
  const newsWeight = Math.min(data.newsCount * 2, 20);
  return Math.min(100, statusWeight + alertWeight + severityWeight + newsWeight);
}

function heatColor(score: number): string {
  if (score >= 70) return "#ef4444"; // Critical red
  if (score >= 50) return "#f97316"; // Warning orange
  if (score >= 30) return "#facc15"; // Watch yellow
  if (score >= 10) return "#22c55e"; // Safe green
  return "rgba(255,255,255,0.08)"; // Minimal
}

function heatLabel(score: number): string {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Elevated";
  if (score >= 10) return "Normal";
  return "Minimal";
}

export default function RiskHeatmapPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchKpis("2026Q1"),
      fetchNews({ limit: 100 }),
      fetchAlerts({ limit: 100 }),
    ])
      .then(([kpiData, newsData, alertData]) => {
        setKpis(kpiData);
        setNews(newsData);
        setAlerts(alertData);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Compute heat data per category
  const heatData: CategoryHeatData[] = Object.keys(RISK_CATEGORIES).map((cat) => {
    const riskCat = cat as RiskCategory;
    const catKpis = kpis.filter((k) => kpiToRiskCategory(k.category) === riskCat);
    const statuses: Record<string, number> = {};
    catKpis.forEach((k) => { statuses[k.currentStatus] = (statuses[k.currentStatus] ?? 0) + 1; });

    const catNews = news.filter((n) => newsToRiskCategory(n.category) === riskCat);
    const catAlerts = alerts.filter((a) => newsToRiskCategory(a.category) === riskCat);
    const criticalAlerts = catAlerts.filter((a) => a.tier === "Critical").length;
    const warningAlerts = catAlerts.filter((a) => a.tier === "Warning").length;
    const avgSeverity = catNews.length > 0
      ? catNews.reduce((sum, n) => sum + (n.severity ?? 0), 0) / catNews.length
      : 0;

    const data: CategoryHeatData = {
      category: riskCat,
      kpiCount: catKpis.length,
      kpiStatuses: statuses,
      newsCount: catNews.length,
      criticalAlerts,
      warningAlerts,
      avgSeverity,
      riskScore: 0,
    };
    data.riskScore = computeRiskScore(data);
    return data;
  });

  const selectedData = selectedCategory ? heatData.find((d) => d.category === selectedCategory) : null;
  const selectedKpis = selectedCategory
    ? kpis.filter((k) => kpiToRiskCategory(k.category) === selectedCategory)
    : [];
  const selectedNews = selectedCategory
    ? news.filter((n) => newsToRiskCategory(n.category) === selectedCategory).slice(0, 10)
    : [];
  const selectedAlerts = selectedCategory
    ? alerts.filter((a) => newsToRiskCategory(a.category) === selectedCategory).slice(0, 10)
    : [];

  const overallRisk = heatData.reduce((sum, d) => sum + d.riskScore, 0) / heatData.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-mtn-yellow/10 border border-mtn-yellow/20 flex items-center justify-center shrink-0">
          <Grid3X3 className="w-5 h-5 text-mtn-yellow" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Risk Heatmap</h1>
          <p className="text-on-surface-variant mt-0.5">
            At-a-glance view of all six risk categories — click to drill down
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant">Overall risk</span>
          <span
            className="font-mono text-sm font-bold px-2 py-0.5 rounded"
            style={{ background: heatColor(overallRisk) + "22", color: heatColor(overallRisk) }}
          >
            {overallRisk.toFixed(0)}%
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <>
          {/* Heatmap grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {heatData.map((data) => {
              const meta = RISK_CATEGORIES[data.category];
              const isSelected = selectedCategory === data.category;
              const color = heatColor(data.riskScore);
              return (
                <button
                  key={data.category}
                  onClick={() => setSelectedCategory(isSelected ? null : data.category)}
                  className={`rounded-xl border p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
                    isSelected ? "ring-2" : ""
                  }`}
                  style={{
                    background: isSelected ? `${color}08` : "rgba(255,255,255,0.02)",
                    borderColor: isSelected ? color : "rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div style={{ color }} className="opacity-80">
                        {CATEGORY_ICONS[data.category]}
                      </div>
                      <span className="font-sans text-sm font-semibold text-on-surface">
                        {meta.label}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isSelected ? "rotate-90" : ""}`}
                      style={{ color: "rgba(240,237,232,0.3)" }}
                    />
                  </div>

                  {/* Risk score bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-on-surface-variant">Risk score</span>
                      <span style={{ color }}>{data.riskScore.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${data.riskScore}%`, background: color }}
                      />
                    </div>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider mt-1 inline-block"
                      style={{ color }}
                    >
                      {heatLabel(data.riskScore)}
                    </span>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-mono text-[9px] text-on-surface-variant">KPIs</p>
                      <p className="font-mono text-sm font-bold text-on-surface">{data.kpiCount}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-on-surface-variant">News</p>
                      <p className="font-mono text-sm font-bold text-on-surface">{data.newsCount}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-on-surface-variant">Alerts</p>
                      <p className="font-mono text-sm font-bold" style={{ color: data.criticalAlerts > 0 ? "#ef4444" : "rgba(240,237,232,0.7)" }}>
                        {data.criticalAlerts + data.warningAlerts}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Drill-down panel */}
          {selectedCategory && selectedData && (
            <Card className="border-mtn-yellow/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div style={{ color: heatColor(selectedData.riskScore) }}>
                    {CATEGORY_ICONS[selectedCategory]}
                  </div>
                  <div>
                    <h2 className="text-lg font-sans font-bold text-on-surface">
                      {RISK_CATEGORIES[selectedCategory].label} Risk Detail
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      {RISK_CATEGORIES[selectedCategory].description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> KPIs ({selectedKpis.length})
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {selectedKpis.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No KPIs in this category</p>
                    ) : (
                      selectedKpis.map((kpi) => (
                        <div
                          key={kpi.id}
                          className="p-2.5 rounded-lg border border-outline/10 hover:bg-surface-container transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs text-on-surface font-medium">
                              {kpi.id} — {kpi.name}
                            </span>
                            <Chip
                              variant={
                                kpi.currentStatus === "Critical"
                                  ? "error"
                                  : kpi.currentStatus === "Warning"
                                    ? "warning"
                                    : kpi.currentStatus === "Watch"
                                      ? "info"
                                      : "success"
                              }
                              size="sm"
                            >
                              {kpi.currentStatus}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[10px] text-on-surface-variant">
                            <span>
                              Value:{" "}
                              <span className="text-on-surface font-bold">
                                {kpi.unit === "%"
                                  ? formatPct(kpi.fy25Value)
                                  : formatNumber(kpi.fy25Value, 1)}{" "}
                                {kpi.unit}
                              </span>
                            </span>
                            {kpi.lowerThreshold !== null && (
                              <span>
                                Range: {formatNumber(kpi.lowerThreshold, 0)}–{formatNumber(kpi.upperThreshold ?? 0, 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* News */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                    <Newspaper className="w-3 h-3" /> Recent News ({selectedNews.length})
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {selectedNews.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No recent news</p>
                    ) : (
                      selectedNews.map((article) => (
                        <a
                          key={article.id}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2.5 rounded-lg border border-outline/10 hover:bg-surface-container transition-colors"
                        >
                          <p className="text-xs font-sans text-on-surface line-clamp-2 leading-snug mb-1">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 font-mono text-[9px] text-on-surface-variant">
                            <span>{article.sourceName ?? "Unknown"}</span>
                            {article.severity != null && (
                              <span className="text-mtn-yellow">
                                sev {article.severity.toFixed(1)}
                              </span>
                            )}
                            {article.mtnRelevance != null && (
                              <span>rel {(article.mtnRelevance * 100).toFixed(0)}%</span>
                            )}
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>

                {/* Alerts */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Alerts ({selectedAlerts.length})
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {selectedAlerts.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No active alerts</p>
                    ) : (
                      selectedAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-2.5 rounded-lg border border-outline/10 hover:bg-surface-container transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Chip
                              variant={
                                alert.tier === "Critical"
                                  ? "error"
                                  : alert.tier === "Warning"
                                    ? "warning"
                                    : "info"
                              }
                              size="sm"
                            >
                              {alert.tier}
                            </Chip>
                            <span className="font-mono text-[9px] text-on-surface-variant">
                              {alert.severity.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-on-surface line-clamp-2">
                            {alert.headline}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
