/**
 * SaintSal Labs — Search Screen
 * Gemini 2.0 Flash with Google Search grounding
 * Premium dark charcoal + gold accent design
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Linking, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius } from '@/config/theme';
import SALHeader from '@/components/SALHeader';
import { geminiSearch } from '@/lib/api';

type Source = { title: string; url: string; snippet: string };

function extractDomain(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return host.length > 28 ? host.slice(0, 25) + '…' : host;
  } catch {
    return url;
  }
}

/** Animated pill that fades in with a stagger delay */
function SourcePill({ label, delay }: { label: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacity]);

  return (
    <Animated.View style={[styles.sourcePill, { opacity }]}>
      <Text style={styles.sourcePillText}>{label}</Text>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [deepMode, setDeepMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setAnswer('');
    setSources([]);
    setHasSearched(true);

    try {
      const searchQuery = deepMode
        ? `Provide a comprehensive, detailed analysis with sources: ${q}`
        : q;
      const data = await geminiSearch(searchQuery);
      setAnswer(data.answer);
      setSources(data.sources);
    } catch (err: any) {
      setAnswer(`Search error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Search" subtitle="Gemini + Google Search" />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Ask anything…"
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            selectionColor={Colors.gold}
          />
          <TouchableOpacity
            style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={!query.trim() || isSearching}
            activeOpacity={0.7}
          >
            {isSearching ? (
              <ActivityIndicator color="#0A0A0F" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Deep / Quick toggle */}
        <TouchableOpacity
          style={[styles.deepToggle, deepMode && styles.deepToggleActive]}
          onPress={() => setDeepMode(!deepMode)}
          activeOpacity={0.7}
        >
          <Text style={[styles.deepToggleText, deepMode && styles.deepToggleTextActive]}>
            {deepMode ? '🔬 Deep Research' : '⚡ Quick Search'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* Loading state */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.gold} size="large" />
            <Text style={styles.loadingText}>
              {deepMode ? 'Deep researching with Gemini…' : 'Searching with Gemini + Google…'}
            </Text>
            <View style={styles.sourcePills}>
              <SourcePill label="Google" delay={0} />
              <SourcePill label="Gemini" delay={200} />
            </View>
          </View>
        )}

        {/* AI Answer card */}
        {!!answer && !isSearching && (
          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <View style={styles.salBadge}>
                <Text style={styles.salBadgeText}>SAL</Text>
              </View>
              <Text style={styles.answerLabel}>AI Answer</Text>
              {sources.length > 0 && (
                <Text style={styles.answerSourceCount}>
                  {sources.length} source{sources.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        )}

        {/* Source cards */}
        {sources.length > 0 && !isSearching && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {sources.length} SOURCE{sources.length !== 1 ? 'S' : ''}
            </Text>
            {sources.map((source, i) => (
              <TouchableOpacity
                key={`${source.url}-${i}`}
                style={styles.resultCard}
                onPress={() => Linking.openURL(source.url)}
                activeOpacity={0.7}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.resultNumber}>
                    <Text style={styles.resultNumberText}>{i + 1}</Text>
                  </View>
                  <View style={styles.resultDomainBadge}>
                    <Text style={styles.resultDomainText}>{extractDomain(source.url)}</Text>
                  </View>
                </View>
                <Text style={styles.resultTitle} numberOfLines={2}>{source.title}</Text>
                {!!source.snippet && (
                  <Text style={styles.resultSnippet} numberOfLines={3}>{source.snippet}</Text>
                )}
                <Text style={styles.resultUrl} numberOfLines={1}>{source.url}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isSearching && !hasSearched && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Search the Web</Text>
            <Text style={styles.emptyDesc}>
              Powered by Gemini 2.0 Flash with{'\n'}
              Google Search grounding for real-time results.
            </Text>
            <View style={styles.emptyDivider} />
            <Text style={styles.emptyHint}>
              Toggle Deep Research for comprehensive analysis.
            </Text>
          </View>
        )}

        {/* No results after search */}
        {!isSearching && hasSearched && !answer && sources.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤔</Text>
            <Text style={styles.emptyTitle}>No Results</Text>
            <Text style={styles.emptyDesc}>
              Try rephrasing your search or enable Deep Research.
            </Text>
          </View>
        )}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  /* ── Search bar ── */
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  searchBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  searchBtnDisabled: {
    opacity: 0.4,
  },
  searchBtnText: {
    color: '#0A0A0F',
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  /* ── Deep / Quick toggle ── */
  deepToggle: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  deepToggleActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  deepToggleText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
  },
  deepToggleTextActive: {
    color: Colors.gold,
  },

  /* ── Loading ── */
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
  sourcePills: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  sourcePill: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  sourcePillText: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  /* ── AI Answer card ── */
  answerCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.25)',
    padding: Spacing.lg,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  salBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  salBadgeText: {
    color: '#0A0A0F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  answerLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  answerSourceCount: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  answerText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    lineHeight: 24,
  },

  /* ── Source cards ── */
  resultsSection: {
    paddingHorizontal: Spacing.lg,
  },
  resultsLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resultNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultNumberText: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  resultDomainBadge: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resultDomainText: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  resultTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultSnippet: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: 8,
  },
  resultUrl: {
    color: Colors.gold,
    fontSize: FontSize.xs,
  },

  /* ── Empty state ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge + Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
