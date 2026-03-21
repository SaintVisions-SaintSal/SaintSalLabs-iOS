import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Image,
} from 'react-native';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';

const STRATEGIES = ['All', 'BRRRR', 'STR', 'Multifamily', 'Foreclosure'];

const PROPERTIES = [
  { address: '882 Bellagio Way', city: 'Los Angeles, CA 90077', price: '$4,250,000', strategy: 'Foreclosure', capRate: 5.8, cashFlow: 12000, equity: '62%', yield: '8.4%', badge: 'Foreclosure', badgeColor: C.red, saved: true },
  { address: '1204 Biscayne Blvd', city: 'Miami, FL 33132', price: '$1,890,000', strategy: 'BRRRR', capRate: 7.1, cashFlow: 9500, equity: '45%', yield: '6.1%', badge: 'NOD Filing', badgeColor: C.amber, saved: true },
  { address: '44 Highland Ave', city: 'Austin, TX 78701', price: '$950,000', strategy: 'Multifamily', capRate: 9.4, cashFlow: 5800, equity: '22%', yield: '10.2%', badge: 'Bankruptcy', badgeColor: C.purple, saved: false },
  { address: '725 5th Ave Unit 12B', city: 'New York, NY 10022', price: '$4,250,000', strategy: 'STR', capRate: 4.2, cashFlow: 18200, equity: '71%', yield: '5.8%', badge: 'Premium', badgeColor: C.gold, saved: true },
  { address: '101 Brickell Ave #3204', city: 'Miami, FL 33131', price: '$1,890,000', strategy: 'BRRRR', capRate: 7.1, cashFlow: 8400, equity: '38%', yield: '7.5%', badge: 'Value Add', badgeColor: C.green, saved: false },
  { address: '9012 Sunset Strip', city: 'Beverly Hills, CA 90210', price: '$8,700,000', strategy: 'STR', capRate: 4.2, cashFlow: 24500, equity: '85%', yield: '4.8%', badge: 'Legacy', badgeColor: C.gold, saved: true },
];

const TARGETS = [
  { address: '331 NW 26th St', city: 'Miami, FL 33127', estValue: '$1.2M', type: 'NOD', equity: '48%', daysListed: 12 },
  { address: '1455 Market St', city: 'San Francisco, CA 94103', estValue: '$3.8M', type: 'Foreclosure', equity: '55%', daysListed: 8 },
  { address: '742 Evergreen Terrace', city: 'Dallas, TX 75201', estValue: '$620K', type: 'Tax Lien', equity: '34%', daysListed: 21 },
];

