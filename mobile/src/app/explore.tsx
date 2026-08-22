import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = 'http://127.0.0.1:8001';

interface HealthSource {
  name: string;
  status: 'Healthy' | 'Failed' | string;
  latencyMs: number;
}

interface HealthData {
  status: string;
  lastBeatAt: string;
  sources: HealthSource[];
}

interface EconData {
  summary: string;
  inflation_risk: string;
  growth_risk: string;
}

const STATUS_COLOR: Record<string, string> = {
  Healthy:  '#10b981',
  Failed:   '#ef4444',
  Degraded: '#f59e0b',
};

const RISK_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  Warning:  '#f59e0b',
  Watch:    '#eab308',
  Normal:   '#10b981',
};

export default function AboutScreen() {
  const [health, setHealth]         = useState<HealthData | null>(null);
  const [econ, setEcon]             = useState<EconData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [hRes, eRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/health`).then(r => r.json()),
        fetch(`${API_BASE}/api/economics/risk-context`).then(r => r.json()),
      ]);
      if (hRes.status === 'fulfilled') setHealth(hRes.value as HealthData);
      if (eRes.status === 'fulfilled') setEcon(eRes.value as EconData);
    } catch {
      setError('Could not connect to backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>MTN</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>QuantRisk Platform</Text>
            <Text style={styles.subtitle}>System Status · v2.0.0</Text>
          </View>
          <View style={[styles.statusDot, {
            backgroundColor: health ? (STATUS_COLOR[health.status] ?? '#64748b') : '#64748b'
          }]} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && !health && (
          <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 40 }} />
        )}

        {/* Pipeline Health */}
        {health && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pipeline Health</Text>
            <View style={styles.overallRow}>
              <Text style={styles.overallLabel}>Overall</Text>
              <Text style={[styles.overallValue, { color: STATUS_COLOR[health.status] ?? '#94a3b8' }]}>
                {health.status}
              </Text>
            </View>
            {health.sources.map((src, i) => (
              <View key={i} style={styles.sourceRow}>
                <View style={[styles.dot, { backgroundColor: STATUS_COLOR[src.status] ?? '#94a3b8' }]} />
                <Text style={styles.sourceName}>{src.name}</Text>
                {src.latencyMs > 0 && <Text style={styles.latency}>{src.latencyMs} ms</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Ghana Macro */}
        {econ && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ghana Macro Signals</Text>
            <Text style={styles.econSummary}>{econ.summary}</Text>
            <View style={styles.riskRow}>
              <View style={[styles.riskChip, { borderColor: RISK_COLOR[econ.inflation_risk] }]}>
                <Text style={[styles.riskLabel, { color: RISK_COLOR[econ.inflation_risk] }]}>
                  Inflation: {econ.inflation_risk}
                </Text>
              </View>
              <View style={[styles.riskChip, { borderColor: RISK_COLOR[econ.growth_risk] }]}>
                <Text style={[styles.riskLabel, { color: RISK_COLOR[econ.growth_risk] }]}>
                  Growth: {econ.growth_risk}
                </Text>
              </View>
            </View>
            <Text style={styles.econSource}>Source: World Bank Open Data</Text>
          </View>
        )}

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.aboutText}>
            AI-powered quantitative risk intelligence for MTN Ghana. Monitors 14 KPIs across
            Financial, Segment, Operational and External pillars with live news NLP scoring.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.aboutLabel}>ML Models</Text>
          <Text style={styles.aboutText}>XGBoost · ARIMA · Monte Carlo · Reverse Stress</Text>
          <Text style={styles.aboutLabel}>Live Data</Text>
          <Text style={styles.aboutText}>12 RSS feeds · FinBERT sentiment · World Bank Ghana macro</Text>
          <Text style={styles.aboutLabel}>Team</Text>
          <Text style={styles.aboutText}>Emmanuel · Chidima · Nana · Foureiratou</Text>
          <Text style={styles.aboutText}>Ashesi University · MTN Ghana Capstone 2026</Text>
        </View>

        {/* Quick links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Links</Text>
          {[
            ['API Documentation', `${API_BASE}/docs`],
            ['Health Endpoint', `${API_BASE}/api/health`],
          ].map(([label, url]) => (
            <TouchableOpacity key={url} style={styles.linkRow} onPress={() => Linking.openURL(url)}>
              <Text style={styles.linkText}>{label}</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>Ashesi University · MTN Ghana Capstone 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#0f172a' },
  scroll:       { padding: 16, paddingBottom: 40 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingVertical: 12 },
  logo:         { fontSize: 22, fontWeight: '900', color: '#FFCC00', letterSpacing: 2 },
  headerText:   { flex: 1 },
  title:        { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  subtitle:     { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusDot:    { width: 12, height: 12, borderRadius: 6 },
  errorBox:     { backgroundColor: '#7f1d1d', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText:    { color: '#fca5a5', fontSize: 13 },
  card:         { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle:    { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  overallRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overallLabel: { color: '#cbd5e1', fontSize: 14 },
  overallValue: { fontSize: 14, fontWeight: '700' },
  sourceRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  dot:          { width: 8, height: 8, borderRadius: 4 },
  sourceName:   { flex: 1, color: '#cbd5e1', fontSize: 13 },
  latency:      { color: '#475569', fontSize: 11 },
  econSummary:  { color: '#cbd5e1', fontSize: 13, marginBottom: 10, lineHeight: 20 },
  riskRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  riskChip:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  riskLabel:    { fontSize: 11, fontWeight: '700' },
  econSource:   { color: '#475569', fontSize: 11, marginTop: 4 },
  divider:      { height: 1, backgroundColor: '#334155', marginVertical: 10 },
  aboutLabel:   { color: '#FFCC00', fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 2 },
  aboutText:    { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  linkRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  linkText:     { color: '#FFCC00', fontSize: 14 },
  linkArrow:    { color: '#475569', fontSize: 18 },
  footer:       { color: '#334155', fontSize: 11, textAlign: 'center', marginTop: 8 },
});
