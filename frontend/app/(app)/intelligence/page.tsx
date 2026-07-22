"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchIntelligenceSummary, fetchNewsSummary, fetchNews,
  type IntelligenceSummary,
  type IntelligenceSection,
  type IntelligenceTopArticle,
  type NewsSummary,
  type NewsArticle,
} from '@/lib/api';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import {
  Brain, RefreshCw, AlertTriangle, Shield, TrendingUp, Activity,
  Wifi, Globe, Eye, ExternalLink, CheckCircle2, Clock, Zap,
  ChevronRight, Newspaper, Radio,
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

// ── Ghana decorative card ─────────────────────────────────────────────────────

function GhanaCard() {
  return (
    <Link
      href="/economics"
      aria-label="Open Ghana Macro Dashboard"
      className="group relative block min-h-[208px] w-full overflow-hidden rounded-2xl border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mtn-yellow/70"
      style={{
        background: 'radial-gradient(ellipse at 68% 50%, #0E0D20 0%, #070710 100%)',
        borderColor: 'rgba(255,208,0,0.18)',
        boxShadow: '0 0 0 1px rgba(255,208,0,0.04), 0 24px 64px rgba(0,0,0,0.7)',
      }}
    >
      <style>{`
        @keyframes gh-halo { 0%,100%{opacity:0} 50%{opacity:0.22} }
        @keyframes gh-acc  { 0%,100%{r:3;opacity:1} 50%{r:5;opacity:0.5} }
        @keyframes gh-ring { 0%,100%{r:8;opacity:0.45} 50%{r:15;opacity:0} }
      `}</style>

      {/* Warm gold ambient glow behind map */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, left: '36%',
        background: 'radial-gradient(ellipse at 62% 50%, rgba(255,208,0,0.09) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      {/* Scattered star field */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
        {([
          [18,22],[45,68],[72,14],[118,8],[155,30],[182,12],[228,44],[260,18],[308,38],[345,10],[398,32],[422,55],
          [30,142],[95,178],[145,108],[195,158],[248,182],[315,152],[362,170],[406,132],[452,178],
        ] as [number,number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.9" fill="rgba(255,208,0,0.32)" />
        ))}
      </svg>

      {/* Left text block */}
      <div style={{
        position: 'absolute', left: 24, top: 0, bottom: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
      }}>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '9px',
          letterSpacing: '0.3em', textTransform: 'uppercase' as const,
          color: 'rgba(255,208,0,0.38)',
        }}>
          Daily intelligence coverage
        </span>

        <span style={{
          fontFamily: '"Inter","Helvetica Neue",system-ui,sans-serif',
          fontWeight: 900, fontSize: '44px', lineHeight: 1, letterSpacing: '-0.01em',
          background: 'linear-gradient(158deg,#7A4E00 0%,#FFD000 28%,#FFF5C0 52%,#FFD000 70%,#7A4E00 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          GHANA
        </span>

        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '10px',
          letterSpacing: '0.12em', color: 'rgba(255,208,0,0.36)',
        }}>
          West Africa · 8°N 2°W
        </span>

        {/* Flag stripes */}
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {(['#CE1126','#FCD116','#006B3F'] as string[]).map((c, i) => (
            <div key={i} style={{ width: 28, height: 5, background: c, borderRadius: 3, opacity: 0.72 }} />
          ))}
        </div>
      </div>

      {/* Vertical separator */}
      <div style={{
        position: 'absolute', left: '38%', top: '18%', bottom: '18%', width: '1px',
        background: 'linear-gradient(to bottom,transparent,rgba(255,208,0,0.1),transparent)',
      }} className="hidden sm:block" />

      {/* Ghana SVG — accurate simplified silhouette */}
      <svg
        viewBox="0 0 210 262"
        className="hidden sm:block transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', height: '196px', width: 'auto' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ghf" cx="42%" cy="52%" r="58%">
            <stop offset="0%"   stopColor="#FFD000" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#FFD000" stopOpacity="0.01" />
          </radialGradient>
          {/* Border glow: soft double-blur merge */}
          <filter id="ghg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b1"/>
            <feGaussianBlur stdDeviation="9" result="b2"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Outer halo for pulse animation */}
          <filter id="gho" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14"/>
          </filter>
        </defs>

        {/* Pulsing outer halo */}
        <path
          d="M 12,8 Q 105,2 185,16 L 195,32 L 196,60 L 190,95 L 183,130 L 176,160 L 172,182 L 168,205 L 158,225 L 135,237 L 105,240 L 75,236 L 50,228 L 28,215 L 15,195 L 10,165 L 8,130 L 9,92 L 10,55 L 12,28 Z"
          fill="none" stroke="#FFD000" strokeWidth="12"
          filter="url(#gho)"
          style={{ animation: 'gh-halo 3.5s ease-in-out infinite' }}
        />

        {/* Ghana territory fill */}
        <path
          d="M 12,8 Q 105,2 185,16 L 195,32 L 196,60 L 190,95 L 183,130 L 176,160 L 172,182 L 168,205 L 158,225 L 135,237 L 105,240 L 75,236 L 50,228 L 28,215 L 15,195 L 10,165 L 8,130 L 9,92 L 10,55 L 12,28 Z"
          fill="url(#ghf)"
        />

        {/* Ghana border — golden outline with soft glow */}
        <path
          d="M 12,8 Q 105,2 185,16 L 195,32 L 196,60 L 190,95 L 183,130 L 176,160 L 172,182 L 168,205 L 158,225 L 135,237 L 105,240 L 75,236 L 50,228 L 28,215 L 15,195 L 10,165 L 8,130 L 9,92 L 10,55 L 12,28 Z"
          fill="none" stroke="#FFD000" strokeWidth="1.6"
          filter="url(#ghg)" strokeLinejoin="round"
        />

        {/* Lake Volta — main J body */}
        <path
          d="M 162,38 L 176,60 L 173,85 L 168,108 L 160,128 L 150,138 L 138,134 L 134,115 L 138,90 L 146,65 L 156,45 Z"
          fill="rgba(6,12,38,0.85)" stroke="rgba(90,150,255,0.4)" strokeWidth="0.9" strokeLinejoin="round"
        />
        {/* Lake Volta — southern arm */}
        <path
          d="M 150,138 L 155,158 L 152,180 L 143,178 L 148,156 L 138,134"
          fill="rgba(6,12,38,0.85)" stroke="rgba(90,150,255,0.4)" strokeWidth="0.9" strokeLinecap="round"
        />

        {/* Tamale — static dot */}
        <circle cx="92" cy="82" r="1.8" fill="#FFD000" opacity="0.62" />

        {/* Kumasi — static dot */}
        <circle cx="72" cy="158" r="1.8" fill="#FFD000" opacity="0.62" />

        {/* Accra — pulsing capital */}
        <circle cx="125" cy="237" r="3" fill="#FFD000">
          <animate attributeName="r" values="3;4.8;3" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="125" cy="237" r="8" fill="none" stroke="#FFD000" strokeWidth="0.8">
          <animate attributeName="r" values="8;14;8" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0;0.45" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <text x="131" y="234" fontSize="7.5" fill="rgba(255,208,0,0.65)"
          fontFamily="ui-monospace,monospace" fontWeight="bold">Accra ★</text>
      </svg>
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full border border-mtn-yellow/20 bg-black/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-mtn-yellow backdrop-blur-sm transition-all group-hover:border-mtn-yellow/45 group-hover:bg-mtn-yellow/10">
        Open macro dashboard
        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ── Source Activity bar ───────────────────────────────────────────────────────

function SourceBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const isMtn = name.toLowerCase().includes('mtn');
  return (
    <div className="flex items-center gap-3 text-xs">
      <span
        className={`w-36 shrink-0 truncate font-mono ${isMtn ? 'text-mtn-yellow font-bold' : 'text-on-surface-variant'}`}
        title={name}
      >
        {isMtn && '★ '}{name}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${isMtn ? 'bg-mtn-yellow' : 'bg-white/30'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-on-surface-variant shrink-0">{count}</span>
    </div>
  );
}

// ── Compact article row for live feed ─────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  Critical: 'text-red-400',
  Warning:  'text-orange-400',
  Watch:    'text-yellow-400',
};

