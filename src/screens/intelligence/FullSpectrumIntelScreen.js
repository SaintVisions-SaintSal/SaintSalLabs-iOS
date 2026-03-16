/* ═══════════════════════════════════════════════════
   SCREEN 13 — FULL SPECTRUM INTELLIGENCE HUB
   elite_full_spectrum_intelligence_hub → My Arena
   Wire: Perplexity + Tavily + Exa multi-source fusion
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const ARENAS = [
  { id: 'market',    label: 'MARKET',    icon: '📊', desc: 'Real-time market intelligence' },
  { id: 'people',    label: 'PEOPLE',    icon: '👤', desc: 'Executive & contact data' },
  { id: 'news',      label: 'NEWS',      icon: '📰', desc: 'Breaking news & analysis' },
  { id: 'tech',      label: 'TECH',      icon: '⚡', desc: 'Tech trends & innovations' },
  { id: 'finance',   label: 'FINANCE',   icon: '💰', desc: 'Financial data & insights' },
  { id: 'legal',     label: 'LEGAL',     icon: '⚖️',  desc: 'Legal & compliance intel' },
];

const SAVED = [
  { query: 'AI funding rounds Q1 2026', arena: 'finance', age: '2h ago' },
  { query: 'Top SaaS founders NYC', arena: 'people', age: '1d ago' },
  { query: 'Commercial real estate Dallas', arena: 'market', age: '3d ago' },
];

export default function FullSpectrumIntelScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [selectedArena, setSelectedArena] = useState('market');
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('arena'); // arena | saved | trending
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/intel/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: JSON.stringify({ query, source: 'all', arena: selectedArena, limit: 10 }),
      });
      const data = await res.json();
      setResults(data.results || [{ title: query, snippet: data.answer || 'No results.', source: 'all' }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const arena = ARENAS.find(a => a.id === selectedArena);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Arena</Text>
          <Text style={s.headerSub}>FULL SPECTRUM INTELLIGENCE</Text>
        </View>
        <View style={s.liveBadge}>
          <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      {/* Arena Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.arenaRow}>
        {ARENAS.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[s.arenaChip, selectedArena === a.id && s.arenaActive]}
            onPress={() => setSelectedArena(a.id)}
            activeOpacity={0.8}
          >
            <Text style={s.arenaIcon}>{a.icon}</Text>
            <Text style={[s.arenaLabel, selectedArena === a.id && { color: BG }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.arenaChipIcon}>{arena?.icon}</Text>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${arena?.label.toLowerCase()} intelligence...`}
            placeholderTextColor="#444"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={s.clearTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.searchBtn, loading && { opacity: 0.6 }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={s.searchBtnTxt}>{loading ? '…' : '→'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['arena', 'saved', 'trending'].map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, activeTab === t && s.tabBtnActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[s.tabBtnTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Results */}
        {results.length > 0 && results.map((r, i) => (
          <View key={i} style={s.resultCard}>
            <View style={s.resultHeader}>
              <Text style={s.resultSourceBadge}>{(r.source || selectedArena).toUpperCase()}</Text>
              {r.url ? <Text style={s.resultUrl} numberOfLines={1}>{r.url}</Text> : null}
            </View>
            <Text style={s.resultTitle}>{r.title}</Text>
            <Text style={s.resultSnippet}>{r.snippet || r.content}</Text>
          </View>
        ))}

        {/* Arena Tab — empty state */}
        {activeTab === 'arena' && results.length === 0 && !loading && (
          <View style={s.arenaInfoCard}>
            <Text style={s.arenaInfoIcon}>{arena?.icon}</Text>
            <Text style={s.arenaInfoTitle}>{arena?.label} Intelligence</Text>
            <Text style={s.arenaInfoDesc}>{arena?.desc}</Text>
            <View style={s.sourcesRow}>
              {['PERPLEXITY', 'TAVILY', 'EXA'].map(src => (
                <View key={src} style={s.srcBadge}>
                  <View style={s.srcDot} />
                  <Text style={s.srcTxt}>{src}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <>
            <Text style={s.sectionLabel}>SAVED SEARCHES</Text>
            {SAVED.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={s.savedCard}
                onPress={() => { setQuery(item.query); setSelectedArena(item.arena); setActiveTab('arena'); handleSearch(); }}
              >
                <View style={s.savedLeft}>
                  <Text style={s.savedQuery}>{item.query}</Text>
                  <View style={s.savedMeta}>
                    <Text style={s.savedArena}>{item.arena.toUpperCase()}</Text>
                    <Text style={s.savedAge}>{item.age}</Text>
                  </View>
                </View>
                <Text style={s.savedArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <>
            <Text style={s.sectionLabel}>TRENDING INTELLIGENCE</Text>
            {[
              { rank: 1, topic: 'AI M&A Activity Q1 2026', volume: '↑ 340%', arena: 'market' },
              { rank: 2, topic: 'Federal Reserve Rate Decision', volume: '↑ 280%', arena: 'finance' },
              { rank: 3, topic: 'Tech Layoffs Wave 2026', volume: '↑ 210%', arena: 'tech' },
              { rank: 4, topic: 'Commercial Real Estate Recovery', volume: '↑ 190%', arena: 'market' },
              { rank: 5, topic: 'Crypto Regulation Bill Senate', volume: '↑ 175%', arena: 'legal' },
            ].map(item => (
              <TouchableOpacity
                key={item.rank}
                style={s.trendCard}
                onPress={() => { setQuery(item.topic); setSelectedArena(item.arena); setActiveTab('arena'); handleSearch(); }}
              >
                <Text style={s.trendRank}>#{item.rank}</Text>
                <View style={s.trendInfo}>
                  <Text style={s.trendTopic}>{item.topic}</Text>
                  <Text style={s.trendArena}>{item.arena.toUpperCase()}</Text>
                </View>
                <Text style={s.trendVolume}>{item.volume}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  headerSub: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 2, marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  arenaRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  arenaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  arenaActive: { backgroundColor: GOLD, borderColor: GOLD },
  arenaIcon: { fontSize: 12 },
  arenaLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  arenaChipIcon: { fontSize: 14 },
  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: '#E8E6E1' },
  clearTxt: { fontSize: 14, color: '#6B7280', padding: 4 },
  searchBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt: { fontSize: 20, fontWeight: '700', color: BG },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabBtnTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  scroll: { flex: 1 },
  resultCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  resultSourceBadge: { fontSize: 8, fontWeight: '800', color: GOLD, letterSpacing: 2, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  resultUrl: { fontSize: 10, color: '#6B7280', flex: 1 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 6, lineHeight: 20 },
  resultSnippet: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  arenaInfoCard: { margin: 14, backgroundColor: CARD, borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: GOLD + '20' },
  arenaInfoIcon: { fontSize: 48, marginBottom: 12 },
  arenaInfoTitle: { fontSize: 18, fontWeight: '800', color: '#E8E6E1', marginBottom: 8 },
  arenaInfoDesc: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  sourcesRow: { flexDirection: 'row', gap: 10 },
  srcBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#22C55E18', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E30' },
  srcDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  srcTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, paddingHorizontal: 14, marginBottom: 10, marginTop: 4 },
  savedCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  savedLeft: { flex: 1 },
  savedQuery: { fontSize: 13, fontWeight: '600', color: '#E8E6E1', marginBottom: 6 },
  savedMeta: { flexDirection: 'row', gap: 10 },
  savedArena: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  savedAge: { fontSize: 10, color: '#6B7280' },
  savedArrow: { fontSize: 20, color: GOLD, fontWeight: '300' },
  trendCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  trendRank: { fontSize: 16, fontWeight: '800', color: GOLD + '60', width: 28 },
  trendInfo: { flex: 1 },
  trendTopic: { fontSize: 13, fontWeight: '600', color: '#E8E6E1', marginBottom: 4 },
  trendArena: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5 },
  trendVolume: { fontSize: 11, fontWeight: '700', color: '#22C55E' },
});
