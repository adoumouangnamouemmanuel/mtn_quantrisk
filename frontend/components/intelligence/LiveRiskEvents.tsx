"use client";

/**
 * LiveRiskEvents — reusable strip showing recent scraped articles/alerts
 * for a given risk category (or all categories if omitted).
 * Used on KRI Register, Quarterly Trends, and Monthly Trends pages.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchNews, fetchAlertSummary, type NewsArticle } from '@/lib/api';
import {
  Zap, ExternalLink, AlertTriangle, TrendingUp,
  Shield, Activity, Wifi, Globe, Eye, ChevronRight,
} from 'lucide-react';

// ── Category meta ─────────────────────────────────────────────────────────────

export const RISK_CAT_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  regulatory:   { label: 'Regulatory',    color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <Shield    className="w-3.5 h-3.5" /> },
  fx_financial: { label: 'FX / Financial',color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  competitive:  { label: 'Competitive',   color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: <Activity  className="w-3.5 h-3.5" /> },
  operational:  { label: 'Operational',   color: 'text-purple-400', bg: 'bg-purple-400/10', icon: <Wifi      className="w-3.5 h-3.5" /> },
  political:    { label: 'Political',     color: 'text-red-400',    bg: 'bg-red-400/10',    icon: <Globe     className="w-3.5 h-3.5" /> },
  reputational: { label: 'Reputational',  color: 'text-pink-400',   bg: 'bg-pink-400/10',   icon: <Eye       className="w-3.5 h-3.5" /> },
};

const TIER_STYLE: Record<string, { bar: string; text: string }> = {
  Critical: { bar: 'bg-red-500',    text: 'text-red-400' },
  Warning:  { bar: 'bg-orange-400', text: 'text-orange-400' },
  Watch:    { bar: 'bg-yellow-400', text: 'text-yellow-400' },
};

function fmtAge(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  return `${m}m ago`;
}

function fmtGhs(v: number | null): string {
  if (v == null) return '';
  return `GHS ${v.toFixed(1)}m`;
}

// ── Article row ───────────────────────────────────────────────────────────────

function ArticleRow({ article }: { article: NewsArticle }) {
  const cat  = article.category  ? RISK_CAT_META[article.category]  : null;
  const tier = article.alertTier ? TIER_STYLE[article.alertTier]    : null;
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border transition-all group hover:border-white/15 hover:bg-white/02"
      style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Tier stripe */}
      <div
        className={`w-0.5 rounded-full shrink-0 mt-0.5 ${tier ? tier.bar : 'bg-white/10'}`}
        style={{ minHeight: '1rem', alignSelf: 'stretch' }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-mtn-yellow transition-colors">
          {article.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-on-surface-variant font-mono">
          <span className="font-semibold">{article.sourceName ?? '—'}</span>
          {cat && (
            <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
              {cat.icon} {cat.label}
            </span>
          )}
          {article.alertTier && (
            <span className={`font-bold ${tier?.text ?? ''}`}>{article.alertTier}</span>
          )}
          {article.impactGhsMid != null && (
            <span className="text-mtn-yellow">{fmtGhs(article.impactGhsMid)}</span>
          )}
          <span className="ml-auto">{fmtAge(article.scrapedAt)}</span>
        </div>
      </div>

      <ExternalLink className="w-3 h-3 shrink-0 text-on-surface-variant opacity-0 group-hover:opacity-60 mt-0.5" />
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface LiveRiskEventsProps {
  /** Filter to a specific risk category, or undefined for all */
  category?: string;
  /** Label shown in the header (e.g. "FX / Financial", "All") */
  label?: string;
  limit?: number;
  className?: string;
}

export function LiveRiskEvents({ category, label, limit = 5, className = '' }: LiveRiskEventsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNews({ category, limit })
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, limit]);

  const cat = category ? RISK_CAT_META[category] : null;
  const displayLabel = label ?? cat?.label ?? 'All Categories';

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${className}`}
      style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-mtn-yellow" />
          <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
            Live Intelligence
          </span>
          {cat && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${cat.color} ${cat.bg}`}>
              {cat.icon} {displayLabel}
            </span>
          )}
        </div>
        <Link
          href={category ? `/news?category=${category}` : '/news'}
          className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant hover:text-mtn-yellow transition-colors"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-xs text-on-surface-variant font-mono">
          <AlertTriangle className="w-3.5 h-3.5 opacity-40" />
          No recent articles for this category
        </div>
      ) : (
        <div className="space-y-1.5">
          {articles.map(a => <ArticleRow key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
