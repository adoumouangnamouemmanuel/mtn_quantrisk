"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchIntelligenceSummary,
  type IntelligenceSummary,
  type IntelligenceSection,
  type IntelligenceTopArticle,
} from '@/lib/api';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import {
  Brain, RefreshCw, AlertTriangle, Shield, TrendingUp, Activity,
  Wifi, Globe, Eye, ExternalLink, CheckCircle2, Clock, Zap,
  ChevronRight, Newspaper,
} from 'lucide-react';

// ── Meta ─────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { color: string; bg: string; border: string; accentRgb: string; icon: React.ReactNode }> = {
  regulatory:   { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', accentRgb: '251,146,60',  icon: <Shield    className="w-4 h-4" /> },
  fx_financial: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', accentRgb: '250,204,21',  icon: <TrendingUp className="w-4 h-4" /> },
  competitive:  { color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   accentRgb: '96,165,250',  icon: <Activity  className="w-4 h-4" /> },
  operational:  { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', accentRgb: '192,132,252', icon: <Wifi      className="w-4 h-4" /> },
  political:    { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    accentRgb: '248,113,113', icon: <Globe     className="w-4 h-4" /> },
  reputational: { color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20',   accentRgb: '244,114,182', icon: <Eye       className="w-4 h-4" /> },
};

const TIER_STYLE: Record<string, { bar: string; badge: string }> = {
  Critical: { bar: 'bg-red-500',    badge: 'text-red-400 border-red-400/30 bg-red-400/10' },
  Warning:  { bar: 'bg-orange-400', badge: 'text-orange-400 border-orange-400/30 bg-orange-400/10' },
  Watch:    { bar: 'bg-yellow-400', badge: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
};

const RISK_BANNER: Record<string, { glow: string; border: string; badge: string; dot: string }> = {
  Critical: {
    glow:   'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    badge:  'bg-red-500/15 text-red-400 border-red-500/30',
    dot:    'bg-red-500',
  },
  Elevated: {
    glow:   'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    badge:  'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot:    'bg-orange-400',
  },
  Moderate: {
    glow:   'rgba(250,204,21,0.06)',
    border: 'rgba(250,204,21,0.2)',
    badge:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    dot:    'bg-yellow-400',
  },
  Normal: {
    glow:   'rgba(34,197,94,0.04)',
    border: 'rgba(34,197,94,0.15)',
    badge:  'bg-green-500/15 text-green-400 border-green-500/30',
    dot:    'bg-green-400',
  },
};

function fmtGhs(v: number | null): string {
  if (v == null) return '';
  return `~GHS ${v.toFixed(1)}m`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Article pill in a section ─────────────────────────────────────────────────

function ArticlePill({ article }: { article: IntelligenceTopArticle }) {
  const tier = article.tier ? TIER_STYLE[article.tier] : null;
  return (
    <a
      href={article.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-150 group hover:border-white/15"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {tier && <div className={`w-1 h-full rounded-full shrink-0 mt-0.5 ${tier.bar}`} style={{ minHeight: '1rem' }} />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-on-surface leading-snug line-clamp-2 group-hover:text-mtn-yellow transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant font-mono">
          {article.source && <span>{article.source}</span>}
          {article.tier && (
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${tier?.badge ?? ''}`}>
              {article.tier}
            </span>
          )}
          {article.impact_ghs_mid != null && (
            <span className="text-mtn-yellow">{fmtGhs(article.impact_ghs_mid)}</span>
          )}
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-on-surface-variant opacity-0 group-hover:opacity-100 mt-0.5 transition-opacity" />
    </a>
  );
}

// ── Category section card ─────────────────────────────────────────────────────

function SectionCard({ section }: { section: IntelligenceSection }) {
  const meta = CATEGORY_META[section.category];
  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {meta ? (
            <div className={`p-1.5 rounded-lg border ${meta.bg} ${meta.border}`}>
              <span className={meta.color}>{meta.icon}</span>
            </div>
          ) : (
            <div className="p-1.5 rounded-lg border bg-slate-400/10 border-slate-400/20">
              <Newspaper className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div>
            <h3 className={`text-sm font-bold ${meta?.color ?? 'text-on-surface'}`}>
              {section.label}
            </h3>
            <p className="text-xs text-on-surface-variant font-mono">
              {section.article_count} article{section.article_count !== 1 ? 's' : ''}
              {section.critical_count > 0 && (
                <span className="text-red-400 ml-1.5">· {section.critical_count} Critical</span>
              )}
            </p>
          </div>
        </div>
        <Link
          href={`/news?category=${section.category}`}
          className="flex items-center gap-1 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* AI-generated / extractive summary */}
      <div
        className="border-l-2 pl-3"
        style={{ borderLeftColor: meta ? `rgba(${meta.accentRgb},0.4)` : 'rgba(255,255,255,0.1)' }}
      >
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {section.summary}
        </p>
      </div>

      {/* Top articles */}
      {section.top_articles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Top Articles</p>
          <div className="space-y-1.5">
            {section.top_articles.map((art, i) => (
              <ArticlePill key={i} article={art} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const [data,    setData]    = useState<IntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchIntelligenceSummary());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const banner = data ? (RISK_BANNER[data.overall_risk] ?? RISK_BANNER.Normal) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Page header ── */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mtn-yellow/10 border border-mtn-yellow/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Daily Briefing</h1>
            <p className="text-on-surface-variant mt-0.5">
              LLM-generated 24-hour risk intelligence digest
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Generated {fmtTime(data.generated_at)}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 disabled:opacity-50"
            style={{ background: 'rgba(255,208,0,0.08)', borderColor: 'rgba(255,208,0,0.2)', color: '#FFD000' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-400/20 bg-red-400/05 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && !data && (
        <div className="space-y-4">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-16" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <SkeletonBlock key={i} className="h-48" />)}
          </div>
        </div>
      )}

      {data && (
        <>
          {/* ── Overall risk banner ── */}
          <div
            className="rounded-xl border p-5"
            style={{ background: banner?.glow, borderColor: banner?.border }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${banner?.dot} animate-pulse`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-hero font-bold ${
                      data.overall_risk === 'Critical' ? 'text-red-400' :
                      data.overall_risk === 'Elevated' ? 'text-orange-400' :
                      data.overall_risk === 'Moderate' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {data.overall_risk} Risk Environment
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-mono font-bold ${banner?.badge}`}>
                      {data.overall_risk.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {data.total_articles} articles analysed · {data.period}
                  </p>
                </div>
              </div>

              {/* Tier counts */}
              <div className="flex items-center gap-4 font-mono text-sm">
                <div className="text-center">
                  <p className="text-red-400 font-bold text-lg">{data.tier_counts.Critical}</p>
                  <p className="text-xs text-on-surface-variant">Critical</p>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="text-center">
                  <p className="text-orange-400 font-bold text-lg">{data.tier_counts.Warning}</p>
                  <p className="text-xs text-on-surface-variant">Warning</p>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="text-center">
                  <p className="text-yellow-400 font-bold text-lg">{data.tier_counts.Watch}</p>
                  <p className="text-xs text-on-surface-variant">Watch</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Top headline ── */}
          {data.headline && (
            <div
              className="rounded-xl border p-5"
              style={{ background: 'rgba(255,208,0,0.03)', borderColor: 'rgba(255,208,0,0.15)' }}
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-mtn-yellow shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono uppercase tracking-widest text-mtn-yellow/70 mb-1.5">
                    Top Headline
                  </p>
                  <p className="text-base font-semibold text-on-surface leading-snug">
                    {data.headline.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs font-mono text-on-surface-variant">
                    {data.headline.source && <span>{data.headline.source}</span>}
                    {data.headline.tier && (
                      <span className={`px-2 py-0.5 rounded-full border font-bold ${TIER_STYLE[data.headline.tier]?.badge ?? ''}`}>
                        {data.headline.tier}
                      </span>
                    )}
                    {data.headline.severity != null && (
                      <span>Severity {data.headline.severity.toFixed(1)}/10</span>
                    )}
                  </div>
                </div>
                {data.headline.url && (
                  <a
                    href={data.headline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-lg hover:bg-white/05 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Category sections ── */}
          {data.sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.sections.map(section => (
                <SectionCard key={section.category} section={section} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
              <Brain className="w-10 h-10 opacity-30" />
              <p className="text-sm">No articles in the last 24 hours.</p>
              <Link href="/news" className="text-xs text-mtn-yellow hover:underline">
                Go to News Feed to trigger a scrape
              </Link>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono pt-2">
            {data.used_llm ? (
              <>
                <Brain className="w-3.5 h-3.5 text-mtn-yellow" />
                <span>Summaries generated by <span className="text-mtn-yellow">facebook/bart-large-cnn</span> via HuggingFace Inference API</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Summaries generated by extractive NLP (set HF_TOKEN to enable LLM summarisation)</span>
              </>
            )}
            <span className="ml-auto">Generated {fmtDateTime(data.generated_at)} · cached 30 min</span>
          </div>
        </>
      )}
    </div>
  );
}
