"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchNews, fetchNewsSummary, triggerScrape, NewsArticle, NewsSummary } from '@/lib/api';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import {
  Newspaper, RefreshCw, AlertTriangle, TrendingUp, Tag,
  ChevronDown, ChevronUp, ExternalLink, Brain, Shield, Wifi,
  Globe, Activity, Eye
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  regulatory:    { label: 'Regulatory',    color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: <Shield    className="w-3.5 h-3.5" /> },
  fx_financial:  { label: 'FX / Financial',color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  competitive:   { label: 'Competitive',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   icon: <Activity  className="w-3.5 h-3.5" /> },
  operational:   { label: 'Operational',   color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20',icon: <Wifi      className="w-3.5 h-3.5" /> },
  political:     { label: 'Political',     color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',    icon: <Globe     className="w-3.5 h-3.5" /> },
  reputational:  { label: 'Reputational',  color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20',  icon: <Eye       className="w-3.5 h-3.5" /> },
};

const TIER_STYLE: Record<string, { bar: string; label: string }> = {
  Critical: { bar: 'bg-red-500',    label: 'text-red-400' },
  Warning:  { bar: 'bg-orange-400', label: 'text-orange-400' },
  Watch:    { bar: 'bg-yellow-400', label: 'text-yellow-400' },
};

const SENTIMENT_STYLE: Record<string, string> = {
  negative: 'text-red-400 bg-red-400/10',
  neutral:  'text-slate-400 bg-slate-400/10',
  positive: 'text-green-400 bg-green-400/10',
};

const CATEGORIES = ['regulatory', 'fx_financial', 'competitive', 'operational', 'political', 'reputational'];

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtGhs(v: number | null): string {
  if (v == null) return '—';
  return `GHS ${v.toFixed(1)}m`;
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: NewsSummary }) {
  const catMeta = summary.topRiskCategory ? CATEGORY_META[summary.topRiskCategory] : null;
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Articles Today',    value: summary.articlesToday,  sub: 'scraped in last 24h' },
        { label: 'Total Articles',    value: summary.totalArticles,  sub: 'in database' },
        { label: 'Top Risk Category', value: catMeta?.label ?? summary.topRiskCategory ?? '—', sub: 'by article count' },
      ].map(({ label, value, sub }) => (
        <div key={label} className="rounded-xl border p-4"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
          <p className="text-2xl font-hero font-bold text-on-surface">{value}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Article card with inline expansion ───────────────────────────────────────

function ArticleCard({
  article,
  isExpanded,
  onToggle,
}: {
  article: NewsArticle;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cat  = article.category  ? CATEGORY_META[article.category]  : null;
  const tier = article.alertTier ? TIER_STYLE[article.alertTier]     : null;

  return (
    <div
      className="rounded-xl border transition-all duration-200 overflow-hidden"
      style={{
        background:  isExpanded ? 'rgba(255,208,0,0.025)' : 'rgba(255,255,255,0.02)',
        borderColor: isExpanded ? 'rgba(255,208,0,0.25)'  : 'rgba(255,255,255,0.07)',
        boxShadow:   isExpanded ? '0 4px 24px rgba(255,208,0,0.04)' : 'none',
      }}
    >
      {/* ── Clickable header ── */}
      <button onClick={onToggle} className="w-full text-left p-4 group">
        <div className="flex items-start gap-3">
          {/* Tier stripe */}
          <div
            className={`w-1 rounded-full shrink-0 ${tier ? tier.bar : 'bg-transparent'}`}
            style={{ minHeight: '1.25rem', alignSelf: 'stretch' }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p
                className={`flex-1 text-sm font-semibold leading-snug transition-colors ${
                  isExpanded
                    ? 'text-mtn-yellow'
                    : 'text-on-surface group-hover:text-mtn-yellow'
                } ${isExpanded ? '' : 'line-clamp-2'}`}
              >
                {article.title}
              </p>
              <div className="shrink-0 mt-0.5 transition-colors">
                {isExpanded
                  ? <ChevronUp   className="w-4 h-4 text-mtn-yellow" />
                  : <ChevronDown className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface" />}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-on-surface-variant">
              <span className="font-medium">{article.sourceName ?? 'Unknown source'}</span>
              <span>·</span>
              <span>{fmtDate(article.publishedAt)}</span>
              {cat && (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono font-medium ${cat.color} ${cat.bg}`}>
                  {cat.icon} {cat.label}
                </span>
              )}
              {article.alertTier && (
                <span className={`px-2 py-0.5 rounded-full font-mono font-bold border border-current ${tier?.label ?? ''}`}>
                  {article.alertTier}
                </span>
              )}
              {article.sentiment && (
                <span className={`px-2 py-0.5 rounded-full font-mono ${SENTIMENT_STYLE[article.sentiment] ?? ''}`}>
                  {article.sentiment}
                </span>
              )}
              {article.impactGhsMid != null && (
                <span className="font-mono text-mtn-yellow">~{fmtGhs(article.impactGhsMid)} impact</span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'rgba(255,208,0,0.1)' }}>

          {/* AI Risk Analysis */}
          {(article.severity != null || article.mtnRelevance != null || article.impactGhsMid != null) && (
            <div
              className="mt-4 rounded-lg border p-3.5 space-y-3"
              style={{ borderColor: 'rgba(255,208,0,0.15)', background: 'rgba(255,208,0,0.03)' }}
            >
              <p className="text-xs font-mono uppercase tracking-widest text-mtn-yellow/70 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> AI Risk Analysis
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Severity',      value: article.severity     != null ? `${article.severity.toFixed(1)} / 10` : '—' },
                  { label: 'MTN Relevance', value: article.mtnRelevance != null ? `${(article.mtnRelevance * 100).toFixed(0)}%` : '—' },
                  { label: 'Impact (mid)',  value: fmtGhs(article.impactGhsMid) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                    <p className="text-sm font-mono font-bold text-on-surface mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {article.impactGhsMid != null && (
                <p className="text-xs text-on-surface-variant font-mono">
                  Range: {fmtGhs(article.impactGhsMin)} – {fmtGhs(article.impactGhsMax)}
                </p>
              )}
            </div>
          )}

          {/* Article body excerpt */}
          {article.body && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
                Article Excerpt
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {article.body.slice(0, 500)}{article.body.length > 500 ? '…' : ''}
              </p>
            </div>
          )}

          {/* Named entities */}
          {article.entities && Object.values(article.entities).some(arr => arr.length > 0) && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Named Entities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...article.entities.orgs.map(e      => ({ label: e, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' })),
                  ...article.entities.locations.map(e => ({ label: e, color: 'text-green-400 bg-green-400/10 border-green-400/20' })),
                  ...article.entities.persons.map(e   => ({ label: e, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' })),
                  ...article.entities.money.map(e     => ({ label: e, color: 'text-mtn-yellow bg-mtn-yellow/10 border-mtn-yellow/20' })),
                ].map(({ label, color }, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-full border text-xs font-mono ${color}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View More → actual article URL */}
          <div className="pt-1 flex items-center gap-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 hover:bg-mtn-yellow/10 active:scale-95"
              style={{ borderColor: 'rgba(255,208,0,0.35)', color: '#FFD000' }}
            >
              <ExternalLink className="w-4 h-4" />
              View More
            </a>
            <span className="text-xs text-on-surface-variant font-mono">
              Opens {article.sourceName ?? 'source'} in new tab
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [articles,       setArticles]       = useState<NewsArticle[]>([]);
  const [summary,        setSummary]        = useState<NewsSummary | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [scraping,       setScraping]       = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);

  const loadData = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [arts, sum] = await Promise.all([
        fetchNews({ category: category ?? undefined, limit: 50 }),
        fetchNewsSummary(),
      ]);
      setArticles(arts);
      setSummary(sum);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleScrape() {
    setScraping(true);
    try {
      const result = await triggerScrape();
      await loadData(activeCategory ?? undefined);
      alert(`Scrape complete — ${result.newArticles} new articles ingested.`);
    } catch (e) {
      alert(`Scrape failed: ${e}`);
    } finally {
      setScraping(false);
    }
  }

  function handleCategoryFilter(cat: string | null) {
    setActiveCategory(cat);
    setExpandedId(null);
    loadData(cat ?? undefined);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">News Feed</h1>
            <p className="text-on-surface-variant mt-0.5">
              Live-scraped Ghanaian news classified for MTN risk · click any article to expand
            </p>
          </div>
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 disabled:opacity-50"
          style={{ background: 'rgba(255,208,0,0.08)', borderColor: 'rgba(255,208,0,0.2)', color: '#FFD000' }}
        >
          <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
          {scraping ? 'Scraping…' : 'Scrape Now'}
        </button>
      </div>

      {/* Summary bar */}
      {summary && <SummaryBar summary={summary} />}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
            activeCategory == null
              ? 'bg-mtn-yellow/15 border-mtn-yellow/30 text-mtn-yellow'
              : 'border-white/10 text-on-surface-variant hover:border-white/20'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat]!;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                isActive ? `${meta.bg} ${meta.color}` : 'border-white/10 text-on-surface-variant hover:border-white/20'
              }`}
            >
              {meta.icon} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-400/20 bg-red-400/05 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
          <Newspaper className="w-10 h-10 opacity-30" />
          <p className="text-sm">No articles yet. Click "Scrape Now" to fetch the latest news.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(a => (
            <ArticleCard
              key={a.id}
              article={a}
              isExpanded={expandedId === a.id}
              onToggle={() => setExpandedId(prev => prev === a.id ? null : a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
