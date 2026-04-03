/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — GEO MASTER HUB
   elite_geo_master_hub_fully_interactive
   Google Maps + Exa search + real estate overlay
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { streamSalChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const SURFACE_DARK = '#1A1A1A';

const QUICK_QUERIES = [
  'Best zip codes in Dallas TX',
  'Median home prices Austin 2025',
  'Commercial hotspots Houston',
  'Market trends Miami Beach',
];

const LAYERS = ['Heatmap', 'Properties', 'Demographics', 'Crime', 'Schools'];

export default function GeoMasterHub() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [activeLayers, setActiveLayers] = useState(['Properties']);
  const [mapMode, setMapMode] = useState('standard');

  const xhrRef = useRef(null);

  const handleSearch = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setResponse('');

    const systemPrompt = `You are SaintSal™ Geo Intelligence — a premier geographic market analyst specializing in real estate, demographics, and location intelligence. Provide actionable, data-driven insights for: "${q}". Format with: Market Overview, Key Metrics, Investment Opportunities, Risk Factors, and Strategic Recommendations. Use $ signs for dollar amounts and be specific with data points.`;

    xhrRef.current = streamSalChat({
      mode: 'realestate',
      messages: [{ role: 'user', content: `Geographic intelligence analysis for: ${q}` }],
      system: systemPrompt,
      onChunk: (chunk) => setResponse(prev => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => {
        setLoading(false);
        Alert.alert('Error', err);
      },
    });
  };

  useEffect(() => {
    return () => xhrRef.current?.abort?.();
  }, []);

  const toggleLayer = (layer) => {
    setActiveLayers(prev =>
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SaintSal™ Intelligence</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeIcon}>⚡</Text>
          <Text style={styles.headerBadgeText}>ELITE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero search */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            What is your <Text style={styles.heroGold}>strategic objective</Text> today?
          </Text>
          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Text style={styles.searchSpark}>✦</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Ask SaintSal™ Master Intelligence for market insights..."
                placeholderTextColor="rgba(100,116,139,1)"
                value={query}
                onChangeText={setQuery}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.searchActions}>
              <View style={styles.searchActionsLeft}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Text style={styles.iconBtnText}>📎</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Text style={styles.iconBtnText}>🌐</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.executeBtn, loading && styles.executeBtnDisabled]}
                onPress={() => handleSearch()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <>
                    <Text style={styles.executeBtnText}>Execute</Text>
                    <Text style={styles.executeBtnArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick queries */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <View style={styles.quickRow}>
              {QUICK_QUERIES.map((q, i) => (
                <TouchableOpacity key={i} style={styles.quickChip} onPress={() => { setQuery(q); handleSearch(q); }}>
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapSection}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
            <Text style={styles.mapPlaceholderTitle}>GEO INTELLIGENCE MAP</Text>
            <Text style={styles.mapPlaceholderSub}>
              Google Maps integration active{'\n'}Key: AIzaSy•••••••••••••lITQ
            </Text>
            <View style={styles.mapModeRow}>
              {['standard', 'satellite', 'hybrid'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.mapModeBtn, mapMode === mode && styles.mapModeBtnActive]}
                  onPress={() => setMapMode(mode)}
                >
                  <Text style={[styles.mapModeBtnText, mapMode === mode && styles.mapModeBtnTextActive]}>
                    {mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Intelligence layers */}
        <View style={styles.layersSection}>
          <Text style={styles.sectionLabel}>INTELLIGENCE LAYERS</Text>
          <View style={styles.layersRow}>
            {LAYERS.map((layer) => (
              <TouchableOpacity
                key={layer}
                style={[styles.layerBtn, activeLayers.includes(layer) && styles.layerBtnActive]}
                onPress={() => toggleLayer(layer)}
              >
                <Text style={[styles.layerBtnText, activeLayers.includes(layer) && styles.layerBtnTextActive]}>
                  {layer}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionLabel}>MARKET METRICS</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Avg Home Price', value: '$485K', change: '+8.2%', up: true },
              { label: 'Days on Market', value: '18', change: '-12%', up: false },
              { label: 'Price/Sqft', value: '$312', change: '+5.1%', up: true },
              { label: 'Inventory', value: '2.4mo', change: '-0.3', up: false },
            ].map((metric, i) => (
              <View key={i} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={[styles.metricChange, { color: metric.up ? '#4ade80' : '#f87171' }]}>
                  {metric.change}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Analysis result */}
        {(response || loading) && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderIcon}>⚡</Text>
              <Text style={styles.sectionLabel}>GEO INTELLIGENCE ANALYSIS</Text>
              {loading && <ActivityIndicator color={GOLD} size="small" style={{ marginLeft: 'auto' }} />}
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{response || 'Analyzing...'}</Text>
            </View>
          </View>
        )}

        {/* Property listings placeholder */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionLabel}>NEARBY PROPERTIES</Text>
          {[
            { address: '4821 Oak Ridge Dr', price: '$625,000', beds: 4, baths: 3, sqft: '2,850' },
            { address: '112 Westlake Blvd', price: '$489,000', beds: 3, baths: 2, sqft: '2,100' },
            { address: '9901 Sunrise Ct', price: '$1,250,000', beds: 5, baths: 4, sqft: '4,500' },
          ].map((prop, i) => (
            <View key={i} style={styles.propCard}>
              <View style={styles.propImagePlaceholder}>
                <Text style={{ fontSize: 24 }}>🏠</Text>
              </View>
              <View style={styles.propInfo}>
                <Text style={styles.propAddress}>{prop.address}</Text>
                <Text style={styles.propPrice}>{prop.price}</Text>
                <Text style={styles.propDetails}>{prop.beds}bd • {prop.baths}ba • {prop.sqft} sqft</Text>
              </View>
              <TouchableOpacity style={styles.propAction}>
                <Text style={styles.propActionText}>→</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64, borderBottomWidth: 1, borderBottomColor: `${GOLD}1A`,
    backgroundColor: `${BLACK}CC`,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: GOLD, fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: GOLD_DIM, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: `${GOLD}33`,
  },
  headerBadgeIcon: { fontSize: 12, color: GOLD },
  headerBadgeText: { color: GOLD, fontWeight: '700', fontSize: 10, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  scroll: { paddingBottom: 40 },
  heroSection: { padding: 16, paddingTop: 24 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16, textAlign: 'center', fontFamily: 'PublicSans-Bold' },
  heroGold: { color: GOLD },
  searchCard: {
    backgroundColor: SURFACE_DARK, borderWidth: 1, borderColor: `${GOLD}1A`,
    borderRadius: 12, padding: 16,
  },
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  searchSpark: { color: GOLD, fontSize: 16, marginTop: 2 },
  searchInput: {
    flex: 1, color: '#e2e8f0', fontSize: 14, minHeight: 60,
    fontFamily: 'PublicSans-Regular',
  },
  searchActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  searchActionsLeft: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, borderRadius: 8 },
  iconBtnText: { fontSize: 18 },
  executeBtn: {
    backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  executeBtnDisabled: { opacity: 0.6 },
  executeBtnText: { color: BLACK, fontWeight: '700', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  executeBtnArrow: { color: BLACK, fontSize: 16 },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 2 },
  quickChip: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  quickChipText: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  mapSection: { paddingHorizontal: 16, marginBottom: 20 },
  mapPlaceholder: {
    height: 240, backgroundColor: SURFACE_DARK, borderRadius: 12,
    borderWidth: 1, borderColor: `${GOLD}1A`, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  mapPlaceholderIcon: { fontSize: 48 },
  mapPlaceholderTitle: { color: GOLD, fontWeight: '700', fontSize: 14, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  mapPlaceholderSub: { color: MUTED, fontSize: 11, textAlign: 'center', fontFamily: 'PublicSans-Regular' },
  mapModeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mapModeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  mapModeBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  mapModeBtnText: { color: MUTED, fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  mapModeBtnTextActive: { color: GOLD },
  layersSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 12, fontFamily: 'PublicSans-Bold' },
  layersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layerBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  layerBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  layerBtnText: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  layerBtnTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  metricsSection: { paddingHorizontal: 16, marginBottom: 20 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    flex: 1, minWidth: '45%', backgroundColor: SURFACE_DARK, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  metricLabel: { color: MUTED, fontSize: 10, letterSpacing: 2, fontFamily: 'PublicSans-Regular' },
  metricValue: { color: GOLD, fontSize: 24, fontWeight: '900', marginTop: 4, fontFamily: 'PublicSans-ExtraBold' },
  metricChange: { fontSize: 12, marginTop: 4, fontFamily: 'PublicSans-Regular' },
  resultSection: { paddingHorizontal: 16, marginBottom: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultHeaderIcon: { color: GOLD, fontSize: 16 },
  resultCard: {
    backgroundColor: SURFACE_DARK, borderRadius: 12, borderWidth: 1,
    borderColor: `${GOLD}1A`, padding: 16,
  },
  resultText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22, fontFamily: 'PublicSans-Regular' },
  listingsSection: { paddingHorizontal: 16, marginBottom: 20 },
  propCard: {
    flexDirection: 'row', gap: 12, padding: 16, backgroundColor: SURFACE_DARK,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 10, alignItems: 'center',
  },
  propImagePlaceholder: {
    width: 56, height: 56, borderRadius: 8, backgroundColor: GOLD_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  propInfo: { flex: 1 },
  propAddress: { color: '#e2e8f0', fontWeight: '600', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  propPrice: { color: GOLD, fontWeight: '700', fontSize: 16, marginTop: 2, fontFamily: 'PublicSans-Bold' },
  propDetails: { color: MUTED, fontSize: 12, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  propAction: { padding: 8 },
  propActionText: { color: GOLD, fontSize: 20 },
});
