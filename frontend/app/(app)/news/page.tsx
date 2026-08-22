"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchNews, fetchNewsSummary, triggerScrape, NewsArticle, NewsSummary } from '@/lib/api';
import { NewsReasoningPanel } from '@/components/news/NewsReasoningPanel';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import {
  Newspaper, RefreshCw, AlertTriangle, TrendingUp, Tag,
  ChevronDown, ChevronUp, ExternalLink, Brain, Shield, Wifi,
  Globe, Activity, Eye, Search, CalendarDays, X
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

// ── Extractive summary — first 2–3 complete sentences from the body ──────────

function extractSummary(body: string): string {
  if (!body) return '';
  const sentences = body.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 30);
  return sentences.slice(0, 3).join(' ');
}

// ── Severity bar ──────────────────────────────────────────────────────────────

function SeverityBar({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  const color = value >= 8 ? '#ef4444' : value >= 6 ? '#f97316' : value >= 4 ? '#facc15' : '#22c55e';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(1)}</span>
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
  const [showFull, setShowFull] = React.useState(false);
  const cat  = article.category  ? CATEGORY_META[article.category]  : null;
  const tier = article.alertTier ? TIER_STYLE[article.alertTier]     : null;
  const summary = article.body ? extractSummary(article.body) : '';
  const bodyFull = article.body ?? '';
  const BODY_PREVIEW = 600;

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
          <div
            className={`w-1 rounded-full shrink-0 ${tier ? tier.bar : 'bg-transparent'}`}
            style={{ minHeight: '1.25rem', alignSelf: 'stretch' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className={`flex-1 text-sm font-semibold leading-snug transition-colors ${
                isExpanded ? 'text-mtn-yellow' : 'text-on-surface group-hover:text-mtn-yellow'
              } ${isExpanded ? '' : 'line-clamp-2'}`}>
                {article.title}
              </p>
              <div className="shrink-0 mt-0.5">
                {isExpanded
                  ? <ChevronUp   className="w-4 h-4 text-mtn-yellow" />
                  : <ChevronDown className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface" />}
              </div>
            </div>
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

          {/* ── Quick Summary ── */}
          {summary && (
            <div className="mt-4 rounded-lg p-4 space-y-2"
              style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid rgba(255,208,0,0.4)' }}>
              <p className="text-xs font-mono uppercase tracking-widest text-mtn-yellow/70 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Quick Summary
              </p>
              <p className="text-sm text-on-surface leading-relaxed">{summary}</p>
            </div>
          )}

          {/* ── AI Risk Analysis ── */}
          {(article.severity != null || article.mtnRelevance != null || article.impactGhsMid != null) && (
            <div className="rounded-lg border p-4 space-y-3"
              style={{ borderColor: 'rgba(255,208,0,0.15)', background: 'rgba(255,208,0,0.02)' }}>
              <p className="text-xs font-mono uppercase tracking-widest text-mtn-yellow/70">AI Risk Scores</p>
              <div className="grid grid-cols-1 gap-3">
                {article.severity != null && (
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Severity</span>
                      <span className="font-mono">/ 10</span>
                    </div>
                    <SeverityBar value={article.severity} />
                  </div>
                )}
                {article.mtnRelevance != null && (
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>MTN Relevance</span>
                      <span className="font-mono font-bold text-on-surface">{(article.mtnRelevance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full bg-blue-400 transition-all duration-500"
                        style={{ width: `${article.mtnRelevance * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              {article.impactGhsMid != null && (
                <div className="pt-1 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Min Impact',  value: fmtGhs(article.impactGhsMin) },
                    { label: 'Mid Impact',  value: fmtGhs(article.impactGhsMid) },
                    { label: 'Max Impact',  value: fmtGhs(article.impactGhsMax) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] text-on-surface-variant font-mono">{label}</p>
                      <p className="text-sm font-mono font-bold text-mtn-yellow mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Why this score? drill-down ── */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Why this score?
            </p>
            <NewsReasoningPanel articleId={article.id} />
          </div>

          {/* ── Full article body ── */}
          {bodyFull && (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Full Article</p>
              <div className="text-sm text-on-surface-variant leading-relaxed space-y-2"
                style={{ maxHeight: showFull ? 'none' : '200px', overflow: 'hidden', position: 'relative' }}>
                {bodyFull.split(/\n+/).filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {!showFull && bodyFull.length > BODY_PREVIEW && (
                  <div className="absolute bottom-0 left-0 right-0 h-12"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,10,20,0.95))' }} />
                )}
              </div>
              {bodyFull.length > BODY_PREVIEW && (
                <button
                  onClick={() => setShowFull(v => !v)}
                  className="text-xs font-mono text-mtn-yellow hover:underline mt-1"
                >
                  {showFull ? '▲ Show less' : '▼ Show full article'}
                </button>
              )}
            </div>
          )}

          {/* ── Named entities ── */}
          {article.entities && Object.values(article.entities).some((arr: string[]) => arr.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Named Entities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...article.entities.orgs.map((e: string)      => ({ label: e, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' })),
                  ...article.entities.locations.map((e: string) => ({ label: e, color: 'text-green-400 bg-green-400/10 border-green-400/20' })),
                  ...article.entities.persons.map((e: string)   => ({ label: e, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' })),
                  ...article.entities.money.map((e: string)     => ({ label: e, color: 'text-mtn-yellow bg-mtn-yellow/10 border-mtn-yellow/20' })),
                ].map(({ label, color }, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-full border text-xs font-mono ${color}`}>{label}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── View full article link ── */}
          <div className="pt-1 flex items-center gap-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 hover:bg-mtn-yellow/10 active:scale-95"
              style={{ borderColor: 'rgba(255,208,0,0.35)', color: '#FFD000' }}
            >
              <ExternalLink className="w-4 h-4" />
              Read Full Article
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

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { keyword: '', dateFrom: '', dateTo: '' };

export default function NewsPage() {
  const [articles,       setArticles]       = useState<NewsArticle[]>([]);
  const [summary,        setSummary]        = useState<NewsSummary | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [hasMore,        setHasMore]        = useState(true);
  const [scraping,       setScraping]       = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [keyword,        setKeyword]        = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [filters,        setFilters]        = useState(EMPTY_FILTERS);
  const offsetRef = React.useRef(0);

  const loadData = useCallback(async (
    category?: string,
    applied = EMPTY_FILTERS,
  ) => {
    setLoading(true);
    setError(null);
    offsetRef.current = 0;
    try {
      const [arts, sum] = await Promise.all([
        fetchNews({
          category,
          keyword: applied.keyword || undefined,
          dateFrom: applied.dateFrom || undefined,
          dateTo: applied.dateTo || undefined,
          limit: PAGE_SIZE,
          offset: 0,
        }),
        fetchNewsSummary(),
      ]);
      setArticles(arts);
      setSummary(sum);
      setHasMore(arts.length === PAGE_SIZE);
      offsetRef.current = arts.length;
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const more = await fetchNews({
        category: activeCategory ?? undefined,
        keyword: filters.keyword || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: PAGE_SIZE,
        offset: offsetRef.current,
      });
      setArticles(prev => [...prev, ...more]);
      setHasMore(more.length === PAGE_SIZE);
      offsetRef.current += more.length;
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingMore(false);
    }
  }, [activeCategory, filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  async function handleScrape() {
    setScraping(true);
    try {
      const result = await triggerScrape();
      await loadData(activeCategory ?? undefined, filters);
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
    loadData(cat ?? undefined, filters);
  }

  function applySearch() {
    const next = { keyword: keyword.trim(), dateFrom, dateTo };
    setFilters(next);
    setExpandedId(null);
    void loadData(activeCategory ?? undefined, next);
  }

  function clearSearch() {
    setKeyword('');
    setDateFrom('');
    setDateTo('');
    setFilters(EMPTY_FILTERS);
    setExpandedId(null);
    void loadData(activeCategory ?? undefined, EMPTY_FILTERS);
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

      {/* Search and publication-date filters */}
      <div className="rounded-xl border border-white/7 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Keyword or source</span>
            <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-mtn-yellow/40">
              <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
              <input
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') applySearch(); }}
                placeholder="e.g. MTN, cedi, NCA, data prices…"
                className="w-full bg-transparent py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50"
              />
            </span>
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">From date</span>
            <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-mtn-yellow/40">
              <CalendarDays className="h-4 w-4 text-on-surface-variant" />
              <input type="date" value={dateFrom} max={dateTo || undefined} onChange={event => setDateFrom(event.target.value)} className="bg-transparent py-2.5 text-xs text-on-surface [color-scheme:dark]" />
            </span>
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">To date</span>
            <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-mtn-yellow/40">
              <CalendarDays className="h-4 w-4 text-on-surface-variant" />
              <input type="date" value={dateTo} min={dateFrom || undefined} onChange={event => setDateTo(event.target.value)} className="bg-transparent py-2.5 text-xs text-on-surface [color-scheme:dark]" />
            </span>
          </label>
          <div className="flex gap-2">
            <button onClick={applySearch} className="flex items-center gap-2 rounded-lg bg-mtn-yellow px-4 py-2.5 text-xs font-bold text-black transition hover:bg-mtn-yellow-bright"><Search className="h-3.5 w-3.5" /> Search</button>
            {(filters.keyword || filters.dateFrom || filters.dateTo) && <button onClick={clearSearch} title="Clear filters" className="rounded-lg border border-white/10 px-3 py-2.5 text-on-surface-variant transition hover:text-on-surface"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        {(filters.keyword || filters.dateFrom || filters.dateTo) && (
          <p className="mt-3 text-[10px] font-mono text-on-surface-variant">
            Showing {articles.length} result{articles.length === 1 ? '' : 's'}
            {filters.keyword ? ` matching “${filters.keyword}”` : ''}
            {filters.dateFrom ? ` from ${filters.dateFrom}` : ''}
            {filters.dateTo ? ` through ${filters.dateTo}` : ''}
          </p>
        )}
      </div>

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
          <p className="text-sm">No articles found. Adjust the filters or click &quot;Scrape Now&quot; to fetch the latest news.</p>
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

          {/* Load More */}
          {articles.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-4 pb-2">
              {hasMore ? (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 disabled:opacity-50 hover:bg-white/05 active:scale-95"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMore ? 'animate-spin' : ''}`} />
                  {loadingMore ? 'Loading…' : `Load more articles`}
                </button>
              ) : (
                <p className="text-xs font-mono text-on-surface-variant">
                  All {articles.length} articles loaded
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
