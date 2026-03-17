/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — REAL ESTATE SUITE
   generated_screen — Full RE dashboard
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { streamSalChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const MARKET_TRENDS = [
  { city: 'Dallas, TX', avg: '$485K', change: '+8.2%', hot: true },
  { city: 'Austin, TX', avg: '$625K', change: '+4.1%', hot: true },
  { city: 'Miami, FL', avg: '$820K', change: '+12.3%', hot: true },
  { city: 'Phoenix, AZ', avg: '$390K', change: '-1.2%', hot: false },
  { city: 'Las Vegas, NV', avg: '$420K', change: '+3.8%', hot: true },
];

export default function RealEstateSuite() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);
  const xhrRef = useRef(null);

  useEffect(() => {
    return () => xhrRef.current?.abort?.();
  }, []);

  const runAnalysis = () => {
    if (!analysisPrompt.trim()) { Alert.alert('Enter analysis query'); return; }
    setLoading(true);
    setAnalysisResult('');
    xhrRef.current = streamSalChat({
      mode: 'realestate',
      messages: [{ role: 'user', content: analysisPrompt }],
      system: 'You are SaintSal™ Real Estate Intelligence — elite property analyst and investment strategist. Provide comprehensive market analysis with specific data points, cap rates, NOI calculations, and investment recommendations. Format responses with clear sections.',
      onChunk: (chunk) => setAnalysisResult(prev => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => { setLoading(false); Alert.alert('Error', err); },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Real Estate Suite</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ELITE</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {['search', 'analysis', 'trends'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'search' ? '🔍 SEARCH' : tab === 'analysis' ? '📊 ANALYSIS' : '📈 TRENDS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'search' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MLS Property Search</Text>
            <View style={styles.searchCard}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by address, city, zip code..."
                placeholderTextColor={MUTED}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>SEARCH MLS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subLabel}>FEATURED LISTINGS</Text>
            {[
              { address: '4821 Oak Ridge Dr, Dallas, TX', price: '$625,000', beds: 4, baths: 3, sqft: '2,850', type: 'Single Family', roi: '6.2%' },
              { address: '112 Westlake Blvd, Austin, TX', price: '$489,000', beds: 3, baths: 2, sqft: '2,100', type: 'Condo', roi: '5.8%' },
              { address: '9901 Sunrise Ct, Miami, FL', price: '$1,250,000', beds: 5, baths: 4, sqft: '4,500', type: 'Luxury', roi: '4.9%' },
              { address: '3307 Desert Rose Ave, Phoenix, AZ', price: '$395,000', beds: 3, baths: 2, sqft: '1,890', type: 'Single Family', roi: '7.1%' },
            ].map((prop, i) => (
              <View key={i} style={styles.propCard}>
                <View style={styles.propImagePlaceholder}>
                  <Text style={{ fontSize: 28 }}>🏠</Text>
                </View>
                <View style={styles.propInfo}>
                  <Text style={styles.propAddress}>{prop.address}</Text>
                  <Text style={styles.propPrice}>{prop.price}</Text>
                  <Text style={styles.propDetails}>{prop.beds}bd · {prop.baths}ba · {prop.sqft} sqft</Text>
                  <View style={styles.propTagsRow}>
                    <View style={styles.propTypeTag}>
                      <Text style={styles.propTypeTagText}>{prop.type}</Text>
                    </View>
                    <View style={styles.propRoiTag}>
                      <Text style={styles.propRoiTagText}>ROI: {prop.roi}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.propViewBtn}>
                  <Text style={styles.propViewBtnText}>VIEW</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'analysis' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Analysis AI</Text>
            <Text style={styles.sectionSub}>Powered by Claude Sonnet — Executive Real Estate Intelligence</Text>

            <View style={styles.analysisCard}>
              <Text style={styles.fieldLabel}>ANALYSIS QUERY</Text>
              <TextInput
                style={styles.analysisInput}
                placeholder="E.g. Analyze the Dallas multifamily market for 2025 investment opportunities..."
                placeholderTextColor={MUTED}
                value={analysisPrompt}
                onChangeText={setAnalysisPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
                onPress={runAnalysis}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <Text style={styles.analyzeBtnText}>🤖 ANALYZE WITH CLAUDE</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel} style={{ marginTop: 16, marginBottom: 8, color: MUTED, fontSize: 10, letterSpacing: 3, fontFamily: 'PublicSans-Bold' }}>QUICK ANALYSES</Text>
            {[
              'Best cap rate markets in Texas 2025',
              'Calculate NOI for $500K multifamily at 7% vacancy',
              'Compare SFR vs multifamily in Phoenix',
              'Top BRRRR strategy markets',
            ].map((q, i) => (
              <TouchableOpacity key={i} style={styles.quickAnalysisBtn} onPress={() => setAnalysisPrompt(q)}>
                <Text style={styles.quickAnalysisBtnText}>→ {q}</Text>
              </TouchableOpacity>
            ))}

            {(analysisResult || loading) && (
              <View style={styles.resultCard}>
                <Text style={styles.resultHeader}>📊 ANALYSIS RESULT</Text>
                {loading && <ActivityIndicator color={GOLD} size="small" style={{ marginBottom: 8 }} />}
                <Text style={styles.resultText}>{analysisResult || 'Analyzing market data...'}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'trends' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Trends</Text>
            {MARKET_TRENDS.map((trend, i) => (
              <View key={i} style={styles.trendCard}>
                <View style={styles.trendLeft}>
                  <Text style={styles.trendCity}>{trend.city}</Text>
                  <Text style={styles.trendAvg}>Avg: {trend.avg}</Text>
                </View>
                <View style={styles.trendRight}>
                  <Text style={[styles.trendChange, { color: trend.change.startsWith('+') ? '#4ade80' : '#f87171' }]}>
                    {trend.change}
                  </Text>
                  {trend.hot && <View style={styles.hotBadge}><Text style={styles.hotBadgeText}>🔥 HOT</Text></View>}
                </View>
              </View>
            ))}

            <View style={styles.metricsCard}>
              <Text style={styles.subLabel}>NATIONAL METRICS</Text>
              {[
                { label: 'Median Home Price', value: '$412,000' },
                { label: '30-Year Mortgage Rate', value: '6.85%' },
                { label: 'Housing Inventory', value: '1.2M units' },
                { label: 'Days on Market (Avg)', value: '32 days' },
                { label: 'Price Reduction %', value: '18.4%' },
              ].map((m, i) => (
                <View key={i} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 18, fontFamily: 'PublicSans-Bold' },
  headerBadge: {
    backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}33`,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  headerBadgeText: { color: GOLD, fontWeight: '700', fontSize: 10, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  tabActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tabText: { color: MUTED, fontSize: 9, fontWeight: '700', letterSpacing: 1, fontFamily: 'PublicSans-Bold' },
  tabTextActive: { color: GOLD },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { gap: 16 },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  sectionSub: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular', marginTop: -8 },
  searchCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12,
  },
  searchInput: {
    color: '#fff', fontSize: 14, padding: 12, backgroundColor: SURFACE,
    borderRadius: 8, borderWidth: 1, borderColor: BORDER, fontFamily: 'PublicSans-Regular',
  },
  searchBtn: { backgroundColor: GOLD, borderRadius: 8, padding: 14, alignItems: 'center' },
  searchBtnText: { color: BLACK, fontWeight: '800', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  subLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  propCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  propImagePlaceholder: {
    width: 64, height: 64, borderRadius: 10, backgroundColor: GOLD_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  propInfo: { flex: 1, gap: 4 },
  propAddress: { color: '#e2e8f0', fontWeight: '600', fontSize: 13, fontFamily: 'PublicSans-Bold' },
  propPrice: { color: GOLD, fontWeight: '800', fontSize: 18, fontFamily: 'PublicSans-ExtraBold' },
  propDetails: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  propTagsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  propTypeTag: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  propTypeTagText: { color: MUTED, fontSize: 9, fontFamily: 'PublicSans-Regular' },
  propRoiTag: { backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  propRoiTagText: { color: '#4ade80', fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  propViewBtn: { backgroundColor: GOLD_DIM, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: `${GOLD}33` },
  propViewBtnText: { color: GOLD, fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  analysisCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12,
  },
  fieldLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  analysisInput: {
    color: '#fff', fontSize: 14, minHeight: 100, fontFamily: 'PublicSans-Regular',
    backgroundColor: SURFACE, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BORDER,
  },
  analyzeBtn: { backgroundColor: GOLD, borderRadius: 8, padding: 16, alignItems: 'center' },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  quickAnalysisBtn: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 12,
  },
  quickAnalysisBtnText: { color: '#e2e8f0', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  resultCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: `${GOLD}33`, padding: 16, gap: 12,
  },
  resultHeader: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  resultText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22, fontFamily: 'PublicSans-Regular' },
  trendCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  trendLeft: { gap: 4 },
  trendCity: { color: '#e2e8f0', fontWeight: '600', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  trendAvg: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  trendRight: { alignItems: 'flex-end', gap: 6 },
  trendChange: { fontWeight: '800', fontSize: 18, fontFamily: 'PublicSans-ExtraBold' },
  hotBadge: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  hotBadgeText: { fontSize: 10, fontFamily: 'PublicSans-Regular' },
  metricsCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12,
  },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  metricLabel: { color: MUTED, fontSize: 13, fontFamily: 'PublicSans-Regular' },
  metricValue: { color: GOLD, fontWeight: '700', fontSize: 14, fontFamily: 'PublicSans-Bold' },
});
