import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';

const SECTORS = ['All', 'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];

const COMPANIES = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', revenue: '$60.9B', marketCap: '$2.28T', pe: 64.2, change: 2.8, rating: 'Strong Buy', saved: true },
  { ticker: 'AAPL', name: 'Apple Inc', sector: 'Technology', revenue: '$383.3B', marketCap: '$3.01T', pe: 31.4, change: -0.3, rating: 'Buy', saved: true },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', revenue: '$371.6B', marketCap: '$452B', pe: 19.8, change: 1.2, rating: 'Hold', saved: false },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', revenue: '$158.1B', marketCap: '$628B', pe: 12.4, change: 0.9, rating: 'Strong Buy', saved: true },
  { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', revenue: '$344.6B', marketCap: '$485B', pe: 14.1, change: -1.1, rating: 'Buy', saved: false },
  { ticker: 'AMZN', name: 'Amazon.com Inc', sector: 'Consumer', revenue: '$574.8B', marketCap: '$1.92T', pe: 58.7, change: 1.6, rating: 'Strong Buy', saved: true },
  { ticker: 'LLY', name: 'Eli Lilly & Co', sector: 'Healthcare', revenue: '$34.1B', marketCap: '$718B', pe: 112.3, change: 3.4, rating: 'Buy', saved: false },
  { ticker: 'V', name: 'Visa Inc', sector: 'Financials', revenue: '$32.7B', marketCap: '$580B', pe: 30.8, change: 0.5, rating: 'Buy', saved: true },
];

const WATCHLIST = [
  { ticker: 'TSLA', price: '$248.50', change: '+4.2%', up: true },
  { ticker: 'META', price: '$512.30', change: '+1.8%', up: true },
  { ticker: 'GOOG', price: '$168.40', change: '-0.6%', up: false },
  { ticker: 'NFLX', price: '$682.90', change: '+2.1%', up: true },
];

const REPORTS = [
  { title: 'NVIDIA Q4 2025 Earnings Deep Dive', date: 'Mar 8, 2026', type: 'Earnings' },
  { title: 'Healthcare Sector Rotation Analysis', date: 'Mar 5, 2026', type: 'Sector' },
  { title: 'JPMorgan vs Goldman: Banking Showdown', date: 'Mar 1, 2026', type: 'Comparative' },
  { title: 'AI Infrastructure Capex Forecast 2026', date: 'Feb 24, 2026', type: 'Macro' },
];

function ratingColor(rating) {
  if (rating === 'Strong Buy') return C.green;
  if (rating === 'Buy') return C.amber;
  return C.textMuted;
}

