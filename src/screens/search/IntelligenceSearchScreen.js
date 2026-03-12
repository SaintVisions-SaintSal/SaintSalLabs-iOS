import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated, ActivityIndicator,
} from 'react-native';
import { C } from '../../config/theme';
import { SALMark } from '../../components';
import { searchGemini } from '../../lib/api';

const INSIGHTS = [
  {
    tag: 'TECH',
    tagColor: C.purple,
    title: 'Quantum Trajectory',
    desc: 'Analyzing the shift from NISQ to fault-tolerant systems in 2026.',
    placeholder: '⚛️',
  },
  {
    tag: 'FINANCE',
    tagColor: C.green,
    title: 'Market Synthesis',
    desc: 'Emerging alpha opportunities in late-cycle macroeconomic pivots.',
    placeholder: '📊',
  },
  {
    tag: 'POLICY',
    tagColor: C.amber,
    title: 'AI Governance',
    desc: 'Global legislative frameworks for frontier foundation models.',
    placeholder: '🏛️',
  },
];

const TRENDING = [
  'Impact of localized LLMs on enterprise security architecture',
  'Semiconductor supply chain resilience strategies for 2026',
  'Central bank digital currencies and institutional adoption',
  'Biotech convergence with AI drug discovery platforms',
];

const SOURCE_FILTERS = [
  { id: 'web', label: '🌐 Web', active: true },
  { id: 'news', label: '📰 News', active: false },
  { id: 'finance', label: '💰 Finance', active: false },
  { id: 'visuals', label: '🖼️ Visuals', active: false },
];

