/**
 * SaintSal Labs — Search Screen
 * Perplexity-style multi-source search with citations
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Linking, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius } from '@/config/theme';
import SALHeader from '@/components/SALHeader';
import { salClient } from '@/lib/api';
import type { SearchResult } from '@/types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [deepMode, setDeepMode] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults([]);
    setAnswer('');

    try {
      const data = await salClient.search(query, 15, deepMode);
      setResults(data.results);
      setAnswer(data.answer);
      setSources(data.sources_used);
    } catch (err: any) {
      setAnswer(`Search error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Search" subtitle="Multi-source intelligence" />

      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search across Exa, Tavily, Azure AI..."
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={!query.trim() || isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#0A0A0F" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.deepToggle, deepMode && styles.deepToggleActive]}
          onPress={() => setDeepMode(!deepMode)}
        >
          <Text style={[styles.deepToggleText, deepMode && styles.deepToggleTextActive]}>
            {deepMode ? '🔬 Deep Research' : '⚡ Quick Search'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Loading state */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.gold} size="large" />
            <Text style={styles.loadingText}>
              {deepMode ? 'Deep researching with Exa + Perplexity...' : 'Searching across all sources...'}
            </Text>
            <View style={styles.sourcePills}>
              {['Exa', 'Tavily', 'Azure AI'].map((s) => (
                <View key={s} style={styles.sourcePill}>
                  <Text style={styles.sourcePillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Answer */}
        {answer && (
          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <View style={styles.salBadge}>
                <Text style={styles.salBadgeText}>SAL</Text>
              </View>
              <Text style={styles.answerLabel}>AI Answer</Text>
              {sources.length > 0 && (
                <Text style={styles.answerSources}>via {sources.join(', ')}</Text>
              )}
            </View>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {results.length} RESULTS
            </Text>
            {results.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resultCard}
                onPress={() => Linking.openURL(r.url)}
                activeOpacity={0.7}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.resultNumber}>
                    <Text style={styles.resultNumberText}>{i + 1}</Text>
                  </View>
                  <View style={styles.resultSourceBadge}>
                    <Text style={styles.resultSourceText}>{r.source}</Text>
                  </View>
                  {r.score > 0 && (
                    <Text style={styles.resultScore}>{(r.score * 100).toFixed(0)}%</Text>
                  )}
                </View>
                <Text style={styles.resultTitle} numberOfLines={2}>{r.title}</Text>
                <Text style={styles.resultSnippet} numberOfLines={3}>{r.snippet}</Text>
                <Text style={styles.resultUrl} numberOfLines={1}>{r.url}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isSearching && results.length === 0 && !answer && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Multi-Source Search</Text>
            <Text style={styles.emptyDesc}>
              Search across Exa (semantic), Tavily (factual),{'\n'}
              and Azure AI Search (knowledge base) simultaneously.
            </Text>
            <Text style={styles.emptyHint}>
              Toggle Deep Research for Perplexity-powered synthesis.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  // Search
  searchContainer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  searchRow: { flexDirection: 'row', gap: Spacing.sm },
  searchInput: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    color: Colors.textPrimary, fontSize: FontSize.md,
  },
  searchBtn: { backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { color: '#0A0A0F', fontSize: FontSize.md, fontWeight: '700' },
  deepToggle: {
    alignSelf: 'flex-start', marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  deepToggleActive: { borderColor: Colors.purple, backgroundColor: `${Colors.purple}15` },
  deepToggleText: { color: Colors.textTertiary, fontSize: FontSize.sm },
  deepToggleTextActive: { color: Colors.purple },
  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.huge },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: Spacing.md },
  sourcePills: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  sourcePill: { backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  sourcePillText: { color: Colors.textTertiary, fontSize: FontSize.xs },
  // Answer
  answerCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: `${Colors.gold}30`, padding: Spacing.lg,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  salBadge: { backgroundColor: Colors.gold, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  salBadgeText: { color: '#0A0A0F', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  answerLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  answerSources: { color: Colors.textMuted, fontSize: FontSize.xs },
  answerText: { color: Colors.textPrimary, fontSize: FontSize.md, lineHeight: 24 },
  // Results
  resultsSection: { paddingHorizontal: Spacing.lg },
  resultsLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },
  resultCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 0.5,
    borderColor: Colors.border, padding: Spacing.lg, marginBottom: Spacing.sm,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  resultNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.bgTertiary, alignItems: 'center', justifyContent: 'center' },
  resultNumberText: { color: Colors.gold, fontSize: FontSize.xs, fontWeight: '700' },
  resultSourceBadge: { backgroundColor: Colors.bgTertiary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  resultSourceText: { color: Colors.textTertiary, fontSize: 10, fontWeight: '600' },
  resultScore: { color: Colors.green, fontSize: FontSize.xs, fontWeight: '600' },
  resultTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600', marginBottom: 4 },
  resultSnippet: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: 6 },
  resultUrl: { color: Colors.blue, fontSize: FontSize.xs },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge, paddingHorizontal: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.sm },
  emptyDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.md },
  emptyHint: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center' },
});
