"use client";

import { useEffect, useState } from 'react';
import { fetchNewsReasoning } from '@/lib/api';
import type { NewsReasoning } from '@/lib/types';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Sparkles, Tag, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { RISK_CATEGORIES } from '@/lib/riskTaxonomy';
import { ThemeTokens } from '@/lib/theme';

interface Props {
  articleId: string;
}

/** Drill-down panel that explains *why* an article has its scores. */
export function NewsReasoningPanel({ articleId }: Props) {
  const [data, setData] = useState<NewsReasoning | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNewsReasoning(articleId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) return <SkeletonBlock className="h-32 w-full" />;
  if (!data || !data.scored) {
    return (
      <p className="font-sans text-xs text-on-surface-variant">
        {data?.note ?? 'Reasoning unavailable for this article.'}
      </p>
    );
  }

  const catMeta = data.category ? RISK_CATEGORIES[data.category as keyof typeof RISK_CATEGORIES] : null;

  return (
    <div className="space-y-4">
      {/* Category + headline scores */}
      <div className="flex flex-wrap items-center gap-2">
        {catMeta && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold"
            style={{ background: `${catMeta.color}1A`, color: catMeta.color, border: `1px solid ${catMeta.color}33` }}
          >
            {catMeta.label}
          </span>
        )}
        {data.alertTier && (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border border-current text-mtn-yellow">
            {data.alertTier}
          </span>
        )}
        {data.sentiment && (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px]" style={{ color: ThemeTokens.colors.onSurfaceVariant, background: 'rgba(255,255,255,0.06)' }}>
            {data.sentiment}
          </span>
        )}
      </div>

      {/* Score summary bar */}
      <div className="flex items-center gap-4 py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {data.severity != null && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">Severity</span>
            <span className="font-mono text-xs font-bold text-mtn-yellow">{data.severity.toFixed(1)}/10</span>
          </div>
        )}
        {data.mtnRelevance != null && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">Relevance</span>
            <span className="font-mono text-xs font-bold text-mtn-yellow">{(data.mtnRelevance * 100).toFixed(0)}%</span>
          </div>
        )}
        {data.confidence != null && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">Confidence</span>
            <span className="font-mono text-xs font-bold text-on-surface">{(data.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* LLM explanation */}
      {data.llmExplanation && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(130,177,255,0.06)', borderLeft: '3px solid rgba(130,177,255,0.4)' }}>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: ThemeTokens.colors.secondary }}>
            <Sparkles className="w-3 h-3" /> LLM Explanation
          </p>
          <p className="font-sans text-xs text-on-surface leading-relaxed">{data.llmExplanation}</p>
        </div>
      )}

      {/* Relevance reasoning */}
      {data.relevanceReasons && data.relevanceReasons.length > 0 && (
        <ReasonSection title="Why this relevance?" items={data.relevanceReasons.map(r => ({
          label: r.signal,
          detail: r.keyword ? `“${r.keyword}” (+${r.weight})` : r.note,
        }))} />
      )}

      {/* Severity reasoning */}
      {data.severityReasons && data.severityReasons.length > 0 && (
        <ReasonSection title="Why this severity?" items={data.severityReasons.map(r => ({
          label: r.signal,
          detail: r.keyword
            ? `keyword “${r.keyword}” → ${r.mappedCategory ?? r.category}`
            : r.note,
          value: typeof r.value === 'number' ? String(r.value) : r.value,
        }))} />
      )}

      {/* Impact reasoning */}
      {data.impactReasons && data.impactReasons.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Why this impact?
          </p>
          {data.impactReasons.map((ir, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-center">
              <ImpactCell label="Min" value={ir.min} />
              <ImpactCell label="Mid" value={ir.mid} highlight />
              <ImpactCell label="Max" value={ir.max} />
            </div>
          ))}
          {data.impactReasons[0]?.note && (
            <p className="font-sans text-[10px] text-on-surface-variant">{data.impactReasons[0].note}</p>
          )}
        </div>
      )}

      {/* Matched keywords */}
      {data.matchedCategoryKeywords && data.matchedCategoryKeywords.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Matched keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {data.matchedCategoryKeywords.map((kw, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ background: 'rgba(255,208,0,0.08)', color: ThemeTokens.colors.mtnYellow }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Entities */}
      {data.entities && Object.values(data.entities).some(arr => arr.length > 0) && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Entities</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              ...data.entities.orgs.map(e => ({ label: e, c: 'rgba(130,177,255,0.4)' })),
              ...data.entities.locations.map(e => ({ label: e, c: 'rgba(74,222,128,0.4)' })),
              ...data.entities.persons.map(e => ({ label: e, c: 'rgba(192,132,252,0.4)' })),
              ...data.entities.money.map(e => ({ label: e, c: ThemeTokens.colors.mtnYellow })),
            ].map(({ label, c }, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ background: `${c}1A`, color: c, border: `1px solid ${c}33` }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReasonSection({ title, items }: { title: string; items: Array<{ label: string; detail?: string; value?: string }> }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{title}</p>
      <div className="space-y-1.5">
        {items.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="font-mono text-on-surface">{r.label}</span>
              {r.detail && <span className="font-sans text-on-surface-variant ml-1.5">{r.detail}</span>}
            </div>
            {r.value && <span className="font-mono font-bold text-mtn-yellow shrink-0">{r.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactCell({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className="rounded-lg p-2" style={{ background: highlight ? 'rgba(255,208,0,0.06)' : 'rgba(255,255,255,0.03)' }}>
      <p className="font-mono text-[9px] uppercase text-on-surface-variant">{label}</p>
      <p className="font-mono text-sm font-bold mt-0.5" style={{ color: highlight ? ThemeTokens.colors.mtnYellow : ThemeTokens.colors.onSurface }}>
        {value != null ? `GHS ${value.toFixed(1)}m` : '—'}
      </p>
    </div>
  );
}