export default function RealEstateScreen() {
  const router = useRouter();
  const [activeStrategy, setActiveStrategy] = useState('All');
  const [savedProperties, setSavedProperties] = useState(
    PROPERTIES.reduce((acc, p, i) => ({ ...acc, [i]: p.saved }), {})
  );

  const filtered = activeStrategy === 'All'
    ? PROPERTIES
    : PROPERTIES.filter(p => p.strategy === activeStrategy);

  const totalValue = 21.93;
  const avgCapRate = 6.3;
  const avgCashFlow = 13067;

  const toggleSave = (idx) => {
    setSavedProperties(prev => ({ ...prev, [idx]: !prev[idx] }));
    Alert.alert(
      savedProperties[idx] ? 'Removed' : 'Saved',
      savedProperties[idx] ? 'Property removed from portfolio' : 'Property saved to portfolio'
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={require('../../../assets/logo-80.png')} style={{ width: 28, height: 28, borderRadius: 14 }} resizeMode="contain" />
          <View>
            <Text style={s.headerTitle}>Real Estate Intel</Text>
            <Text style={s.headerSub}>CookinCapital Engine</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.sortBtn}>
            <Text style={s.sortBtnText}>↕ Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.exportBtn}>
            <Text style={s.exportBtnText}>↓ Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Map Placeholder */}
        <View style={s.mapContainer}>
          <View style={s.mapPlaceholder}>
            <Text style={s.mapEmoji}>🗺️</Text>
            <Text style={s.mapText}>Property Intelligence Map</Text>
            <Text style={s.mapSub}>42 leads in target markets</Text>
          </View>
          {/* Map Markers */}
          <View style={[s.mapMarker, { top: 30, left: 60 }]}>
            <View style={[s.markerDot, { backgroundColor: C.amber }]} />
          </View>
          <View style={[s.mapMarker, { top: 55, right: 80 }]}>
            <View style={[s.markerDot, { backgroundColor: C.red }]} />
          </View>
          <View style={[s.mapMarker, { bottom: 40, left: 120 }]}>
            <View style={[s.markerDot, { backgroundColor: C.green }]} />
          </View>
          {/* Map Controls */}
          <View style={s.mapControls}>
            <TouchableOpacity style={s.mapCtrlBtn}><Text style={{ fontSize: 16 }}>🔲</Text></TouchableOpacity>
            <TouchableOpacity style={s.mapCtrlBtn}><Text style={{ fontSize: 16 }}>📍</Text></TouchableOpacity>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>PORTFOLIO</Text>
            <Text style={s.statValue}>${totalValue}M</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>AVG CAP RATE</Text>
            <Text style={s.statValue}>{avgCapRate}%</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>AVG CASH FLOW</Text>
            <Text style={s.statValue}>${(avgCashFlow / 1000).toFixed(1)}K</Text>
          </View>
        </View>

        {/* Strategy Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          {STRATEGIES.map(st => (
            <TouchableOpacity
              key={st}
              style={[s.filterPill, activeStrategy === st && s.filterPillActive]}
              onPress={() => setActiveStrategy(st)}
            >
              <Text style={[s.filterText, activeStrategy === st && s.filterTextActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Saved Portfolio */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Saved Portfolio</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{filtered.length}</Text>
          </View>
        </View>

        <View style={s.propertyList}>
          {filtered.map((p, i) => (
            <TouchableOpacity key={i} style={s.propertyCard} activeOpacity={0.7}>
              {/* Image Placeholder */}
              <View style={s.propImageWrap}>
                <View style={s.propImage}>
                  <Text style={{ fontSize: 28 }}>🏠</Text>
                </View>
                <View style={[s.propBadge, { backgroundColor: p.badgeColor + '22' }]}>
                  <Text style={[s.propBadgeText, { color: p.badgeColor }]}>{p.badge}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={s.propContent}>
                <View style={s.propHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.propAddress}>{p.address}</Text>
                    <Text style={s.propCity}>📍 {p.city}</Text>
                  </View>
                  <View style={s.propPriceWrap}>
                    <Text style={s.propPrice}>{p.price}</Text>
                    <Text style={s.propPriceSub}>Est. Value</Text>
                  </View>
                </View>

                {/* Metrics */}
                <View style={s.propMetrics}>
                  <View style={s.propMetric}>
                    <Text style={s.propMetricLabel}>EQUITY</Text>
                    <Text style={s.propMetricValue}>{p.equity}</Text>
                  </View>
                  <View style={s.propMetric}>
                    <Text style={s.propMetricLabel}>YIELD</Text>
                    <Text style={s.propMetricValue}>{p.yield}</Text>
                  </View>
                  <View style={s.propMetric}>
                    <Text style={s.propMetricLabel}>CASH FLOW</Text>
                    <Text style={s.propMetricValue}>${(p.cashFlow / 1000).toFixed(1)}K</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.propActions}>
                  <TouchableOpacity style={s.detailsBtn}>
                    <Text style={s.detailsBtnText}>Analyze</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.capBtn}>
                    <Text style={s.capBtnText}>Cap: {p.capRate}%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.bookmarkBtn, savedProperties[i] && s.bookmarkActive]}
                    onPress={() => toggleSave(i)}
                  >
                    <Text style={{ fontSize: 16 }}>{savedProperties[i] ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* High-Intent Targets */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>High-Intent Targets</Text>
          <View style={[s.countBadge, { backgroundColor: C.redGhost }]}>
            <Text style={[s.countText, { color: C.red }]}>{TARGETS.length} LEADS</Text>
          </View>
        </View>
        <Text style={s.targetsSub}>Real-time intelligence from court filings</Text>

        <View style={s.targetList}>
          {TARGETS.map((t, i) => (
            <TouchableOpacity key={i} style={s.targetCard} activeOpacity={0.7}>
              <View style={s.targetHeader}>
                <View>
                  <Text style={s.targetAddress}>{t.address}</Text>
                  <Text style={s.targetCity}>{t.city}</Text>
                </View>
                <Text style={s.targetValue}>{t.estValue}</Text>
              </View>
              <View style={s.targetMetrics}>
                <View style={[s.targetTag, { backgroundColor: C.redGhost }]}>
                  <Text style={[s.targetTagText, { color: C.red }]}>{t.type}</Text>
                </View>
                <Text style={s.targetMeta}>Equity: {t.equity}</Text>
                <Text style={s.targetMeta}>{t.daysListed}d listed</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verdict Card */}
        <View style={s.verdictCard}>
          <Text style={s.verdictLabel}>SAINTSALLABS VERDICT</Text>
          <View style={s.verdictRow}>
            <View style={s.verdictItem}>
              <Text style={s.verdictItemLabel}>Buy Threshold</Text>
              <Text style={s.verdictItemValue}>MATCHED</Text>
            </View>
            <View style={s.verdictItem}>
              <Text style={s.verdictItemLabel}>Risk Level</Text>
              <Text style={[s.verdictItemValue, { color: C.green }]}>LOW</Text>
            </View>
            <View style={s.verdictItem}>
              <Text style={s.verdictItemLabel}>5-Yr Exit</Text>
              <Text style={s.verdictItemValue}>$28.4M</Text>
            </View>
          </View>
          <TouchableOpacity style={s.offerBtn}>
            <Text style={s.offerBtnText}>Initiate Offer Flow</Text>
          </TouchableOpacity>
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
  headerRight: { flexDirection: 'row', gap: 8 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  sortBtnText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  exportBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  exportBtnText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  scroll: { flex: 1 },
  mapContainer: { height: 180, marginHorizontal: 16, marginTop: 16, borderRadius: 14, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, overflow: 'hidden', position: 'relative' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapEmoji: { fontSize: 36, marginBottom: 8 },
  mapText: { fontSize: 14, fontWeight: '700', color: C.text },
  mapSub: { fontSize: 11, color: C.textDim, marginTop: 4 },
  mapMarker: { position: 'absolute' },
  markerDot: { width: 12, height: 12, borderRadius: 6, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  mapControls: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', gap: 6 },
  mapCtrlBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg + 'E6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderGlow },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 },
  statCard: { flex: 1, backgroundColor: C.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: C.textDim, marginBottom: 6 },
  statValue: { fontSize: 17, fontWeight: '800', color: C.amber },
  filterScroll: { marginTop: 16, paddingLeft: 16 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  filterPillActive: { backgroundColor: C.amber, borderColor: C.amber },
  filterText: { fontSize: 12, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterTextActive: { color: C.bg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  countBadge: { backgroundColor: C.amberGhost, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '700', color: C.amber },
  targetsSub: { fontSize: 12, color: C.textDim, paddingHorizontal: 20, marginTop: -6, marginBottom: 12 },
  propertyList: { paddingHorizontal: 16, gap: 12 },
  propertyCard: { backgroundColor: C.bgCard, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  propImageWrap: { height: 100, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  propImage: { alignItems: 'center', justifyContent: 'center' },
  propBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  propBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  propContent: { padding: 16 },
  propHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propAddress: { fontSize: 15, fontWeight: '700', color: C.text },
  propCity: { fontSize: 12, color: C.textDim, marginTop: 3 },
  propPriceWrap: { alignItems: 'flex-end' },
  propPrice: { fontSize: 15, fontWeight: '800', color: C.amber },
  propPriceSub: { fontSize: 9, color: C.textDim, marginTop: 2 },
  propMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  propMetric: { alignItems: 'center' },
  propMetricLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 0.5, marginBottom: 4 },
  propMetricValue: { fontSize: 14, fontWeight: '700', color: C.text },
  propActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  detailsBtn: { flex: 1, backgroundColor: C.amberGhost, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: C.borderGlow },
  detailsBtnText: { fontSize: 12, fontWeight: '700', color: C.amber },
  capBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  capBtnText: { fontSize: 12, fontWeight: '700', color: C.green },
  bookmarkBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  bookmarkActive: { borderColor: C.amber, backgroundColor: C.amberGhost },
  targetList: { paddingHorizontal: 16, gap: 10 },
  targetCard: { backgroundColor: C.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  targetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  targetAddress: { fontSize: 14, fontWeight: '600', color: C.text },
  targetCity: { fontSize: 11, color: C.textDim, marginTop: 2 },
  targetValue: { fontSize: 14, fontWeight: '800', color: C.amber },
  targetMetrics: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  targetTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  targetTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  targetMeta: { fontSize: 11, color: C.textDim },
  verdictCard: { marginHorizontal: 16, marginTop: 24, backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.borderGlow },
  verdictLabel: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1.5, marginBottom: 16 },
  verdictRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  verdictItem: { alignItems: 'center' },
  verdictItemLabel: { fontSize: 10, color: C.textDim, marginBottom: 4 },
  verdictItemValue: { fontSize: 15, fontWeight: '800', color: C.text },
  offerBtn: { backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  offerBtnText: { fontSize: 14, fontWeight: '800', color: C.bg },
});
