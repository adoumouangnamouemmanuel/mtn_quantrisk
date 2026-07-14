import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ── API ───────────────────────────────────────────────────────────────────────

const API = 'http://127.0.0.1:8001';

interface NewsAlert {
  id: string; tier: string; category: string; headline: string;
  sourceName: string | null; severity: number; impactGhsMid: number | null;
  mtnRelevance: number | null; acknowledged: boolean; createdAt: string;
}
interface AlertSummary { total_active: number; critical: number; warning: number; watch: number; }

async function getAlerts(tier?: string): Promise<NewsAlert[]> {
  const qs = new URLSearchParams({ limit: '80', acknowledged: 'false' });
  if (tier) qs.set('tier', tier);
  const r = await fetch(`${API}/api/alerts?${qs}`);
  if (!r.ok) throw new Error(`alerts → ${r.status}`);
  return r.json();
}

async function getSummary(): Promise<AlertSummary> {
  const r = await fetch(`${API}/api/alerts/summary`);
  if (!r.ok) throw new Error(`alerts/summary → ${r.status}`);
  return r.json();
}

async function ack(alertId: string): Promise<void> {
  await fetch(`${API}/api/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  Critical: '#ef4444', Warning: '#f97316', Watch: '#fbbf24',
};

function fmtGhs(v: number | null): string {
  if (v == null) return '—';
  return `GHS ${v.toFixed(1)}m`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', '/');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: AlertSummary }) {
  const theme = useTheme();
  return (
    <View style={[styles.summaryBar, { backgroundColor: theme.backgroundElement }]}>
      {[
        { label: 'Active', value: summary.total_active, color: '#fff' },
        { label: 'Critical', value: summary.critical,    color: '#ef4444' },
        { label: 'Warning',  value: summary.warning,     color: '#f97316' },
        { label: 'Watch',    value: summary.watch,        color: '#fbbf24' },
      ].map(({ label, value, color }) => (
        <View key={label} style={styles.summaryItem}>
          <ThemedText type="small" style={[styles.summaryValue, { color }]}>{value}</ThemedText>
          <ThemedText type="small" style={styles.summaryLabel}>{label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function AlertCard({
  alert, bg, onAck, ackLoading,
}: { alert: NewsAlert; bg: string; onAck: (id: string) => void; ackLoading: boolean }) {
  const tc = TIER_COLOR[alert.tier] ?? '#9ca3af';
  return (
    <View style={[styles.alertCard, { backgroundColor: bg, borderLeftColor: tc }]}>
      {/* header */}
      <View style={styles.alertHeader}>
        <View style={[styles.tierBadge, { backgroundColor: `${tc}20`, borderColor: tc }]}>
          <ThemedText type="small" style={[styles.tierText, { color: tc }]}>{alert.tier}</ThemedText>
        </View>
        <View style={[styles.catBadge, { opacity: 0.7 }]}>
          <ThemedText type="small" style={styles.catText}>{capitalize(alert.category)}</ThemedText>
        </View>
        <ThemedText type="small" style={[styles.dateText, { marginLeft: 'auto' as any }]}>
          {fmtDate(alert.createdAt)}
        </ThemedText>
      </View>

      {/* headline */}
      <ThemedText type="small" style={styles.headline} numberOfLines={3}>{alert.headline}</ThemedText>

      {/* metrics */}
      <View style={styles.metrics}>
        <ThemedText type="small" style={styles.metric}>
          Severity: <ThemedText type="small" style={styles.metricVal}>{alert.severity.toFixed(1)}/10</ThemedText>
        </ThemedText>
        <ThemedText type="small" style={styles.metric}>
          Impact: <ThemedText type="small" style={[styles.metricVal, { color: '#FFD000' }]}>{fmtGhs(alert.impactGhsMid)}</ThemedText>
        </ThemedText>
        {alert.mtnRelevance != null && (
          <ThemedText type="small" style={styles.metric}>
            MTN rel: <ThemedText type="small" style={styles.metricVal}>{(alert.mtnRelevance * 100).toFixed(0)}%</ThemedText>
          </ThemedText>
        )}
      </View>

      {/* ack button */}
      <Pressable
        onPress={() => onAck(alert.id)}
        disabled={ackLoading}
        style={[styles.ackBtn, { opacity: ackLoading ? 0.5 : 1 }]}
      >
        <ThemedText type="small" style={styles.ackText}>✓ Acknowledge</ThemedText>
      </Pressable>
    </View>
  );
}

function FilterChip({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, {
        backgroundColor: active ? `${color}20` : theme.backgroundElement,
        borderColor: active ? color : 'transparent',
      }]}
    >
      <ThemedText type="small" style={[styles.chipText, { color: active ? color : theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

const TIER_FILTERS = [
  { label: 'All',      value: undefined,    color: '#FFD000' },
  { label: 'Critical', value: 'Critical',   color: '#ef4444' },
  { label: 'Warning',  value: 'Warning',    color: '#f97316' },
  { label: 'Watch',    value: 'Watch',      color: '#fbbf24' },
];

export default function AlertsScreen() {
  const theme = useTheme();
  const [alerts, setAlerts]       = useState<NewsAlert[]>([]);
  const [summary, setSummary]     = useState<AlertSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ackIds, setAckIds]       = useState<Set<string>>(new Set());
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async (tier?: string) => {
    setError(null);
    try {
      const [a, s] = await Promise.allSettled([getAlerts(tier), getSummary()]);
      if (a.status === 'fulfilled') setAlerts(a.value);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (a.status === 'rejected')  setError(String(a.reason));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(tierFilter); }, [load]);

  function handleTier(tier?: string) {
    setTierFilter(tier);
    setLoading(true);
    load(tier);
  }

  async function handleAck(alertId: string) {
    setAckIds(prev => new Set(prev).add(alertId));
    try {
      await ack(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setSummary(prev => prev ? { ...prev, total_active: Math.max(0, prev.total_active - 1) } : prev);
    } catch (e) {
      alert(`Failed: ${e}`);
    } finally {
      setAckIds(prev => { const n = new Set(prev); n.delete(alertId); return n; });
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
        <View style={[styles.pageHeader, { borderBottomColor: theme.backgroundElement }]}>
          <View>
            <ThemedText type="subtitle" style={{ fontSize: 22, fontWeight: '700' }}>Risk Alerts</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              AI-generated · Unacknowledged
            </ThemedText>
          </View>
        </View>

        {/* Summary bar */}
        {summary && <SummaryBar summary={summary} />}

        {/* Tier filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, gap: Spacing.one }}>
          {TIER_FILTERS.map(f => (
            <FilterChip
              key={f.label}
              label={f.label}
              active={tierFilter === f.value}
              onPress={() => handleTier(f.value)}
              color={f.color}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, Platform.OS !== 'web' && { paddingBottom: BottomTabInset + Spacing.three }]}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#FFD000"
          onRefresh={() => { setRefreshing(true); load(tierFilter); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FFD000" style={{ marginTop: Spacing.five }} />
        ) : error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" style={{ color: '#ef4444' }}>{error}</ThemedText>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              No active alerts.{'\n'}Scrape news to generate new alerts.
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: Spacing.two, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' }}>
            {alerts.map(a => (
              <AlertCard
                key={a.id}
                alert={a}
                bg={theme.backgroundElement}
                onAck={handleAck}
                ackLoading={ackIds.has(a.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 10, opacity: 0.5, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
  scroll: { padding: Spacing.two },
  alertCard: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
    borderLeftWidth: 3,
    gap: Spacing.one,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  tierBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8, borderWidth: 1,
  },
  tierText: { fontSize: 10, fontWeight: '800' },
  catBadge: { paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 10 },
  dateText: { fontSize: 10, opacity: 0.5 },
  headline: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metric: { fontSize: 11, opacity: 0.6 },
  metricVal: { fontWeight: '700', opacity: 1 },
  ackBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    marginTop: 2,
  },
  ackText: { color: '#22c55e', fontSize: 11, fontWeight: '700' },
  errorBox: { margin: Spacing.three, padding: Spacing.two, borderRadius: Spacing.two },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.five },
});
