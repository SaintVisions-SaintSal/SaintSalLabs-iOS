import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { SALMark } from '../../components';

const MARKET_TICKERS = [
  { symbol: 'BTC', value: '$65,432', change: '+1.2%', up: true },
  { symbol: 'S&P 500', value: '5,431', change: '+0.5%', up: true },
  { symbol: 'ETH', value: '$3,421', change: '-0.8%', up: false },
  { symbol: 'NVDA', value: '$924.80', change: '+2.4%', up: true },
  { symbol: 'GOLD', value: '$2,342', change: '+0.3%', up: true },
];

const SUITES = [
  { id: 'search', icon: '🔍', label: 'Search', desc: 'Universal AI Intelligence', accent: C.amber },
  { id: 'finance', icon: '📈', label: 'Finance', desc: 'Market Analysis & Forecasting', accent: C.green },
  { id: 'tech', icon: '💻', label: 'Tech', desc: 'Code & Development Ops', accent: C.purple },
  { id: 'medical', icon: '🏥', label: 'Medical', desc: 'Clinical Health Insights', accent: C.purple },
  { id: 'realestate', icon: '🏠', label: 'Real Estate', desc: 'Global Market Trends', accent: C.pink },
  { id: 'sports', icon: '🏈', label: 'Sports', desc: 'Scores, Stats & Strategy', accent: C.green },
  { id: 'news', icon: '📰', label: 'News', desc: 'Breaking & Analysis', accent: C.red },
  { id: 'builder', icon: '⚡', label: 'Builder', desc: 'Code. Create. Ship.', accent: C.amber },
  { id: 'career', icon: '💼', label: 'Career', desc: 'Get Hired. Get Paid.', accent: C.purple },
  { id: 'bizplan', icon: '📋', label: 'Biz Plan', desc: 'Idea to Investor Deck', accent: C.amber },
  { id: 'bizcenter', icon: '🏢', label: 'Biz Center', desc: 'Launch Your Company', accent: C.green },
  { id: 'domains', icon: '🌐', label: 'Domains', desc: 'Find Your Brand Name', accent: C.blue },
];

const QUICK_STATS = [
  { label: 'Queries Today', value: '24', icon: '💬' },
  { label: 'Reports Generated', value: '7', icon: '📄' },
  { label: 'Models Active', value: '5', icon: '🧠' },
];

const CREDITS = 999993;

export default function DashboardScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const SUITE_ROUTES = {
    search: '/(tabs)/search',
    builder: '/(tabs)/builder',
    finance: '/(tabs)/search',
    tech: '/(tabs)/search',
    medical: '/(tabs)/search',
    sports: '/(tabs)/search',
    news: '/(tabs)/search',
    career: '/(tabs)/search',
    bizplan: '/(tabs)/search',
    bizcenter: '/(tabs)/search',
    realestate: '/(stack)/real-estate',
    domains: '/(stack)/domain-hub',
  };

  const handleSuitePress = (suite) => {
    const route = SUITE_ROUTES[suite.id];
    if (route) router.push(route);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={38} />
          <View>
            <Text style={s.headerTitle}>SaintSal Labs</Text>
            <View style={s.engineRow}>
              <Animated.View style={[s.engineDot, { opacity: pulseAnim }]} />
              <Text style={s.engineText}>Neural Engine Active</Text>
            </View>
          </View>
        </View>
        <View style={s.creditBadge}>
          <Text style={s.creditIcon}>🗄️</Text>
          <Text style={s.creditValue}>{CREDITS.toLocaleString()} Credits</Text>
        </View>
      </View>

      {/* Market Ticker */}
      <View style={s.tickerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tickerContent}
        >
          {MARKET_TICKERS.map((t) => (
            <View key={t.symbol} style={s.tickerCard}>
              <Text style={s.tickerArrow}>
                {t.up ? '📈' : '📉'}
              </Text>
              <Text style={s.tickerLabel}>
                <Text style={s.tickerSymbol}>{t.symbol}:</Text> {t.value}
              </Text>
              <Text style={[s.tickerChange, { color: t.up ? C.green : C.red }]}>
                {t.change}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={s.sectionTitleWrap}>
          <Text style={s.sectionTitle}>Intelligence Suites</Text>
          <Text style={s.sectionSubtitle}>
            Specialized AI models for your workflow
          </Text>
        </View>

        {/* Suites Grid */}
        <View style={s.grid}>
          {SUITES.map((suite) => (
            <TouchableOpacity
              key={suite.id}
              style={s.suiteCard}
              onPress={() => handleSuitePress(suite)}
              activeOpacity={0.7}
            >
              <View style={[s.suiteIcon, { backgroundColor: suite.accent + '12' }]}>
                <Text style={s.suiteEmoji}>{suite.icon}</Text>
              </View>
              <Text style={s.suiteLabel}>{suite.label}</Text>
              <Text style={s.suiteDesc}>{suite.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={s.statsWrap}>
          <Text style={s.statsTitle}>TODAY'S ACTIVITY</Text>
          <View style={s.statsRow}>
            {QUICK_STATS.map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statIcon}>{stat.icon}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* System Status */}
        <View style={s.statusBanner}>
          <View style={s.statusLeft}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>GPU Clusters Online</Text>
          </View>
          <Text style={s.statusUptime}>99.9% Uptime</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} activeOpacity={0.8} onPress={() => router.push('/(tabs)/')}>
        <Text style={s.fabIcon}>💬</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  engineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  engineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  engineText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.amberDim,
    textTransform: 'uppercase',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.amberGhost,
    borderWidth: 1,
    borderColor: C.amberDim + '33',
  },
  creditIcon: { fontSize: 12 },
  creditValue: { fontSize: 11, fontWeight: '700', color: C.amber },

  /* Ticker */
  tickerWrap: {
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 8,
  },
  tickerContent: { paddingHorizontal: 12, gap: 10 },
  tickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  tickerArrow: { fontSize: 12 },
  tickerLabel: { fontSize: 11, fontWeight: '500', color: C.text },
  tickerSymbol: { color: C.textMuted },
  tickerChange: { fontSize: 10, fontWeight: '700' },

  /* Scroll */
  scroll: { flex: 1 },

  /* Section Title */
  sectionTitleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: C.textMuted, marginTop: 4 },

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  suiteCard: {
    width: '47%',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgCard,
  },
  suiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  suiteEmoji: { fontSize: 20 },
  suiteLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  suiteDesc: { fontSize: 11, color: C.textMuted, marginTop: 4 },

  /* Stats */
  statsWrap: { paddingHorizontal: 16, marginTop: 24 },
  statsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.textDim,
    marginBottom: 12,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 10, color: C.textMuted, marginTop: 4, textAlign: 'center' },

  /* Status Banner */
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.amberGhost,
    borderWidth: 1,
    borderColor: C.amberDim + '33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.amber,
  },
  statusText: { fontSize: 13, fontWeight: '500', color: C.textSub },
  statusUptime: {
    fontSize: 10,
    fontWeight: '800',
    color: C.amber,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 24 },
});
