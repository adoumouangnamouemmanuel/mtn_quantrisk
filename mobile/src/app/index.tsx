import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ── API types / fetches ──────────────────────────────────────────────────────

const API = 'http://127.0.0.1:8001';

interface Kpi {
  id: string; name: string; category: string;
  fy25Value: number; unit: string; status: string;
}
interface AlertSummary { total_active: number; critical: number; warning: number; watch: number; }
interface NewsSummary { articlesToday: number; totalArticles: number; topRiskCategory: string | null; }

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json() as Promise<T>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Safe: '#22c55e', Watch: '#fbbf24', Warning: '#f97316', Critical: '#ef4444',
};

function fmtValue(v: number, unit: string): string {
  if (unit === '%') return `${v.toFixed(1)}%`;
  if (unit === 'GHSm') return `GHS ${(v / 1000).toFixed(2)}B`;
  return v.toLocaleString();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText type="small" style={styles.sectionLabel} themeColor="textSecondary">
      {children.toUpperCase()}
    </ThemedText>
  );
}

function KpiCard({ kpi, bg, border }: { kpi: Kpi; bg: string; border: string }) {
  const dot = STATUS_COLOR[kpi.status] ?? '#888';
  return (
    <View style={[styles.kpiCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.kpiDot, { backgroundColor: dot }]} />
      <View style={{ flex: 1 }}>
        <ThemedText type="small" style={{ fontWeight: '700', fontSize: 12 }}>{kpi.id}</ThemedText>
        <ThemedText type="small" style={{ fontSize: 11, marginTop: 1 }} themeColor="textSecondary"
          numberOfLines={1}>{kpi.name}</ThemedText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <ThemedText type="small" style={{ fontWeight: '700', fontSize: 13 }}>
          {fmtValue(kpi.fy25Value, kpi.unit)}
        </ThemedText>
        <ThemedText type="small" style={{ fontSize: 10, color: dot }}>{kpi.status}</ThemedText>
      </View>
    </View>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" style={[styles.statLabel, { color: accent }]}>{label}</ThemedText>
      <ThemedText type="small" style={{ fontSize: 24, fontWeight: '700' }}>{value}</ThemedText>
      {sub && <ThemedText type="small" style={{ fontSize: 11 }} themeColor="textSecondary">{sub}</ThemedText>}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const theme = useTheme();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);
  const [newsSummary, setNewsSummary] = useState<NewsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setError(null);
    try {
      const [k, a, n] = await Promise.allSettled([
        get<Kpi[]>('/api/kpis'),
        get<AlertSummary>('/api/alerts/summary'),
        get<NewsSummary>('/api/news/summary'),
      ]);
      if (k.status === 'fulfilled') setKpis(k.value);
      if (a.status === 'fulfilled') setAlertSummary(a.value);
      if (n.status === 'fulfilled') setNewsSummary(n.value);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const criticalKpis = kpis.filter(k => k.status === 'Critical');
  const categories   = Array.from(new Set(kpis.map(k => k.category)));

  const insets = { bottom: BottomTabInset + Spacing.three };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, Platform.OS !== 'web' && insets]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor="#FFD000" />}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three }}>

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.headerBadge, { backgroundColor: '#1a1a0a' }]}>
                <ThemedText type="small" style={{ color: '#FFD000', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
                  MTN QUANTRISK
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={{ fontSize: 26, fontWeight: '700', marginTop: Spacing.one }}>
                Risk Dashboard
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                FY25 · MTN Ghana · AI Intelligence
              </ThemedText>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#FFD000" style={{ marginTop: Spacing.five }} />
            ) : error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" style={{ color: '#ef4444' }}>
                  Cannot reach backend: {error}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11, marginTop: 4 }}>
                  Make sure the backend is running on port 8001.
                </ThemedText>
                <Pressable onPress={() => { setLoading(true); loadAll(); }} style={styles.retryBtn}>
                  <ThemedText type="small" style={{ color: '#FFD000', fontWeight: '700', fontSize: 12 }}>Retry</ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Live Intelligence */}
                {(alertSummary || newsSummary) && (
                  <View>
                    <SectionLabel>Live Intelligence</SectionLabel>
                    <View style={styles.statsRow}>
                      <StatCard
                        label="Active Alerts"
                        value={alertSummary?.total_active ?? '—'}
                        sub={alertSummary && alertSummary.critical > 0 ? `${alertSummary.critical} critical` : undefined}
                        accent="#ef4444"
                      />
                      <StatCard
                        label="Articles Today"
                        value={newsSummary?.articlesToday ?? '—'}
                        sub={newsSummary?.topRiskCategory ?? undefined}
                        accent="#60a5fa"
                      />
                    </View>
                  </View>
                )}

                {/* Critical KPIs */}
                {criticalKpis.length > 0 && (
                  <View>
                    <SectionLabel>{`Critical KPIs (${criticalKpis.length})`}</SectionLabel>
                    {criticalKpis.map(k => (
                      <KpiCard key={k.id} kpi={k} bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />
                    ))}
                  </View>
                )}

                {/* All KPIs by category */}
                {categories.map(cat => {
                  const group = kpis.filter(k => k.category === cat);
                  return (
                    <View key={cat}>
                      <SectionLabel>{cat}</SectionLabel>
                      {group.map(k => (
                        <KpiCard key={k.id} kpi={k}
                          bg={theme.backgroundElement}
                          border={theme.backgroundSelected}
                        />
                      ))}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    paddingBottom: Spacing.two,
  },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,208,0,0.3)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  statCard: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginTop: Spacing.one,
    borderWidth: 1,
    gap: Spacing.two,
  },
  kpiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shrink: 0,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  errorBox: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  retryBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    backgroundColor: 'rgba(255,208,0,0.1)',
    borderRadius: Spacing.one,
    alignSelf: 'flex-start',
  },
});
