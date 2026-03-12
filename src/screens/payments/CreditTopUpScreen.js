import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { C } from '../../config/theme';

const BALANCE = { total: 2000, used: 1247, remaining: 753 };

const PACKAGES = [
  { id: 'p100', credits: 100, price: 5, bonus: null },
  { id: 'p500', credits: 500, price: 20, bonus: '💎 Best for Starters' },
  { id: 'p1000', credits: 1000, price: 35, bonus: '🔥 Most Popular' },
  { id: 'p5000', credits: 5000, price: 150, bonus: '⚡ Best Value' },
];

const COMPUTE_RATES = [
  { model: 'SAL Mini', rate: '$0.05/min', icon: '🤖', color: C.textDim },
  { model: 'SAL Pro', rate: '$0.25/min', icon: '⚡', color: C.purple },
  { model: 'SAL Max', rate: '$0.75/min', icon: '🔥', color: C.amber },
  { model: 'SAL Max Fast', rate: '$1.00/min', icon: '🚀', color: C.green },
];

export default function CreditTopUpScreen() {
  const [selectedPkg, setSelectedPkg] = useState('p1000');
  const creditPct = BALANCE.used / BALANCE.total;

  const selected = PACKAGES.find((p) => p.id === selectedPkg);

  const handlePurchase = () => {
    if (!selected) return;
    Alert.alert(
      'Confirm Purchase',
      `Buy ${selected.credits.toLocaleString()} credits for $${selected.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: () => Alert.alert('Success', `${selected.credits.toLocaleString()} credits added to your account!`) },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn}>
          <Text style={s.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Top Up Credits</Text>
          <Text style={s.headerSub}>INTELLIGENCE BALANCE</Text>
        </View>
        <View style={s.balancePill}>
          <Text style={s.balanceIcon}>🪙</Text>
          <Text style={s.balanceValue}>{BALANCE.remaining.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Current Balance Card */}
        <View style={s.section}>
          <View style={s.balanceCard}>
            <View style={s.balanceTop}>
              <View>
                <Text style={s.balanceLabel}>CURRENT BALANCE</Text>
                <Text style={s.balanceLarge}>{BALANCE.remaining.toLocaleString()}</Text>
                <Text style={s.balanceMeta}>
                  {BALANCE.used.toLocaleString()} of {BALANCE.total.toLocaleString()} used this cycle
                </Text>
              </View>
              <Text style={{ fontSize: 32 }}>💰</Text>
            </View>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.min(creditPct * 100, 100)}%` }]} />
            </View>
            <View style={s.balanceStats}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{Math.round((1 - creditPct) * 100)}%</Text>
                <Text style={s.statLabel}>Remaining</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>~{Math.round(BALANCE.remaining / 42)} days</Text>
                <Text style={s.statLabel}>Est. Runway</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>Pro</Text>
                <Text style={s.statLabel}>Current Plan</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Credit Packages */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SELECT PACKAGE</Text>
          <View style={s.packagesGrid}>
            {PACKAGES.map((pkg) => {
              const isActive = selectedPkg === pkg.id;
              const perCredit = (pkg.price / pkg.credits * 100).toFixed(1);

              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[s.packageCard, isActive && s.packageCardActive]}
                  onPress={() => setSelectedPkg(pkg.id)}
                  activeOpacity={0.8}
                >
                  {pkg.bonus && (
                    <View style={[s.bonusBadge, isActive && s.bonusBadgeActive]}>
                      <Text style={s.bonusText}>{pkg.bonus}</Text>
                    </View>
                  )}
                  <Text style={[s.pkgCredits, isActive && s.pkgCreditsActive]}>
                    {pkg.credits.toLocaleString()}
                  </Text>
                  <Text style={s.pkgCreditLabel}>credits</Text>
                  <Text style={[s.pkgPrice, isActive && s.pkgPriceActive]}>
                    ${pkg.price}
                  </Text>
                  <Text style={s.pkgRate}>{perCredit}¢ per credit</Text>
                  {isActive && <View style={s.pkgCheck}><Text style={s.pkgCheckIcon}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Order Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ORDER SUMMARY</Text>
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Credits</Text>
              <Text style={s.summaryValue}>{selected?.credits.toLocaleString()}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Price</Text>
              <Text style={s.summaryValue}>${selected?.price}</Text>
            </View>
            <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={s.summaryLabel}>New Balance</Text>
              <Text style={[s.summaryValue, { color: C.green }]}>
                {(BALANCE.remaining + (selected?.credits || 0)).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Purchase Button */}
        <View style={s.section}>
          <TouchableOpacity style={s.purchaseBtn} onPress={handlePurchase} activeOpacity={0.85}>
            <Text style={s.purchaseBtnText}>
              Purchase {selected?.credits.toLocaleString()} Credits — ${selected?.price}
            </Text>
          </TouchableOpacity>
          <View style={s.secureRow}>
            <Text style={s.secureIcon}>🔒</Text>
            <Text style={s.secureText}>Secure Checkout · Powered by Stripe</Text>
          </View>
        </View>

        {/* Metered Compute Rates */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>METERED COMPUTE RATES</Text>
          <View style={s.ratesCard}>
            {COMPUTE_RATES.map((r) => (
              <View key={r.model} style={s.rateRow}>
                <View style={[s.rateIcon, { backgroundColor: r.color + '15' }]}>
                  <Text style={{ fontSize: 16 }}>{r.icon}</Text>
                </View>
                <Text style={s.rateModel}>{r.model}</Text>
                <Text style={[s.rateValue, { color: r.color }]}>{r.rate}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Credits never expire. Unused credits roll over to the next billing cycle.
          </Text>
          <View style={s.stripeBadge}>
            <Text style={s.stripeIcon}>💳</Text>
            <Text style={s.stripeBadgeLabel}>SECURED BY STRIPE</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderGlow, backgroundColor: C.bgCard },
  headerBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 16, color: C.amber },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: C.amber, marginTop: 2 },
  balancePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow },
  balanceIcon: { fontSize: 14 },
  balanceValue: { fontSize: 14, fontWeight: '800', color: C.amber },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 12 },
  balanceCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.borderGlow },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amberDim },
  balanceLarge: { fontSize: 40, fontWeight: '800', color: C.text, marginTop: 4, letterSpacing: -1 },
  balanceMeta: { fontSize: 12, color: C.textDim, marginTop: 4 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: C.border, marginTop: 16 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: C.amber },
  balanceStats: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 10, color: C.textDim, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border },
  packagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  packageCard: { width: '47%', backgroundColor: C.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  packageCardActive: { borderColor: C.amber, borderWidth: 2, backgroundColor: C.amberGhost },
  bonusBadge: { position: 'absolute', top: -10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  bonusBadgeActive: { backgroundColor: C.amber, borderColor: C.amber },
  bonusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, color: C.textSub },
  pkgCredits: { fontSize: 28, fontWeight: '800', color: C.text, marginTop: 8 },
  pkgCreditsActive: { color: C.amber },
  pkgCreditLabel: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 1, textTransform: 'uppercase' },
  pkgPrice: { fontSize: 20, fontWeight: '800', color: C.textSub, marginTop: 8 },
  pkgPriceActive: { color: C.text },
  pkgRate: { fontSize: 10, color: C.textDim, marginTop: 4 },
  pkgCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  pkgCheckIcon: { fontSize: 12, fontWeight: '800', color: C.bg },
  summaryCard: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  summaryValue: { fontSize: 14, fontWeight: '700', color: C.text },
  purchaseBtn: { height: 54, borderRadius: 12, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  purchaseBtnText: { fontSize: 14, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 6 },
  secureIcon: { fontSize: 12 },
  secureText: { fontSize: 11, color: C.textDim, fontWeight: '600' },
  ratesCard: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  rateRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  rateIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rateModel: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
  rateValue: { fontSize: 14, fontWeight: '800', fontFamily: 'monospace' },
  footer: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 28, paddingBottom: 40 },
  footerText: { fontSize: 11, color: C.textDim, textAlign: 'center', lineHeight: 18 },
  stripeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, gap: 6, opacity: 0.6 },
  stripeIcon: { fontSize: 12 },
  stripeBadgeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
});
