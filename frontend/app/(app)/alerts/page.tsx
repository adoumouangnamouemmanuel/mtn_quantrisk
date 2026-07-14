"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchAlerts, fetchAlertSummary, acknowledgeAlert, NewsAlert, AlertSummary } from '@/lib/api';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Bell, CheckCircle, AlertTriangle, AlertOctagon, Eye, Filter } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIER_META: Record<string, { bar: string; badge: string; bg: string; icon: React.ReactNode }> = {
  Critical: {
    bar:   'bg-red-500',
    badge: 'text-red-400 border-red-400/30 bg-red-400/10',
    bg:    'border-red-500/20',
    icon:  <AlertOctagon className="w-4 h-4 text-red-400" />,
  },
  Warning: {
    bar:   'bg-orange-400',
    badge: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    bg:    'border-orange-400/20',
    icon:  <AlertTriangle className="w-4 h-4 text-orange-400" />,
  },
  Watch: {
    bar:   'bg-yellow-400',
    badge: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    bg:    'border-yellow-400/20',
    icon:  <Eye className="w-4 h-4 text-yellow-400" />,
  },
};

function fmtGhs(v: number | null): string {
  if (v == null) return '—';
  return `GHS ${v.toFixed(1)}m`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' / ');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryRow({ summary }: { summary: AlertSummary }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Active Alerts', value: summary.total_active, color: 'text-on-surface' },
        { label: 'Critical',      value: summary.critical,     color: 'text-red-400' },
        { label: 'Warning',       value: summary.warning,      color: 'text-orange-400' },
        { label: 'Watch',         value: summary.watch,        color: 'text-yellow-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border p-4"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
          <p className={`text-2xl font-hero font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
  ackLoading,
}: {
  alert: NewsAlert;
  onAcknowledge: (id: string) => void;
  ackLoading: boolean;
}) {
  const meta = (TIER_META[alert.tier] ?? TIER_META['Watch'])!;

  return (
    <div className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${
      alert.acknowledged ? 'opacity-50' : ''
    } ${meta.bg}`}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      {/* tier stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.bar}`} />

      <div className="pl-4 pr-4 py-4 flex items-start gap-4">
        {/* icon */}
        <div className="shrink-0 mt-0.5">{meta.icon}</div>

        {/* body */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold text-on-surface leading-snug">{alert.headline}</p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant font-mono">
            {/* tier badge */}
            <span className={`px-2 py-0.5 rounded-full border font-bold ${meta?.badge ?? ''}`}>{alert.tier}</span>

            {/* category */}
            <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
              {capitalize(alert.category)}
            </span>

            {/* source */}
            {alert.sourceName && <span>{alert.sourceName}</span>}
            <span>·</span>
            <span>{fmtDate(alert.createdAt)}</span>
          </div>

          {/* metrics row */}
          <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
            <span className="text-on-surface-variant">
              Severity: <span className="text-on-surface font-bold">{alert.severity.toFixed(1)}/10</span>
            </span>
            <span className="text-on-surface-variant">
              MTN Relevance: <span className="text-on-surface font-bold">
                {alert.mtnRelevance != null ? `${(alert.mtnRelevance * 100).toFixed(0)}%` : '—'}
              </span>
            </span>
            <span className="text-on-surface-variant">
              Impact: <span className="text-mtn-yellow font-bold">{fmtGhs(alert.impactGhsMid)}</span>
            </span>
          </div>

          {alert.acknowledged && alert.acknowledgedAt && (
            <p className="text-xs text-on-surface-variant italic">
              Acknowledged {fmtDate(alert.acknowledgedAt)}
            </p>
          )}
        </div>

        {/* acknowledge button */}
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            disabled={ackLoading}
            title="Acknowledge alert"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-150 disabled:opacity-40 hover:border-green-400/40 hover:text-green-400"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)' }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Ack
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TIER_FILTERS = ['All', 'Critical', 'Warning', 'Watch'];

export default function AlertsPage() {
  const [alerts, setAlerts]       = useState<NewsAlert[]>([]);
  const [summary, setSummary]     = useState<AlertSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [ackIds, setAckIds]       = useState<Set<string>>(new Set());
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [showAcked, setShowAcked] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const loadData = useCallback(async (tier: string, showAck: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const [alts, sum] = await Promise.all([
        fetchAlerts({
          tier: tier === 'All' ? undefined : tier,
          acknowledged: showAck ? undefined : false,
          limit: 100,
        }),
        fetchAlertSummary(),
      ]);
      setAlerts(alts);
      setSummary(sum);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(tierFilter, showAcked); }, [loadData, tierFilter, showAcked]);

  async function handleAcknowledge(alertId: string) {
    setAckIds(prev => new Set(prev).add(alertId));
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a));
      setSummary(prev => prev ? { ...prev, total_active: Math.max(0, prev.total_active - 1) } : prev);
    } catch (e) {
      alert(`Failed to acknowledge: ${e}`);
    } finally {
      setAckIds(prev => { const next = new Set(prev); next.delete(alertId); return next; });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Risk Alerts</h1>
          <p className="text-on-surface-variant mt-0.5">AI-generated alerts from live news — Watch · Warning · Critical</p>
        </div>
      </div>

      {/* Summary */}
      {summary && <SummaryRow summary={summary} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant">
          <Filter className="w-3.5 h-3.5" /> Tier:
        </div>
        {TIER_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              tierFilter === t
                ? 'bg-mtn-yellow/15 border-mtn-yellow/30 text-mtn-yellow'
                : 'border-white/10 text-on-surface-variant hover:border-white/20'
            }`}
          >
            {t}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => setShowAcked(v => !v)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all flex items-center gap-1.5 ${
              showAcked
                ? 'bg-green-400/10 border-green-400/20 text-green-400'
                : 'border-white/10 text-on-surface-variant hover:border-white/20'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {showAcked ? 'Hiding acknowledged' : 'Show acknowledged'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-400/20 bg-red-400/05 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Alert list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
          <Bell className="w-10 h-10 opacity-30" />
          <p className="text-sm">No alerts. Scrape news from the News Feed page to generate alerts.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              onAcknowledge={handleAcknowledge}
              ackLoading={ackIds.has(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
