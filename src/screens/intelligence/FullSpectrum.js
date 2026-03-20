import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';
import { mcpChat } from '../../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';
// MCP gateway handles all AI routing (Build #70)
const PERPLEXITY_API_KEY = '';
const TAVILY_API_KEY = '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';
const EXA_API_KEY = 'b27bdba9-bd2a-49fd-a4ef-d096cdfe66eb';
const XAI_API_KEY = '';
const MXBAI_API_KEY = 'mxb_1vHGNsbhgA5weMKLIEpGRXPlndGN';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 're', label: 'RE' },
  { id: 'finance', label: 'Finance' },
  { id: 'news', label: 'News' },
  { id: 'sports', label: 'Sports' },
  { id: 'medical', label: 'Medical' },
];

const SOURCE_COLORS = {
  perplexity: '#7C3AED',
  tavily: '#2563EB',
  exa: '#059669',
  grok: '#EC4899',
  claude: C.gold,
};

const TRENDING = [
  { rank: '01', title: 'Impact of LLMs on Venture Capital', trending: true },
  { rank: '02', title: 'Real Estate Foreclosure Heatmap', trending: true },
  { rank: '03', title: 'Semiconductor Supply Chain Resilience', trending: true },
  { rank: '04', title: 'AI Governance: Navigating the New Frontier', trending: false },
  { rank: '05', title: 'Quantum Computing Synthesis: 2024 Outlook', trending: true },
];

const ARENA_CARDS = [
  {
    id: 'lakers',
    abbr: 'LAL',
    name: 'Lakers',
    opponent: 'GSW',
    score1: 102,
    score2: 98,
    status: 'Live • Q4 2:15',
    liveColor: '#22C55E',
    bgColor: '#4C1D95',
    tag: 'Betting Intel',
  },
  {
    id: 'cowboys',
    abbr: 'DAL',
    name: 'Cowboys',
    opponent: 'PHI',
    score1: null,
    score2: null,
    status: 'Sun, 4:25 PM',
    liveColor: '#6B7280',
    bgColor: '#1E3A5F',
    winProb: '64.2%',
  },
];

