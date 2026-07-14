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

interface NewsArticle {
  id: string; title: string; url: string; sourceName: string | null;
  publishedAt: string | null; category: string | null;
  alertTier: string | null; sentiment: string | null;
  mtnRelevance: number | null; impactGhsMid: number | null;
}

async function fetchNews(category?: string): Promise<NewsArticle[]> {
  const qs = category ? `?category=${category}&limit=40` : '?limit=40';
  const r = await fetch(`${API}/api/news${qs}`);
  if (!r.ok) throw new Error(`news → ${r.status}`);
  return r.json();
}

async function triggerScrape(): Promise<{ newArticles: number }> {
  const r = await fetch(`${API}/api/news/scrape`, { method: 'POST' });
  if (!r.ok) throw new Error(`scrape → ${r.status}`);
  return r.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  Critical: '#ef4444', Warning: '#f97316', Watch: '#fbbf24',
};

const SENTIMENT_COLOR: Record<string, string> = {
  negative: '#ef4444', neutral: '#9ca3af', positive: '#22c55e',
};

const CATEGORIES = ['regulatory', 'fx_financial', 'competitive', 'operational', 'political', 'reputational'];
const CAT_LABELS: Record<string, string> = {
  regulatory: 'Regulatory', fx_financial: 'FX/Finance',
  competitive: 'Competitive', operational: 'Operational',
  political: 'Political', reputational: 'Reputational',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function fmtGhs(v: number | null): string {
  if (v == null) return '';
  return `~GHS ${v.toFixed(0)}m`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ArticleCard({ article, bg, border }: { article: NewsArticle; bg: string; border: string }) {
  const tierColor  = article.alertTier  ? TIER_COLOR[article.alertTier]   ?? '#9ca3af' : null;
  const sentColor  = article.sentiment  ? SENTIMENT_COLOR[article.sentiment] ?? '#9ca3af' : null;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: tierColor ?? border }]}>
      {tierColor && <View style={[styles.tierStripe, { backgroundColor: tierColor }]} />}
      <View style={styles.cardBody}>
        <ThemedText type="small" style={styles.cardTitle} numberOfLines={2}>{article.title}</ThemedText>
        <View style={styles.cardMeta}>
          <ThemedText type="small" style={styles.metaText}>{article.sourceName ?? 'Unknown'}</ThemedText>
          <ThemedText type="small" style={styles.metaDot}>·</ThemedText>
          <ThemedText type="small" style={styles.metaText}>{fmtDate(article.publishedAt)}</ThemedText>
          {article.category && (
            <>
              <ThemedText type="small" style={styles.metaDot}>·</ThemedText>
              <ThemedText type="small" style={styles.metaText}>{CAT_LABELS[article.category] ?? article.category}</ThemedText>
            </>
          )}
        </View>
        <View style={styles.cardTags}>
          {article.alertTier && (
            <View style={[styles.tag, { borderColor: tierColor!, backgroundColor: `${tierColor}18` }]}>
              <ThemedText type="small" style={[styles.tagText, { color: tierColor! }]}>{article.alertTier}</ThemedText>
            </View>
          )}
          {article.sentiment && sentColor && (
            <View style={[styles.tag, { borderColor: sentColor, backgroundColor: `${sentColor}18` }]}>
              <ThemedText type="small" style={[styles.tagText, { color: sentColor }]}>{article.sentiment}</ThemedText>
            </View>
          )}
          {article.impactGhsMid != null && (
            <ThemedText type="small" style={[styles.tagText, { color: '#FFD000' }]}>{fmtGhs(article.impactGhsMid)}</ThemedText>
          )}
        </View>
      </View>
    </View>
  );
}

function FilterChip({ label, active, onPress, activeColor }: { label: string; active: boolean; onPress: () => void; activeColor: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? `${activeColor}20` : theme.backgroundElement,
          borderColor: active ? activeColor : 'transparent' },
      ]}
    >
      <ThemedText type="small" style={[styles.chipText, { color: active ? activeColor : theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NewsScreen() {
  const theme = useTheme();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cat?: string) => {
    setError(null);
    try {
      const data = await fetchNews(cat);
      setArticles(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleScrape() {
    setScraping(true);
    try {
      const res = await triggerScrape();
      await load(category ?? undefined);
      alert(`Scrape done — ${res.newArticles} new articles`);
    } catch (e) {
      alert(`Scrape failed: ${e}`);
    } finally {
      setScraping(false);
    }
  }

  function handleCat(cat: string | null) {
    setCategory(cat);
    setLoading(true);
    load(cat ?? undefined);
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
        <View style={[styles.pageHeader, { borderBottomColor: theme.backgroundElement }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={{ fontSize: 22, fontWeight: '700' }}>News Feed</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              Live-scraped risk news · MTN Ghana
            </ThemedText>
          </View>
          <Pressable
            onPress={handleScrape}
            disabled={scraping}
            style={[styles.scrapeBtn, { opacity: scraping ? 0.5 : 1 }]}
          >
            <ThemedText type="small" style={{ color: '#FFD000', fontWeight: '700', fontSize: 12 }}>
              {scraping ? 'Scraping…' : '↻ Scrape'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, gap: Spacing.one }}>
          <FilterChip label="All" active={category == null} onPress={() => handleCat(null)} activeColor="#FFD000" />
          {CATEGORIES.map(cat => (
            <FilterChip key={cat} label={CAT_LABELS[cat]!} active={category === cat}
              onPress={() => handleCat(cat)} activeColor="#60a5fa" />
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, Platform.OS !== 'web' && { paddingBottom: BottomTabInset + Spacing.three }]}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#FFD000"
          onRefresh={() => { setRefreshing(true); load(category ?? undefined); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FFD000" style={{ marginTop: Spacing.five }} />
        ) : error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" style={{ color: '#ef4444' }}>{error}</ThemedText>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              No articles yet.{'\n'}Tap "↻ Scrape" to fetch the latest news.
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: Spacing.one }}>
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} bg={theme.backgroundElement} border={theme.backgroundSelected} />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  scrapeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,208,0,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,208,0,0.3)',
  },
  filterScroll: { flexShrink: 0 },
  scroll: { padding: Spacing.two, gap: Spacing.one },
  card: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tierStripe: { width: 3 },
  cardBody: { flex: 1, padding: Spacing.two, gap: 4 },
  cardTitle: { fontWeight: '600', fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  metaText: { fontSize: 11, opacity: 0.6 },
  metaDot: { fontSize: 11, opacity: 0.4 },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
  errorBox: { margin: Spacing.three, padding: Spacing.two, borderRadius: Spacing.two },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.five },
});
