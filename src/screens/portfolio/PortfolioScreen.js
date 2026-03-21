import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';

const STRATEGIES = ['All', 'Growth', 'Value', 'Dividend', 'Momentum'];

const HOLDINGS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', shares: 150, price: 924.80, cost: 485.20, change: 2.34, strategy: 'Growth', sector: 'Technology' },
  { ticker: 'AAPL', name: 'Apple Inc', shares: 320, price: 198.50, cost: 142.60, change: -0.45, strategy: 'Growth', sector: 'Technology' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', shares: 200, price: 162.30, cost: 155.10, change: 0.82, strategy: 'Dividend', sector: 'Healthcare' },
  { ticker: 'MSFT', name: 'Microsoft Corp', shares: 180, price: 428.90, cost: 310.40, change: 1.18, strategy: 'Growth', sector: 'Technology' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', shares: 95, price: 412.60, cost: 328.50, change: 0.56, strategy: 'Value', sector: 'Financials' },
  { ticker: 'KO', name: 'Coca-Cola Co', shares: 450, price: 62.40, cost: 54.80, change: -0.22, strategy: 'Dividend', sector: 'Consumer Staples' },
  { ticker: 'QCOM', name: 'Qualcomm Inc', shares: 260, price: 178.20, cost: 128.90, change: 3.12, strategy: 'Momentum', sector: 'Technology' },
  { ticker: 'PG', name: 'Procter & Gamble', shares: 180, price: 168.90, cost: 148.40, change: 0.34, strategy: 'Dividend', sector: 'Consumer Staples' },
  { ticker: 'V', name: 'Visa Inc', shares: 140, price: 282.70, cost: 218.60, change: 1.05, strategy: 'Value', sector: 'Financials' },
  { ticker: 'AMD', name: 'Advanced Micro', shares: 300, price: 172.40, cost: 98.50, change: 4.28, strategy: 'Momentum', sector: 'Technology' },
];

const SECTORS = [
  { name: 'Technology', pct: 52.4, color: C.amber },
  { name: 'Financials', pct: 16.8, color: C.blue },
  { name: 'Healthcare', pct: 10.2, color: C.green },
  { name: 'Consumer Staples', pct: 12.1, color: C.purple },
  { name: 'Other', pct: 8.5, color: C.textDim },
];

function calcPL(h) { return (h.price - h.cost) * h.shares; }
function calcPLPct(h) { return ((h.price - h.cost) / h.cost) * 100; }

export default function PortfolioScreen() {
  const router = useRouter();
  const [activeStrategy, setActiveStrategy] = useState('All');

  const filtered = activeStrategy === 'All'
    ? HOLDINGS
    : HOLDINGS.filter(h => h.strategy === activeStrategy);

  const totalValue = HOLDINGS.reduce((s, h) => s + h.price * h.shares, 0);
  const totalCost = HOLDINGS.reduce((s, h) => s + h.cost * h.shares, 0);
  const totalReturn = totalValue - totalCost;
  const totalReturnPct = ((totalReturn / totalCost) * 100).toFixed(1);
  const dayChange = HOLDINGS.reduce((s, h) => s + (h.change / 100) * h.price * h.shares, 0);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={require('../../../assets/logo-80.png')} style={{ width: 28, height: 28, borderRadius: 14 }} resizeMode="contain" />
          <Text style={s.headerTitle}>My Portfolio</Text>
        </View>
        <TouchableOpacity style={s.notifBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, s.summaryCardPrimary]}>
            <Text style={s.summaryLabel}>TOTAL VALUE</Text>
            <Text style={s.summaryValue}>${(totalValue / 1e6).toFixed(2)}M</Text>
            <View style={s.changeRow}>
              <Text style={s.changeUp}>📈 +{totalReturnPct}% all time</Text>
            </View>
          </View>
          <View style={s.summaryHalf}>
            <View style={s.summaryCardSmall}>
              <Text style={s.summaryLabel}>DAY CHANGE</Text>
              <Text style={[s.summaryValueSm, { color: dayChange >= 0 ? C.green : C.red }]}>
                {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(0)}
              </Text>
            </View>
            <View style={s.summaryCardSmall}>
              <Text style={s.summaryLabel}>TOTAL RETURN</Text>
              <Text style={[s.summaryValueSm, { color: C.green }]}>
                +${(totalReturn / 1e3).toFixed(1)}K
              </Text>
            </View>
          </View>
        </View>

        {/* Strategy Filters */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Holdings</Text>
          <Text style={s.countBadge}>{filtered.length}</Text>
        </View>
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

        {/* Holdings List */}
        <View style={s.holdingsList}>
          {filtered.map((h, i) => {
            const pl = calcPL(h);
            const plPct = calcPLPct(h);
            const isUp = pl >= 0;
            return (
              <TouchableOpacity key={i} style={s.holdingCard} activeOpacity={0.7}>
                <View style={s.holdingTop}>
                  <View style={s.tickerWrap}>
                    <View style={[s.tickerBadge, { backgroundColor: isUp ? C.greenGhost : C.redGhost }]}>
                      <Text style={[s.tickerText, { color: isUp ? C.green : C.red }]}>{h.ticker}</Text>
                    </View>
                    <View>
                      <Text style={s.holdingName}>{h.name}</Text>
                      <Text style={s.holdingShares}>{h.shares} shares · {h.strategy}</Text>
                    </View>
                  </View>
                  <View style={s.holdingRight}>
                    <Text style={s.holdingPrice}>${h.price.toFixed(2)}</Text>
                    <Text style={[s.holdingChange, { color: h.change >= 0 ? C.green : C.red }]}>
                      {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change).toFixed(2)}%
                    </Text>
                  </View>
                </View>
                <View style={s.holdingBottom}>
                  <View style={s.plWrap}>
                    <Text style={s.plLabel}>P&L</Text>
                    <Text style={[s.plValue, { color: isUp ? C.green : C.red }]}>
                      {isUp ? '+' : '-'}${Math.abs(pl).toFixed(0)}
                    </Text>
                  </View>
                  <View style={s.plWrap}>
                    <Text style={s.plLabel}>Return</Text>
                    <Text style={[s.plValue, { color: isUp ? C.green : C.red }]}>
                      {isUp ? '+' : ''}{plPct.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={s.plWrap}>
                    <Text style={s.plLabel}>Cost Basis</Text>
                    <Text style={s.plValueNeutral}>${h.cost.toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sector Allocation */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Sector Allocation</Text>
        </View>
        <View style={s.sectorCard}>
          {/* Bar Chart */}
          <View style={s.barChart}>
            {SECTORS.map((sec, i) => (
              <View key={i} style={[s.bar, { flex: sec.pct, backgroundColor: sec.color }]} />
            ))}
          </View>
          {/* Legend */}
          <View style={s.sectorLegend}>
            {SECTORS.map((sec, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: sec.color }]} />
                <Text style={s.legendName}>{sec.name}</Text>
                <Text style={s.legendPct}>{sec.pct}%</Text>
              </View>
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  notifBtn: { padding: 8 },
  scroll: { flex: 1 },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  summaryCardPrimary: { flex: 1, backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.borderGlow },
  summaryHalf: { width: 140, gap: 12 },
  summaryCardSmall: { flex: 1, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  summaryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: C.textDim, marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: '800', color: C.amber, letterSpacing: -0.5 },
  summaryValueSm: { fontSize: 18, fontWeight: '700' },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  changeUp: { fontSize: 12, fontWeight: '600', color: C.green },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  countBadge: { fontSize: 11, fontWeight: '700', color: C.amber, backgroundColor: C.amberGhost, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  filterScroll: { paddingLeft: 16, marginBottom: 8 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  filterPillActive: { backgroundColor: C.amber, borderColor: C.amber },
  filterText: { fontSize: 12, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterTextActive: { color: C.bg },
  holdingsList: { paddingHorizontal: 16, gap: 10 },
  holdingCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  holdingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tickerWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tickerBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tickerText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  holdingName: { fontSize: 14, fontWeight: '600', color: C.text },
  holdingShares: { fontSize: 11, color: C.textDim, marginTop: 2 },
  holdingRight: { alignItems: 'flex-end' },
  holdingPrice: { fontSize: 15, fontWeight: '700', color: C.text },
  holdingChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  holdingBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  plWrap: { alignItems: 'center' },
  plLabel: { fontSize: 10, fontWeight: '600', color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  plValue: { fontSize: 13, fontWeight: '700' },
  plValueNeutral: { fontSize: 13, fontWeight: '700', color: C.textSub },
  sectorCard: { marginHorizontal: 16, backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.border },
  barChart: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2, marginBottom: 16 },
  bar: { borderRadius: 5 },
  sectorLegend: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '500', color: C.textSub },
  legendPct: { fontSize: 13, fontWeight: '700', color: C.text },
});