export default function InvestorAnalysisScreen() {
  const router = useRouter();
  const [sector, setSector] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = COMPANIES.filter(c => {
    const matchSector = sector === 'All' || c.sector === sector;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.ticker.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={require('../../../assets/logo-80.png')} style={{ width: 28, height: 28, borderRadius: 14 }} resizeMode="contain" />
          <View>
            <Text style={s.headerTitle}>Analysis Engine</Text>
            <Text style={s.headerSub}>Investor Intelligence</Text>
          </View>
        </View>
        <View style={s.proBadge}>
          <Text style={s.proText}>⚡ PRO</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search companies, tickers..."
            placeholderTextColor={C.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Sector Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          {SECTORS.map(s2 => (
            <TouchableOpacity
              key={s2}
              style={[s.filterPill, sector === s2 && s.filterPillActive]}
              onPress={() => setSector(s2)}
            >
              <Text style={[s.filterText, sector === s2 && s.filterTextActive]}>{s2}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Company Cards */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Companies ({filtered.length})</Text>
          <View style={s.cardList}>
            {filtered.map((c, i) => (
              <TouchableOpacity key={i} style={s.companyCard} activeOpacity={0.7}>
                <View style={s.cardHeader}>
                  <View style={s.tickerWrap}>
                    <View style={s.tickerBadge}>
                      <Text style={s.tickerLetter}>{c.ticker[0]}</Text>
                    </View>
                    <View>
                      <Text style={s.companyName}>{c.name}</Text>
                      <Text style={s.companySector}>{c.ticker} · {c.sector}</Text>
                    </View>
                  </View>
                  <View style={[s.ratingBadge, { backgroundColor: ratingColor(c.rating) + '20' }]}>
                    <Text style={[s.ratingText, { color: ratingColor(c.rating) }]}>{c.rating}</Text>
                  </View>
                </View>
                <View style={s.metricsRow}>
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>REVENUE</Text>
                    <Text style={s.metricValue}>{c.revenue}</Text>
                  </View>
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>MKT CAP</Text>
                    <Text style={s.metricValue}>{c.marketCap}</Text>
                  </View>
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>P/E</Text>
                    <Text style={s.metricValue}>{c.pe}x</Text>
                  </View>
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>TODAY</Text>
                    <Text style={[s.metricValue, { color: c.change >= 0 ? C.green : C.red }]}>
                      {c.change >= 0 ? '+' : ''}{c.change}%
                    </Text>
                  </View>
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity style={s.analyzeBtn}>
                    <Text style={s.analyzeBtnText}>Deep Analysis</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.saveBtn, c.saved && s.saveBtnActive]}>
                    <Text style={{ fontSize: 16 }}>{c.saved ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Watchlist */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Quick Watchlist</Text>
            <TouchableOpacity><Text style={s.addText}>+ Add</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
            {WATCHLIST.map((w, i) => (
              <View key={i} style={s.watchCard}>
                <Text style={s.watchTicker}>{w.ticker}</Text>
                <Text style={s.watchPrice}>{w.price}</Text>
                <Text style={[s.watchChange, { color: w.up ? C.green : C.red }]}>{w.change}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Analysis History */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Saved Reports</Text>
          <View style={s.reportList}>
            {REPORTS.map((r, i) => (
              <TouchableOpacity key={i} style={s.reportCard} activeOpacity={0.7}>
                <View style={s.reportIcon}>
                  <Text style={{ fontSize: 18 }}>📊</Text>
                </View>
                <View style={s.reportInfo}>
                  <Text style={s.reportTitle}>{r.title}</Text>
                  <Text style={s.reportMeta}>{r.date} · {r.type}</Text>
                </View>
                <Text style={s.reportArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  salMark: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  salMarkText: { fontSize: 16, fontWeight: '800', color: C.bg },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, fontWeight: '600', color: C.textDim, letterSpacing: 0.5 },
  proBadge: { backgroundColor: C.amberGhost, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: C.borderGlow },
  proText: { fontSize: 11, fontWeight: '700', color: C.amber },
  scroll: { flex: 1 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16, backgroundColor: C.bgInput, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: C.text },
  filterScroll: { marginTop: 14, paddingLeft: 16 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  filterPillActive: { backgroundColor: C.amber, borderColor: C.amber },
  filterText: { fontSize: 12, fontWeight: '700', color: C.textMuted },
  filterTextActive: { color: C.bg },
  section: { marginTop: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, paddingHorizontal: 20, marginBottom: 12 },
  addText: { fontSize: 13, fontWeight: '600', color: C.amber },
  cardList: { paddingHorizontal: 16, gap: 12 },
  companyCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tickerWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tickerBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  tickerLetter: { fontSize: 16, fontWeight: '800', color: C.amber },
  companyName: { fontSize: 14, fontWeight: '600', color: C.text, maxWidth: 200 },
  companySector: { fontSize: 11, color: C.textDim, marginTop: 2 },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 13, fontWeight: '700', color: C.text },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  analyzeBtn: { flex: 1, backgroundColor: C.amberGhost, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: C.borderGlow },
  analyzeBtnText: { fontSize: 12, fontWeight: '700', color: C.amber },
  saveBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  saveBtnActive: { borderColor: C.amber, backgroundColor: C.amberGhost },
  watchCard: { backgroundColor: C.bgCard, borderRadius: 12, padding: 14, width: 120, borderWidth: 1, borderColor: C.border },
  watchTicker: { fontSize: 14, fontWeight: '800', color: C.text },
  watchPrice: { fontSize: 13, fontWeight: '600', color: C.textSub, marginTop: 6 },
  watchChange: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  reportList: { paddingHorizontal: 16, gap: 8 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  reportIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  reportMeta: { fontSize: 11, color: C.textDim, marginTop: 3 },
  reportArrow: { fontSize: 22, color: C.textDim },
});
