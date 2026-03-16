/* ═══════════════════════════════════════════════════
   SCREEN 15 — GEO MASTER HUB
   elite_geo_master_hub_fully_interactive
   Wire: Perplexity geopolitical + Tavily regional search
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const REGIONS = [
  { id: 'na',    label: 'N. AMERICA',  icon: '🌎', color: '#22C55E' },
  { id: 'eu',    label: 'EUROPE',      icon: '🌍', color: '#3B82F6' },
  { id: 'asia',  label: 'ASIA PAC',    icon: '🌏', color: '#F59E0B' },
  { id: 'me',    label: 'MIDDLE EAST', icon: '🏜️',  color: '#EF4444' },
  { id: 'la',    label: 'LATAM',       icon: '🌿',  color: '#8B5CF6' },
  { id: 'af',    label: 'AFRICA',      icon: '🦁',  color: '#EC4899' },
];

const GEO_TABS = ['OVERVIEW', 'CONFLICTS', 'ECONOMICS', 'OPPORTUNITIES'];

const INTEL_ITEMS = [
  { region: 'N. AMERICA', type: 'TRADE',    title: 'US-Canada trade negotiations resume', risk: 'low',    time: '2h' },
  { region: 'EUROPE',     type: 'ENERGY',   title: 'EU natural gas reserves at 95% capacity', risk: 'low', time: '4h' },
  { region: 'ASIA PAC',   type: 'MILITARY', title: 'South China Sea tensions escalate', risk: 'high',   time: '6h' },
  { region: 'MIDDLE EAST',type: 'OIL',      title: 'OPEC+ production cut extended Q2', risk: 'medium',  time: '8h' },
  { region: 'LATAM',      type: 'FINANCE',  title: 'Brazil central bank rate decision', risk: 'medium',  time: '12h' },
];

const RISK_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' };

export default function GeoMasterHubScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [activeRegion, setActiveRegion] = useState('na');
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const region = REGIONS.find(r => r.id === activeRegion);
      const res = await fetch(`${API_BASE}/api/intel/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: JSON.stringify({ query: `${region?.label} ${query} geopolitical analysis`, source: 'perplexity', limit: 8 }),
      });
      const data = await res.json();
      setResults(data.results || [{ title: query, snippet: data.answer || 'No results.' }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const region = REGIONS.find(r => r.id === activeRegion);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Geo Master Hub</Text>
          <Text style={s.headerSub}>GLOBAL INTELLIGENCE · GEOPOLITICAL ANALYSIS</Text>
        </View>
        <View style={s.liveBadge}>
          <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      {/* Region Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.regionRow}>
        {REGIONS.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[s.regionChip, activeRegion === r.id && { backgroundColor: r.color + '20', borderColor: r.color }]}
            onPress={() => setActiveRegion(r.id)}
            activeOpacity={0.8}
          >
            <Text style={s.regionIcon}>{r.icon}</Text>
            <Text style={[s.regionLabel, activeRegion === r.id && { color: r.color }]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Geo Tab Bar */}
      <View style={s.geoTabs}>
        {GEO_TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[s.geoTab, activeTab === i && s.geoTabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[s.geoTabTxt, activeTab === i && { color: BG }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={{ fontSize: 14 }}>{region?.icon}</Text>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={`Intel for ${region?.label}...`}
            placeholderTextColor="#444"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={[s.searchBtn, loading && { opacity: 0.6 }]} onPress={handleSearch} disabled={loading}>
          <Text style={s.searchBtnTxt}>{loading ? '…' : '→'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {results.length > 0 && results.map((r, i) => (
          <View key={i} style={s.resultCard}>
            <Text style={s.resultTitle}>{r.title}</Text>
            <Text style={s.resultSnippet}>{r.snippet || r.content}</Text>
          </View>
        ))}

        {/* Overview Tab */}
        {activeTab === 0 && results.length === 0 && (
          <>
            {/* Region Status Card */}
            <View style={[s.regionStatusCard, { borderColor: region?.color + '40' }]}>
              <View style={s.regionStatusTop}>
                <Text style={s.regionStatusIcon}>{region?.icon}</Text>
                <View style={s.regionStatusInfo}>
                  <Text style={s.regionStatusName}>{region?.label}</Text>
                  <Text style={[s.regionStatusRisk, { color: '#22C55E' }]}>● STABLE</Text>
                </View>
              </View>
              <View style={s.regionMetrics}>
                {[
                  { label: 'RISK', value: 'LOW' },
                  { label: 'TRADE', value: 'HIGH' },
                  { label: 'TENSION', value: 'MED' },
                ].map(m => (
                  <View key={m.label} style={s.regionMetric}>
                    <Text style={s.regionMetricLabel}>{m.label}</Text>
                    <Text style={s.regionMetricValue}>{m.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Live Intel Feed */}
            <Text style={s.sectionLabel}>LIVE INTEL FEED</Text>
            {INTEL_ITEMS.map((item, i) => (
              <View key={i} style={s.intelCard}>
                <View style={s.intelTop}>
                  <Text style={s.intelType}>{item.type}</Text>
                  <View style={[s.riskBadge, { backgroundColor: RISK_COLORS[item.risk] + '20', borderColor: RISK_COLORS[item.risk] + '40' }]}>
                    <View style={[s.riskDot, { backgroundColor: RISK_COLORS[item.risk] }]} />
                    <Text style={[s.riskTxt, { color: RISK_COLORS[item.risk] }]}>{item.risk.toUpperCase()}</Text>
                  </View>
                  <Text style={s.intelTime}>{item.time} ago</Text>
                </View>
                <Text style={s.intelTitle}>{item.title}</Text>
                <Text style={s.intelRegion}>{item.region}</Text>
              </View>
            ))}
          </>
        )}

        {/* Conflicts Tab */}
        {activeTab === 1 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>⚔️</Text>
            <Text style={s.emptyTxt}>Active Conflicts Monitor</Text>
            <Text style={s.emptySub}>Real-time tracking of global conflicts and risk zones</Text>
          </View>
        )}

        {/* Economics Tab */}
        {activeTab === 2 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📈</Text>
            <Text style={s.emptyTxt}>Economic Intelligence</Text>
            <Text style={s.emptySub}>GDP, trade flows, sanctions, and currency analysis</Text>
          </View>
        )}

        {/* Opportunities Tab */}
        {activeTab === 3 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTxt}>Regional Opportunities</Text>
            <Text style={s.emptySub}>Emerging markets, investment zones, and growth regions</Text>
          </View>
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
  regionRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  regionChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  regionIcon: { fontSize: 12 },
  regionLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  geoTabs: { flexDirection: 'row', paddingHorizontal: 14, gap: 6, paddingBottom: 10 },
  geoTab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  geoTabActive: { backgroundColor: GOLD, borderColor: GOLD },
  geoTabTxt: { fontSize: 8, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: '#E8E6E1' },
  searchBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt: { fontSize: 20, fontWeight: '700', color: BG },
  scroll: { flex: 1 },
  resultCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 6, lineHeight: 20 },
  resultSnippet: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  regionStatusCard: { margin: 14, backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1 },
  regionStatusTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  regionStatusIcon: { fontSize: 36 },
  regionStatusInfo: { flex: 1 },
  regionStatusName: { fontSize: 16, fontWeight: '800', color: '#E8E6E1', marginBottom: 4 },
  regionStatusRisk: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  regionMetrics: { flexDirection: 'row', gap: 10 },
  regionMetric: { flex: 1, backgroundColor: BG, borderRadius: 8, padding: 10, alignItems: 'center' },
  regionMetricLabel: { fontSize: 8, fontWeight: '700', color: '#6B7280', letterSpacing: 1.5, marginBottom: 4 },
  regionMetricValue: { fontSize: 12, fontWeight: '800', color: '#E8E6E1' },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, paddingHorizontal: 14, marginBottom: 10, marginTop: 4 },
  intelCard: { marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  intelTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  intelType: { fontSize: 8, fontWeight: '800', color: GOLD, letterSpacing: 1.5, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  riskDot: { width: 4, height: 4, borderRadius: 2 },
  riskTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  intelTime: { fontSize: 10, color: '#6B7280', marginLeft: 'auto' },
  intelTitle: { fontSize: 13, fontWeight: '600', color: '#E8E6E1', marginBottom: 4, lineHeight: 18 },
  intelRegion: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