function FeedRow({ article }: { article: NewsArticle }) {
  const tc = article.alertTier ? TIER_COLOR[article.alertTier] : '';
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 py-2.5 border-b group hover:bg-white/02 transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-on-surface leading-snug line-clamp-1 group-hover:text-mtn-yellow transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-on-surface-variant">
          <span className={article.sourceName?.toLowerCase().includes('mtn') ? 'text-mtn-yellow font-bold' : ''}>
            {article.sourceName ?? '—'}
          </span>
          {article.alertTier && <span className={`font-bold ${tc}`}>{article.alertTier}</span>}
        </div>
      </div>
      <ExternalLink className="w-3 h-3 shrink-0 text-on-surface-variant opacity-0 group-hover:opacity-50 mt-0.5" />
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const [data,       setData]       = useState<IntelligenceSummary | null>(null);
  const [summary,    setSummary]    = useState<NewsSummary | null>(null);
  const [recentArts, setRecentArts] = useState<NewsArticle[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [intel, sum, arts] = await Promise.all([
        fetchIntelligenceSummary(),
        fetchNewsSummary(),
        fetchNews({ limit: 15 }),
      ]);
      setData(intel);
      setSummary(sum);
      setRecentArts(arts);
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

      {/* ── Ghana decorative card ── */}
      <GhanaCard />

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

          {/* ── Source Activity + Live Feed ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Source Activity */}
            <div
              className="rounded-xl border p-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-mtn-yellow" />
                <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
                  Source Activity
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant ml-auto">last 24 h</span>
              </div>
              {summary && Object.keys(summary.sourceBreakdown ?? {}).length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const entries = Object.entries(summary.sourceBreakdown ?? {});
                    const max = entries[0]?.[1] ?? 1;
                    return entries.map(([name, count]) => (
                      <SourceBar key={name} name={name} count={count} max={max} />
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant font-mono">No source data yet</p>
              )}
            </div>

            {/* Live Article Feed */}
            <div
              className="rounded-xl border p-5 space-y-2"
              style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
                    Live Feed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <Link href="/news" className="text-[10px] font-mono text-on-surface-variant hover:text-mtn-yellow transition-colors flex items-center gap-1">
                  All articles <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {recentArts.length > 0 ? (
                <div>
                  {recentArts.map(a => <FeedRow key={a.id} article={a} />)}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant font-mono py-4">No articles yet</p>
              )}
            </div>
          </div>

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
