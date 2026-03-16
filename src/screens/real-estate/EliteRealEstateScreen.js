/* ═══════════════════════════════════════════════════
   SCREEN 23 — ELITE REAL ESTATE FINDER
   elite_real_estate_finder_supercharged
   Wire: Perplexity + Tavily RE search + AI analysis
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

const PROPERTY_TYPES = [
  { id: 'residential', label: 'RESIDENTIAL', icon: '🏠' },
  { id: 'commercial',  label: 'COMMERCIAL',  icon: '🏢' },
  { id: 'industrial',  label: 'INDUSTRIAL',  icon: '🏭' },
  { id: 'land',        label: 'LAND',        icon: '🌿' },
  { id: 'multifamily', label: 'MULTI-FAM',   icon: '🏘️' },
  { id: 'luxury',      label: 'LUXURY',      icon: '💎' },
];

const QUICK_SEARCHES = [
  { label: 'Commercial RE Dallas TX', icon: '🏢' },
  { label: 'Luxury condos Miami Beach', icon: '💎' },
  { label: 'Industrial warehouse Houston', icon: '🏭' },
  { label: 'Off-market multifamily NYC', icon: '🏘️' },
];

const MARKET_METRICS = [
  { label: 'CAP RATE',   value: '5.8%',  trend: '↑', color: '#22C55E' },
  { label: 'AVG PRICE',  value: '$2.4M', trend: '↑', color: '#22C55E' },
  { label: 'INVENTORY',  value: '↓ 12%', trend: '↓', color: '#EF4444' },
  { label: 'DOM',        value: '18d',   trend: '↓', color: '#22C55E' },
];

export default function EliteRealEstateScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [propertyType, setPropertyType] = useState('commercial');
  const [location, setLocation]   = useState('');
  const [budget, setBudget]       = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSearch = async (quickQ) => {
    const searchQ = quickQ || (location ? `${propertyType} real estate ${location} ${budget ? 'budget ' + budget : ''}` : '');
    if (!searchQ.trim()) return Alert.alert('Error', 'Enter a location to search.');
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
        body: JSON.stringify({ query: searchQ, source: 'tavily', limit: 8 }),
      });
      const data = await res.json();
      setResults(data.results || [{ title: searchQ, snippet: data.answer || 'No properties found.' }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Elite Real Estate Finder</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>TAVILY · PERPLEXITY · AI ANALYSIS</Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <Text style={s.liveBadgeTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['search', 'market', 'saved'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <View style={s.pad}>
            {/* Property Type */}
            <Text style={s.fieldLabel}>PROPERTY TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
              {PROPERTY_TYPES.map(t => (
                <TouchableOpacity key={t.id} style={[s.typeChip, propertyType === t.id && s.typeActive]} onPress={() => setPropertyType(t.id)}>
                  <Text style={s.typeIcon}>{t.icon}</Text>
                  <Text style={[s.typeLabel, propertyType === t.id && { color: BG }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>LOCATION</Text>
            <TextInput
              style={s.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, State, or ZIP code..."
              placeholderTextColor="#444"
            />

            <Text style={s.fieldLabel}>BUDGET RANGE</Text>
            <TextInput
              style={s.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="e.g. $500K - $2M"
              placeholderTextColor="#444"
            />

            <TouchableOpacity
              style={[s.searchBtn, loading && { opacity: 0.6 }]}
              onPress={() => handleSearch()}
              disabled={loading}
            >
              <Text style={s.searchBtnTxt}>{loading ? '🔍 SEARCHING...' : '🔍 FIND PROPERTIES'}</Text>
            </TouchableOpacity>

            {/* Quick Searches */}
            {results.length === 0 && !loading && (
              <>
                <Text style={[s.fieldLabel, { marginTop: 20 }]}>QUICK SEARCHES</Text>
                {QUICK_SEARCHES.map((q, i) => (
                  <TouchableOpacity key={i} style={s.quickChip} onPress={() => handleSearch(q.label)}>
                    <Text style={s.quickIcon}>{q.icon}</Text>
                    <Text style={s.quickLabel}>{q.label}</Text>
                    <Text style={s.quickArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Results */}
            {results.length > 0 && results.map((r, i) => (
              <View key={i} style={s.propertyCard}>
                <View style={s.propertyHeader}>
                  <Text style={s.propertyType}>{propertyType.toUpperCase()}</Text>
                </View>
                <Text style={s.propertyTitle}>{r.title}</Text>
                <Text style={s.propertyDesc}>{r.snippet || r.content}</Text>
                {r.url && <Text style={s.propertyUrl} numberOfLines={1}>{r.url}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>MARKET OVERVIEW</Text>
            <View style={s.metricsGrid}>
              {MARKET_METRICS.map(m => (
                <View key={m.label} style={s.metricCard}>
                  <Text style={[s.metricValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                  <Text style={[s.metricTrend, { color: m.color }]}>{m.trend}</Text>
                </View>
              ))}
            </View>

            <Text style={s.sectionLabel}>HOT MARKETS</Text>
            {[
              { city: 'Dallas, TX', type: 'Commercial', score: 94, trend: '↑ Strong' },
              { city: 'Miami, FL', type: 'Luxury Residential', score: 91, trend: '↑ Hot' },
              { city: 'Phoenix, AZ', type: 'Industrial', score: 88, trend: '↑ Growing' },
              { city: 'Nashville, TN', type: 'Multi-Family', score: 85, trend: '→ Stable' },
            ].map((m, i) => (
              <View key={i} style={s.marketCard}>
                <View style={s.marketLeft}>
                  <Text style={s.marketCity}>{m.city}</Text>
                  <Text style={s.marketType}>{m.type}</Text>
                </View>
                <View style={s.marketRight}>
                  <Text style={s.marketScore}>{m.score}</Text>
                  <Text style={[s.marketTrend, { color: m.trend.includes('↑') ? '#22C55E' : '#9CA3AF' }]}>{m.trend}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📌</Text>
            <Text style={s.emptyTxt}>Saved Properties</Text>
            <Text style={s.emptySub}>Properties you save will appear here for easy comparison</Text>
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
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  liveTxt: { fontSize: 7, fontWeight: '700', color: GOLD + '80', letterSpacing: 1.5 },
  liveBadge: { backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  liveBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8, marginTop: 10 },
  typeRow: { gap: 8, paddingBottom: 4 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD },
  typeActive: { backgroundColor: GOLD, borderColor: GOLD },
  typeIcon: { fontSize: 12 },
  typeLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14, marginBottom: 4 },
  searchBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  searchBtnTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 12, padding: 14, marginBottom: 8 },
  quickIcon: { fontSize: 18 },
  quickLabel: { flex: 1, fontSize: 13, color: '#E8E6E1', fontWeight: '500' },
  quickArrow: { fontSize: 20, color: GOLD },
  propertyCard: { backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: GOLD + '18' },
  propertyHeader: { marginBottom: 8 },
  propertyType: { fontSize: 8, fontWeight: '800', color: GOLD, letterSpacing: 2, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  propertyTitle: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 6, lineHeight: 20 },
  propertyDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, marginBottom: 6 },
  propertyUrl: { fontSize: 10, color: '#6B7280' },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 10, marginTop: 4 },
  metricsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: CARD, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: GOLD + '18' },
  metricValue: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  metricLabel: { fontSize: 7, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5, marginBottom: 4 },
  metricTrend: { fontSize: 14, fontWeight: '700' },
  marketCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: GOLD + '18' },
  marketLeft: { flex: 1 },
  marketCity: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  marketType: { fontSize: 11, color: '#6B7280' },
  marketRight: { alignItems: 'flex-end' },
  marketScore: { fontSize: 22, fontWeight: '800', color: GOLD },
  marketTrend: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