export default function IntelligenceSearchScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [activeFilter, setActiveFilter] = useState('web');
  const scrollRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setResult(null);
    setSources([]);

    try {
      const data = await searchGemini(q);
      setResult(data.answer || 'No results found.');
      setSources(data.sources || []);
    } catch {
      setResult('Search failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingPress = (topic) => {
    setQuery(topic);
    handleSearch(topic);
  };

  const handleInsightPress = (insight) => {
    setQuery(insight.title);
    handleSearch(insight.title);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={36} />
          <Text style={s.headerTitle}>
            SAINTSAL <Text style={s.headerGold}>LABS</Text>
          </Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIcon}>🕘</Text>
          </TouchableOpacity>
          <View style={s.avatarPlaceholder}>
            <Text style={s.avatarText}>U</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        {!result && (
          <View style={s.hero}>
            <Text style={s.heroTitle}>How can we assist your intelligence today?</Text>
            <Text style={s.heroSubtitle}>
              Synthesizing global markets, technology, and policy.
            </Text>
          </View>
        )}

        {/* Profound Insights */}
        {!result && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>PROFOUND INSIGHTS</Text>
              <TouchableOpacity>
                <Text style={s.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.insightsRow}
            >
              {INSIGHTS.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={s.insightCard}
                  onPress={() => handleInsightPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={s.insightImage}>
                    <Text style={s.insightEmoji}>{item.placeholder}</Text>
                    <View style={[s.insightTag, { backgroundColor: C.bg + 'CC' }]}>
                      <Text style={[s.insightTagText, { color: item.tagColor }]}>
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.insightTitle}>{item.title}</Text>
                  <Text style={s.insightDesc} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Intelligence */}
        {!result && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <View style={s.trendingHeader}>
                <Text style={{ fontSize: 14 }}>📈</Text>
                <Text style={s.sectionLabel}>TRENDING INTELLIGENCE</Text>
              </View>
            </View>
            {TRENDING.map((topic, i) => (
              <TouchableOpacity
                key={i}
                style={s.trendingItem}
                onPress={() => handleTrendingPress(topic)}
                activeOpacity={0.7}
              >
                <View style={s.trendingLeft}>
                  <Text style={s.trendingIndex}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text style={s.trendingText}>{topic}</Text>
                </View>
                <Text style={s.trendingArrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={C.gold} />
            <Text style={s.loadingText}>Searching intelligence...</Text>
          </View>
        )}

        {/* Search Result */}
        {result && !loading && (
          <View style={s.resultSection}>
            <View style={s.resultHeader}>
              <SALMark size={24} />
              <Text style={s.resultLabel}>SAL Intelligence</Text>
            </View>
            <View style={s.resultCard}>
              <Text style={s.resultText}>{result}</Text>
            </View>

            {sources.length > 0 && (
              <View style={s.sourcesWrap}>
                <Text style={s.sourcesTitle}>SOURCES</Text>
                {sources.map((src, i) => (
                  <View key={i} style={s.sourceCard}>
                    <View style={s.sourceIcon}>
                      <Text style={{ fontSize: 14 }}>🔗</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.sourceLabel} numberOfLines={1}>
                        {src.title || src.url || `Source ${i + 1}`}
                      </Text>
                      <Text style={s.sourceUrl} numberOfLines={1}>
                        {src.url || ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={s.newSearchBtn}
              onPress={() => {
                setResult(null);
                setSources([]);
                setQuery('');
              }}
              activeOpacity={0.7}
            >
              <Text style={s.newSearchText}>New Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Search Bar */}
      <View style={s.searchBarWrap}>
        <View style={s.searchBar}>
          {/* Filter chips */}
          <View style={s.filterRow}>
            {SOURCE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  s.filterChip,
                  activeFilter === f.id && s.filterChipActive,
                ]}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.filterChipText,
                    activeFilter === f.id && s.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input row */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search intelligence or generate strategic reports..."
              placeholderTextColor={C.textGhost}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
            />
            <TouchableOpacity
              style={[s.sendBtn, query.trim() && !loading ? s.sendBtnActive : null]}
              onPress={() => handleSearch()}
              disabled={loading || !query.trim()}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={[s.sendIcon, query.trim() && { color: C.bg }]}>→</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer row */}
          <View style={s.barFooter}>
            <Text style={s.barVersion}>SaintSal Pro v4.2</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerGold: { color: C.gold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 6 },
  headerBtnIcon: { fontSize: 20, color: C.gold },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.gold + '55',
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: C.textDim },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 200 },

  /* Hero */
  hero: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24, alignItems: 'center' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 15, color: C.textMuted, textAlign: 'center' },

  /* Sections */
  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.gold,
    textTransform: 'uppercase',
  },
  viewAll: { fontSize: 11, fontWeight: '600', color: C.textDim },

  /* Insight Cards */
  insightsRow: { gap: 12 },
  insightCard: {
    width: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.gold + '30',
    backgroundColor: C.bg,
    padding: 14,
  },
  insightImage: {
    height: 100,
    borderRadius: 10,
    backgroundColor: C.bgElevated,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  insightEmoji: { fontSize: 32 },
  insightTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  insightTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  insightDesc: { fontSize: 12, color: C.textMuted, lineHeight: 17 },

  /* Trending */
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  trendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  trendingIndex: { fontSize: 16, fontWeight: '500', color: C.gold, fontFamily: 'monospace' },
  trendingText: { fontSize: 14, color: C.textSub, flex: 1 },
  trendingArrow: { fontSize: 16, color: C.textDim },

  /* Loading */
  loadingWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 13, color: C.textMuted },

  /* Result */
  resultSection: { paddingHorizontal: 20, paddingTop: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultLabel: { fontSize: 13, fontWeight: '700', color: C.gold, letterSpacing: 0.5 },
  resultCard: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 20,
  },
  resultText: { fontSize: 14, lineHeight: 22, color: C.textSub },
  sourcesWrap: { marginBottom: 20 },
  sourcesTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textDim,
    marginBottom: 10,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: C.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceLabel: { fontSize: 13, fontWeight: '600', color: C.text },
  sourceUrl: { fontSize: 11, color: C.textDim, marginTop: 2 },
  newSearchBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.gold + '44',
    backgroundColor: C.gold + '12',
    marginBottom: 20,
  },
  newSearchText: { fontSize: 13, fontWeight: '700', color: C.gold },

  /* Search Bar */
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: C.bg,
  },
  searchBar: {
    backgroundColor: C.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterChipActive: { backgroundColor: C.gold + '22' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: C.textDim },
  filterChipTextActive: { color: C.gold },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: C.gold },
  sendIcon: { fontSize: 18, fontWeight: '700', color: C.textDim },
  barFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  barVersion: { fontSize: 10, color: C.textGhost, fontWeight: '500' },
});
