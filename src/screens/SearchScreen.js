/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SEARCH SCREEN
   Gemini 2.5 Flash with Google Search grounding
   Live web results + sources
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Linking,
} from 'react-native';
import { C } from '../config/theme';
import { searchGemini } from '../lib/api';

const SEARCH_STARTERS = [
  'Latest AI model releases and benchmarks March 2026',
  'Fed interest rate decision and market impact',
  'Best cities to invest in real estate Q2 2026',
  'OpenAI vs Anthropic vs Google — who is winning the AI race',
  'Bitcoin price analysis and on-chain metrics',
  'SaintSal Labs and HACP Protocol news',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (q) => {
    const text = q || query;
    if (!text?.trim() || loading) return;
    setQuery(text);
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await searchGemini(text.trim());
      setResults(data);
    } catch (e) {
      setError('Search failed. Check your connection.');
    }
    setLoading(false);
  };

  const reset = () => {
    setResults(null);
    setQuery('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SAL Search</Text>
        <Text style={styles.headerSub}>Powered by Gemini + Google Search grounding</Text>
      </View>

      {/* Search input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search anything..."
          placeholderTextColor="#444"
          returnKeyType="search"
          onSubmitEditing={() => search()}
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => search()}
          disabled={loading || !query.trim()}
          style={[styles.searchBtn, { backgroundColor: query.trim() && !loading ? C.amber : '#1A1A22' }]}
        >
          {loading
            ? <ActivityIndicator size="small" color="#000" />
            : <Text style={{ color: query.trim() ? '#000' : '#444', fontSize: 14, fontWeight: '700' }}>↵</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">

        {/* Starters */}
        {!results && !loading && (
          <View>
            <Text style={styles.sectionLabel}>TRENDING SEARCHES</Text>
            {SEARCH_STARTERS.map((s, i) => (
              <TouchableOpacity key={i} onPress={() => search(s)} style={styles.starter}>
                <Text style={styles.starterIcon}>🔍</Text>
                <Text style={styles.starterText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={() => search()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.amber} />
            <Text style={styles.loadingText}>Searching the web...</Text>
          </View>
        )}

        {/* Results */}
        {results && !loading && (
          <View>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsLabel}>SAL SEARCH RESULTS</Text>
              <TouchableOpacity onPress={reset}>
                <Text style={styles.newSearch}>New Search</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.queryTag}>
              <Text style={styles.queryTagText}>"{query}"</Text>
            </View>

            {/* Answer */}
            <View style={styles.answerBox}>
              <Text style={styles.answerText} selectable>{results.answer}</Text>
            </View>

            {/* Sources */}
            {results.sources?.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sectionLabel}>SOURCES</Text>
                {results.sources.map((src, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => src.url && Linking.openURL(src.url)}
                    style={styles.sourceCard}
                  >
                    <View style={styles.sourceNum}>
                      <Text style={styles.sourceNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sourceTitle} numberOfLines={2}>{src.title}</Text>
                      {src.url ? (
                        <Text style={styles.sourceUrl} numberOfLines={1}>
                          {src.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.sourceArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Follow-up starters */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionLabel}>RELATED SEARCHES</Text>
              {[
                `More detail on: ${query.slice(0, 40)}...`,
                `Latest news about: ${query.split(' ').slice(0, 4).join(' ')}`,
                `Investment implications of ${query.split(' ').slice(0, 3).join(' ')}`,
              ].map((s, i) => (
                <TouchableOpacity key={i} onPress={() => search(s)} style={styles.relatedBtn}>
                  <Text style={styles.relatedText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.borderSm, backgroundColor: C.sidebar,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.amber },
  headerSub: { fontSize: 11, color: C.textGhost, marginTop: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, backgroundColor: '#111118', borderRadius: 14,
    borderWidth: 1, borderColor: '#1E1E2A', padding: 6,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingHorizontal: 8, paddingVertical: 7 },
  searchBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 9, color: '#333', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  starter: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 10, backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', marginBottom: 8 },
  starterIcon: { fontSize: 14 },
  starterText: { fontSize: 13.5, color: '#888', flex: 1 },
  errorBox: { backgroundColor: '#EF44440A', borderWidth: 1, borderColor: '#EF444422', borderRadius: 10, padding: 16, alignItems: 'center', gap: 10 },
  errorText: { color: '#EF4444', fontSize: 13 },
  retryBtn: { backgroundColor: '#EF444420', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  retryText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  loadingText: { fontSize: 13, color: C.textGhost },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultsLabel: { fontSize: 9, color: C.amber, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  newSearch: { fontSize: 12, color: C.amber, fontWeight: '600' },
  queryTag: { backgroundColor: C.amber + '12', borderWidth: 1, borderColor: C.amber + '28', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 14 },
  queryTagText: { fontSize: 12, color: C.amber, fontStyle: 'italic' },
  answerBox: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', borderRadius: 12, padding: 16 },
  answerText: { fontSize: 14, color: '#D4D1CB', lineHeight: 22 },
  sourceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 9, backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', marginBottom: 8 },
  sourceNum: { width: 24, height: 24, borderRadius: 6, backgroundColor: C.amber + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sourceNumText: { fontSize: 11, fontWeight: '800', color: C.amber },
  sourceTitle: { fontSize: 13, color: '#C8C5BE', fontWeight: '500', lineHeight: 18 },
  sourceUrl: { fontSize: 11, color: '#444', marginTop: 2 },
  sourceArrow: { fontSize: 14, color: '#333' },
  relatedBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1A1A22', marginBottom: 6 },
  relatedText: { fontSize: 12.5, color: '#666' },
});