export default function FullSpectrum({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searching, setSearching] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [results, setResults] = useState([]);
  const [synthesis, setSynthesis] = useState('');
  const [savedIntel, setSavedIntel] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const inputRef = useRef(null);

  const runFullSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setResults([]);
    setSynthesis('');
    setShowSynthesis(false);

    const allResults = [];

    // Perplexity search
    try {
      const pRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: searchQuery }],
          max_tokens: 400,
        }),
      });
      const pData = await pRes.json();
      if (pData?.choices?.[0]?.message?.content) {
        allResults.push({
          id: 'perplexity_1',
          source: 'perplexity',
          title: 'Perplexity: ' + searchQuery.slice(0, 50),
          snippet: pData.choices[0].message.content.slice(0, 200),
          url: 'perplexity.ai',
        });
      }
    } catch {}

    // Tavily search
    try {
      const tRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: searchQuery,
          search_depth: 'basic',
          max_results: 3,
        }),
      });
      const tData = await tRes.json();
      if (tData?.results) {
        tData.results.slice(0, 3).forEach((r, i) => {
          allResults.push({
            id: `tavily_${i}`,
            source: 'tavily',
            title: r.title || searchQuery,
            snippet: r.content?.slice(0, 200) || r.url,
            url: r.url,
          });
        });
      }
    } catch {}

    // Exa search
    try {
      const eRes = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${EXA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          numResults: 3,
          useAutoprompt: true,
          type: 'neural',
        }),
      });
      const eData = await eRes.json();
      if (eData?.results) {
        eData.results.slice(0, 3).forEach((r, i) => {
          allResults.push({
            id: `exa_${i}`,
            source: 'exa',
            title: r.title || r.url,
            snippet: r.text?.slice(0, 200) || '',
            url: r.url,
          });
        });
      }
    } catch {}

    // Grok real-time via xAI
    try {
      const gRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: `Real-time intelligence on: ${searchQuery}. Provide a brief 2-3 sentence current analysis.`,
            },
          ],
          max_tokens: 200,
        }),
      });
      const gData = await gRes.json();
      if (gData?.choices?.[0]?.message?.content) {
        allResults.push({
          id: 'grok_1',
          source: 'grok',
          title: 'Grok Real-Time: ' + searchQuery.slice(0, 40),
          snippet: gData.choices[0].message.content,
          url: 'x.ai/grok',
        });
      }
    } catch {}

    setResults(allResults);
    setSearching(false);

    if (allResults.length > 0) {
      runSynthesis(searchQuery, allResults);
    }
  }, []);

  const runSynthesis = async (searchQuery, allResults) => {
    setSynthesizing(true);
    setShowSynthesis(true);
    try {
      const snippets = allResults
        .slice(0, 5)
        .map((r) => `[${r.source.toUpperCase()}] ${r.title}: ${r.snippet}`)
        .join('\n\n');

      const mcpRes = await mcpChat({
        message: `Query: "${searchQuery}"\n\nSearch Results:\n${snippets}\n\nProvide a 3-4 sentence synthesis with key takeaways.`,
        model: 'pro',
        vertical: 'general',
      });
      if (mcpRes.ok && mcpRes.response) {
        setSynthesis(mcpRes.response);
      }
    } catch {
      setSynthesis('Unable to synthesize results. Review individual sources above.');
    } finally {
      setSynthesizing(false);
    }
  };

  const saveIntel = async (item) => {
    setSaving(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/saved_intel`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          source: item.source,
          title: item.title,
          snippet: item.snippet,
          url: item.url,
          filter: activeFilter,
          saved_at: new Date().toISOString(),
        }),
      });
      setSavedIntel((prev) => [...prev, item.id]);
      Alert.alert('Saved', 'Intel saved to your library.');
    } catch {
      Alert.alert('Error', 'Failed to save intel.');
    } finally {
      setSaving(false);
    }
  };

  const filteredResults =
    activeFilter === 'all'
      ? results
      : results.filter(
          (r) =>
            (activeFilter === 're' && (r.title.toLowerCase().includes('real estate') || r.title.toLowerCase().includes('property'))) ||
            (activeFilter === 'finance' && (r.title.toLowerCase().includes('finance') || r.source === 'tavily')) ||
            (activeFilter === 'news' && r.source === 'perplexity') ||
            (activeFilter === 'sports' && r.title.toLowerCase().includes('sport')) ||
            (activeFilter === 'medical' && r.title.toLowerCase().includes('health'))
        );

  return (
    <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Full Spectrum Intel" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Full Spectrum</Text>
            <Text style={styles.headerSubtitle}>INTELLIGENCE HUB</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Global Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search all intelligence sources..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            returnKeyType="search"
            onSubmitEditing={() => runFullSearch(query)}
          />
          {searching ? (
            <ActivityIndicator color={C.gold} size="small" />
          ) : (
            <TouchableOpacity onPress={() => runFullSearch(query)} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>GO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Source Indicators */}
        <View style={styles.sourceRow}>
          {Object.entries(SOURCE_COLORS).map(([src, color]) => (
            <View key={src} style={styles.sourceTag}>
              <View style={[styles.sourceDot, { backgroundColor: color }]} />
              <Text style={styles.sourceLabel}>{src.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {/* Vertical Filter Tabs */}
        <View style={styles.filterSidebar}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, activeFilter === tab.id && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text style={[styles.filterTabText, activeFilter === tab.id && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results Feed */}
        <ScrollView style={styles.resultsFeed} showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsFeedContent}>
          {/* AI Synthesis Panel */}
          {showSynthesis && (
            <View style={styles.synthesisPanel}>
              <View style={styles.synthesisPanelHeader}>
                <View style={styles.synthesisPanelDot} />
                <Text style={styles.synthesisPanelTitle}>CLAUDE SYNTHESIS</Text>
              </View>
              {synthesizing ? (
                <View style={styles.synthesisLoading}>
                  <ActivityIndicator color={C.gold} size="small" />
                  <Text style={styles.synthesisLoadingText}>Synthesizing {results.length} sources...</Text>
                </View>
              ) : (
                <Text style={styles.synthesisText}>{synthesis}</Text>
              )}
            </View>
          )}

          {/* Trending (when no search) */}
          {results.length === 0 && !searching && (
            <>
              {/* My Arena */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>MY ARENA</Text>
                <Text style={styles.sectionAction}>Edit Favorites</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.arenaScroll}>
                {ARENA_CARDS.map((card) => (
                  <View key={card.id} style={styles.arenaCard}>
                    <View style={styles.arenaCardTop}>
                      <View style={styles.arenaTeamRow}>
                        <View style={[styles.arenaTeamBubble, { backgroundColor: card.bgColor }]}>
                          <Text style={styles.arenaTeamAbbr}>{card.abbr}</Text>
                        </View>
                        <View>
                          <Text style={styles.arenaTeamName}>{card.name}</Text>
                          <Text style={[styles.arenaStatus, { color: card.liveColor }]}>{card.status}</Text>
                        </View>
                      </View>
                      {card.tag && (
                        <View style={styles.arenaBetTag}>
                          <Text style={styles.arenaBetTagText}>{card.tag}</Text>
                        </View>
                      )}
                    </View>
                    {card.score1 !== null ? (
                      <View style={styles.arenaScoreRow}>
                        <View style={styles.arenaScore}>
                          <Text style={styles.arenaScoreNum}>{card.score1}</Text>
                          <Text style={styles.arenaScoreTeam}>{card.abbr}</Text>
                        </View>
                        <Text style={styles.arenaVS}>VS</Text>
                        <View style={styles.arenaScore}>
                          <Text style={styles.arenaScoreNum}>{card.score2}</Text>
                          <Text style={styles.arenaScoreTeam}>{card.opponent}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.arenaWinProb}>
                        <Text style={styles.arenaWinProbText}>
                          Projected Win:{' '}
                          <Text style={styles.arenaWinProbValue}>{card.winProb}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Profound Insights */}
              <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>PROFOUND INSIGHTS</Text>
                <Text style={styles.sectionAction}>View All</Text>
              </View>
              <View style={styles.insightMainCard}>
                <View style={styles.insightMainImageBox}>
                  <View style={styles.insightMainTag}>
                    <Text style={styles.insightMainTagText}>TECH</Text>
                  </View>
                  <Text style={styles.insightMainTitle}>Quantum Computing Synthesis: 2024 Outlook</Text>
                </View>
              </View>
              <View style={styles.insightSecondGrid}>
                {[
                  { tag: 'FINANCE', title: 'Venture Flow Dynamics' },
                  { tag: 'LEGAL', title: 'IP Strategy Roadmap' },
                ].map((item) => (
                  <View key={item.tag} style={styles.insightSecondCard}>
                    <View style={styles.insightSecondImageBox}>
                      <Text style={styles.insightSecondEmoji}>📊</Text>
                    </View>
                    <View>
                      <Text style={styles.insightSecondTag}>{item.tag}</Text>
                      <Text style={styles.insightSecondTitle}>{item.title}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Trending Intelligence */}
              <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>TRENDING INTELLIGENCE</Text>
              </View>
              {TRENDING.map((item) => (
                <TouchableOpacity
                  key={item.rank}
                  style={styles.trendingItem}
                  onPress={() => {
                    setQuery(item.title);
                    runFullSearch(item.title);
                  }}
                >
                  <View style={styles.trendingLeft}>
                    <Text style={styles.trendingRank}>{item.rank}</Text>
                    <Text style={styles.trendingTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.trendingArrow}>↗</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Search Loading */}
          {searching && (
            <View style={styles.searchingState}>
              <ActivityIndicator color={C.gold} size="large" />
              <Text style={styles.searchingText}>Querying all intelligence sources...</Text>
              <View style={styles.searchingSourceRow}>
                {Object.keys(SOURCE_COLORS).map((src) => (
                  <View key={src} style={styles.searchingSource}>
                    <View style={[styles.searchingSourceDot, { backgroundColor: SOURCE_COLORS[src] }]} />
                    <Text style={styles.searchingSourceText}>{src}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Results */}
          {!searching && filteredResults.length > 0 && (
            <>
              <View style={styles.resultsCountRow}>
                <Text style={styles.resultsCount}>{filteredResults.length} RESULTS</Text>
                <Text style={styles.resultsQuery}>"{query}"</Text>
              </View>
              {filteredResults.map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <View style={styles.resultCardTop}>
                    <View
                      style={[
                        styles.resultSourceBadge,
                        { backgroundColor: SOURCE_COLORS[item.source] + '20' },
                      ]}
                    >
                      <View
                        style={[styles.resultSourceDot, { backgroundColor: SOURCE_COLORS[item.source] }]}
                      />
                      <Text style={[styles.resultSourceText, { color: SOURCE_COLORS[item.source] }]}>
                        {item.source.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.saveIntelBtn, savedIntel.includes(item.id) && styles.savedIntelBtn]}
                      onPress={() => saveIntel(item)}
                      disabled={saving || savedIntel.includes(item.id)}
                    >
                      <Text style={styles.saveIntelBtnText}>
                        {savedIntel.includes(item.id) ? '✓ SAVED' : '+ SAVE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultSnippet}>{item.snippet}</Text>
                  <Text style={styles.resultUrl}>{item.url}</Text>
                </View>
              ))}
            </>
          )}

          {/* No results after search */}
          {!searching && results.length === 0 && query.trim() && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsIcon}>🔎</Text>
              <Text style={styles.noResultsText}>No results found. Try a different query.</Text>
            </View>
          )}

          {/* IP Guard CTA */}
          <View style={[styles.ipGuardCard, { marginTop: 16 }]}>
            <View style={styles.ipGuardLeft}>
              <Text style={styles.ipGuardIcon}>🛡</Text>
              <Text style={styles.ipGuardText}>IP & Patent Guard</Text>
            </View>
            <TouchableOpacity style={styles.ipGuardBtn}>
              <Text style={styles.ipGuardBtnText}>ACTIVATE</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.gold,
    fontWeight: '900',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerRight: {},
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#22C55E20',
    borderWidth: 1,
    borderColor: '#22C55E40',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: C.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  searchBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sourceLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  filterSidebar: {
    width: 52,
    paddingTop: 12,
    paddingLeft: 8,
    gap: 4,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: C.gold + '20',
  },
  filterTabText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    color: C.gold,
  },
  resultsFeed: {
    flex: 1,
  },
  resultsFeedContent: {
    padding: 12,
    paddingBottom: 40,
  },
  synthesisPanel: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '40',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  synthesisPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  synthesisPanelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  synthesisPanelTitle: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  synthesisLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  synthesisLoadingText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  synthesisText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  sectionAction: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  arenaScroll: {
    marginHorizontal: -12,
    paddingLeft: 12,
  },
  arenaCard: {
    width: 240,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    gap: 12,
  },
  arenaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  arenaTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arenaTeamBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaTeamAbbr: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  arenaTeamName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  arenaStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  arenaBetTag: {
    backgroundColor: C.gold + '18',
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  arenaBetTagText: {
    color: C.gold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arenaScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  arenaScore: {
    alignItems: 'center',
  },
  arenaScoreNum: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  arenaScoreTeam: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  arenaVS: {
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '700',
    fontSize: 12,
  },
  arenaWinProb: {
    marginTop: 6,
  },
  arenaWinProbText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '500',
  },
  arenaWinProbValue: {
    color: C.gold,
    fontWeight: '800',
  },
  insightMainCard: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  insightMainImageBox: {
    height: 180,
    backgroundColor: '#1A1A2E',
    justifyContent: 'flex-end',
    padding: 14,
  },
  insightMainTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: C.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  insightMainTagText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  insightMainTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  insightSecondGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  insightSecondCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  insightSecondImageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightSecondEmoji: {
    fontSize: 32,
  },
  insightSecondTag: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  insightSecondTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trendingRank: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  trendingArrow: {
    color: C.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  searchingState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  searchingText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
  },
  searchingSourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  searchingSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchingSourceDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  searchingSourceText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
  },
  resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsCount: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  resultsQuery: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  resultCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resultSourceDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  resultSourceText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  saveIntelBtn: {
    backgroundColor: C.gold + '18',
    borderWidth: 1,
    borderColor: C.gold + '40',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  savedIntelBtn: {
    backgroundColor: '#22C55E20',
    borderColor: '#22C55E40',
  },
  saveIntelBtnText: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  resultSnippet: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    lineHeight: 18,
  },
  resultUrl: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  noResultsIcon: {
    fontSize: 36,
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    textAlign: 'center',
  },
  ipGuardCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ipGuardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ipGuardIcon: {
    fontSize: 18,
  },
  ipGuardText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ipGuardBtn: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ipGuardBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
