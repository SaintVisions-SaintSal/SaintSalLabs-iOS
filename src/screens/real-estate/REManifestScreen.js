/* ═══════════════════════════════════════════════════
   SCREEN 24 — RE MANIFEST
   generated_screen → Real Estate portfolio manifest
   Wire: Supabase RE deals + AI analysis
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { streamChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const DEALS = [
  { id: 1, address: '1250 Commerce Blvd, Dallas TX', type: 'Commercial', status: 'ACTIVE', value: '$2.4M', roi: '12.3%', cap: '6.8%' },
  { id: 2, address: '880 Luxury Tower, Miami FL',    type: 'Luxury',     status: 'CLOSING', value: '$4.1M', roi: '18.7%', cap: '5.2%' },
  { id: 3, address: '3300 Warehouse District, PHX',  type: 'Industrial', status: 'PIPELINE', value: '$1.8M', roi: '14.2%', cap: '7.1%' },
];

const STATUS_COLORS = { ACTIVE: '#22C55E', CLOSING: GOLD, PIPELINE: '#3B82F6', CLOSED: '#6B7280' };

const PORTFOLIO_METRICS = [
  { label: 'TOTAL VALUE',   value: '$8.3M', icon: '💰', color: GOLD },
  { label: 'AVG ROI',       value: '15.1%', icon: '📈', color: '#22C55E' },
  { label: 'ACTIVE DEALS',  value: '3',     icon: '🏠', color: '#3B82F6' },
  { label: 'AVG CAP RATE',  value: '6.4%',  icon: '🎯', color: '#8B5CF6' },
];

export default function REManifestScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [analysis, setAnalysis]   = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const xhrRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleAnalyzePortfolio = async () => {
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setAnalyzing(true);
    setAnalysis('');
    const dealSummary = DEALS.map(d => `${d.address} (${d.type}) - ${d.status} - ${d.value} - ROI: ${d.roi}`).join('\n');

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      system: `You are SAL Real Estate Intelligence — an expert commercial real estate analyst and portfolio strategist. Analyze portfolios and provide actionable insights on optimization, risk management, and growth opportunities.`,
      messages: [{ role: 'user', content: `Analyze my real estate portfolio:\n\n${dealSummary}\n\nTotal Value: $8.3M | Avg ROI: 15.1% | Avg Cap Rate: 6.4%\n\nProvide: portfolio health assessment, risk analysis, diversification advice, and top 3 next moves.` }],
      onChunk: (chunk) => setAnalysis(prev => prev + chunk),
      onDone: () => setAnalyzing(false),
      onError: (err) => { Alert.alert('Error', err); setAnalyzing(false); },
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>RE Manifest</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>PORTFOLIO INTELLIGENCE · AI ANALYSIS</Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <Text style={s.liveBadgeTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['portfolio', 'deals', 'analysis'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <View style={s.pad}>
            {/* Metrics */}
            <View style={s.metricsGrid}>
              {PORTFOLIO_METRICS.map(m => (
                <View key={m.label} style={[s.metricCard, { borderColor: m.color + '30' }]}>
                  <Text style={s.metricIcon}>{m.icon}</Text>
                  <Text style={[s.metricValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Deals */}
            <Text style={s.sectionLabel}>ACTIVE PORTFOLIO</Text>
            {DEALS.map(deal => (
              <TouchableOpacity key={deal.id} style={s.dealCard} onPress={() => setActiveTab('deals')}>
                <View style={s.dealTop}>
                  <Text style={s.dealType}>{deal.type}</Text>
                  <View style={[s.dealStatus, { backgroundColor: STATUS_COLORS[deal.status] + '18', borderColor: STATUS_COLORS[deal.status] + '40' }]}>
                    <Text style={[s.dealStatusTxt, { color: STATUS_COLORS[deal.status] }]}>{deal.status}</Text>
                  </View>
                </View>
                <Text style={s.dealAddress}>{deal.address}</Text>
                <View style={s.dealMetrics}>
                  <Text style={s.dealValue}>{deal.value}</Text>
                  <Text style={[s.dealRoi, { color: '#22C55E' }]}>ROI {deal.roi}</Text>
                  <Text style={s.dealCap}>Cap {deal.cap}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={s.addDealBtn} onPress={() => Alert.alert('Add Deal', 'Deal entry form coming soon.')}>
              <Text style={s.addDealTxt}>+ ADD DEAL</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>ALL DEALS</Text>
            {DEALS.map(deal => (
              <View key={deal.id} style={s.dealDetailCard}>
                <View style={s.dealDetailHeader}>
                  <View style={[s.dealStatus, { backgroundColor: STATUS_COLORS[deal.status] + '18', borderColor: STATUS_COLORS[deal.status] + '40' }]}>
                    <Text style={[s.dealStatusTxt, { color: STATUS_COLORS[deal.status] }]}>{deal.status}</Text>
                  </View>
                  <Text style={s.dealType}>{deal.type}</Text>
                </View>
                <Text style={s.dealDetailAddress}>{deal.address}</Text>
                <View style={s.dealDetailMetrics}>
                  {[
                    { label: 'VALUE', val: deal.value },
                    { label: 'ROI', val: deal.roi, color: '#22C55E' },
                    { label: 'CAP RATE', val: deal.cap },
                  ].map(m => (
                    <View key={m.label} style={s.dealDetailMetric}>
                      <Text style={[s.dealDetailMetricVal, m.color ? { color: m.color } : {}]}>{m.val}</Text>
                      <Text style={s.dealDetailMetricLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <View style={s.pad}>
            <TouchableOpacity style={[s.analyzeBtn, analyzing && { opacity: 0.6 }]} onPress={handleAnalyzePortfolio} disabled={analyzing}>
              <Text style={s.analyzeBtnTxt}>{analyzing ? '🧠 ANALYZING...' : '🧠 ANALYZE PORTFOLIO'}</Text>
            </TouchableOpacity>

            {analysis.length > 0 ? (
              <View style={s.analysisCard}>
                <Text style={s.analysisTitle}>SAL PORTFOLIO ANALYSIS</Text>
                <Text style={s.analysisText}>{analysis}</Text>
                {analyzing && <Text style={s.cursor}>▋</Text>}
              </View>
            ) : !analyzing && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🧠</Text>
                <Text style={s.emptyTxt}>AI Portfolio Analysis</Text>
                <Text style={s.emptySub}>Get Claude-powered insights on your portfolio health, risks, and growth opportunities</Text>
              </View>
            )}
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
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  metricCard: { width: '47%', backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, alignItems: 'center' },
  metricIcon: { fontSize: 20, marginBottom: 6 },
  metricValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  metricLabel: { fontSize: 7, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 10 },
  dealCard: { backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  dealTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dealType: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dealStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  dealStatusTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  dealAddress: { fontSize: 13, fontWeight: '600', color: '#E8E6E1', marginBottom: 8 },
  dealMetrics: { flexDirection: 'row', gap: 14 },
  dealValue: { fontSize: 14, fontWeight: '800', color: GOLD },
  dealRoi: { fontSize: 12, fontWeight: '700' },
  dealCap: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  addDealBtn: { borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderStyle: 'dashed', marginTop: 6 },
  addDealTxt: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 2 },
  dealDetailCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 12 },
  dealDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dealDetailAddress: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 12, lineHeight: 20 },
  dealDetailMetrics: { flexDirection: 'row', gap: 0 },
  dealDetailMetric: { flex: 1, alignItems: 'center' },
  dealDetailMetricVal: { fontSize: 16, fontWeight: '800', color: GOLD, marginBottom: 4 },
  dealDetailMetricLabel: { fontSize: 7, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5 },
  analyzeBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  analyzeBtnTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  analysisCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: GOLD + '20' },
  analysisTitle: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 12 },
  analysisText: { fontSize: 13, color: '#E8E6E1', lineHeight: 22 },
  cursor: { color: GOLD, fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
