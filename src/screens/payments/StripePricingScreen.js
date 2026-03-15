import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, Dimensions, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C, PRICING_TIERS } from '../../config/theme';
import AuthContext from '../../lib/AuthContext';

const LABS_API = 'https://saintsallabs.com/api/mcp/stripe';
const SAL_KEY  = 'sal-live-2026';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

const FEATURE_MATRIX = [
  { feature: 'Monthly Credits', values: ['100', '500', '2,000', '10,000', 'Unlimited'] },
  { feature: 'AI Model', values: ['SAL Mini', 'SAL Pro', 'SAL Max', 'SAL Max Fast', 'All Models'] },
  { feature: 'Intelligence Suites', values: ['3', '6', '12', '12', '12 + Custom'] },
  { feature: 'Builder IDE', values: ['—', '✓', '✓', '✓', '✓'] },
  { feature: 'Real-Time Analytics', values: ['—', '—', '✓', '✓', '✓'] },
  { feature: 'API Access', values: ['—', '—', '✓', '✓', '✓'] },
  { feature: 'Team Seats', values: ['1', '1', '1', '10', 'Unlimited'] },
  { feature: 'GHL CRM', values: ['—', '—', '—', '✓', '✓'] },
  { feature: 'HACP Protocol', values: ['—', '—', '—', '—', '✓'] },
  { feature: 'Priority Support', values: ['—', '—', '✓', '✓', 'Dedicated'] },
  { feature: 'Custom SLA', values: ['—', '—', '—', '—', '✓'] },
];

const FAQ = [
  { q: 'Can I switch plans anytime?', a: 'Yes. Upgrades are instant and prorated. Downgrades take effect at the next billing cycle.' },
  { q: 'What happens when I run out of credits?', a: 'You can purchase top-up packs or enable metered billing. Your existing work is never deleted.' },
  { q: 'Do credits roll over?', a: 'Unused credits roll over for one billing cycle. Top-up credits never expire.' },
  { q: 'Is there a free trial for Pro?', a: 'New accounts get 100 free credits to try any model. Upgrade anytime with no commitment.' },
  { q: 'What is the HACP Protocol?', a: 'US Patent #10,290,222 — our proprietary intelligence stitching protocol that powers multi-model AI orchestration.' },
];

const PRICE_KEY_MAP = {
  Free:       { mo: 'free_mo',       yr: 'free_yr' },
  Starter:    { mo: 'starter_mo',    yr: 'starter_yr' },
  Pro:        { mo: 'pro_mo',        yr: 'pro_yr' },
  Teams:      { mo: 'teams_mo',      yr: 'teams_yr' },
  Enterprise: { mo: 'enterprise_mo', yr: 'enterprise_yr' },
};

export default function StripePricingScreen() {
  const router = useRouter();
  const { user, profile } = useContext(AuthContext);
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const scrollRef = useRef(null);

  const handleSubscribe = async (tierName) => {
    setLoadingTier(tierName);
    try {
      const priceKey = PRICE_KEY_MAP[tierName]?.[isAnnual ? 'yr' : 'mo'];
      const res = await fetch(LABS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': SAL_KEY },
        body: JSON.stringify({
          action: 'create_checkout',
          payload: {
            priceKey,
            email:      user?.email || profile?.email || '',
            successUrl: 'https://saintsallabs.com/success?upgraded=1',
            cancelUrl:  'https://saintsallabs.com/pricing',
            metadata:   { userId: user?.id || '', plan: tierName.toLowerCase(), source: 'ios' },
          },
        }),
      });
      const data = await res.json();
      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', data?.error || 'Could not start checkout. Try again.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const getPrice = (price) => {
    if (price === 0) return '$0';
    if (isAnnual) return `$${Math.round(price * 0.8)}`;
    return `$${price}`;
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Text style={s.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerDot} />
          <Text style={s.headerLogo}>SAINTSALLABS</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Elevate Your{'\n'}Intelligence</Text>
          <Text style={s.heroSub}>
            Choose the plan that scales with your ambition. Every tier is backed by our patented HACP Protocol.
          </Text>
        </View>

        {/* Monthly / Annual Toggle */}
        <View style={s.toggleWrap}>
          <View style={s.toggleBar}>
            <TouchableOpacity
              style={[s.togglePill, !isAnnual && s.togglePillActive]}
              onPress={() => setIsAnnual(false)}
            >
              <Text style={[s.toggleText, !isAnnual && s.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.togglePill, isAnnual && s.togglePillActive]}
              onPress={() => setIsAnnual(true)}
            >
              <Text style={[s.toggleText, isAnnual && s.toggleTextActive]}>Annual</Text>
              <View style={s.saveBadge}>
                <Text style={s.saveBadgeText}>-20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Scroll Cards */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={s.cardsScroll}
        >
          {PRICING_TIERS.map((tier) => {
            const isPro = tier.id === 'pro';
            return (
              <View
                key={tier.id}
                style={[s.card, { width: CARD_WIDTH }, isPro && s.cardPro]}
              >
                {isPro && (
                  <View style={s.popularTag}>
                    <Text style={s.popularTagText}>⭐ MOST POPULAR</Text>
                  </View>
                )}
                <View style={[s.cardDot, { backgroundColor: tier.color }]} />
                <Text style={s.cardName}>{tier.name}</Text>
                <View style={s.cardPriceRow}>
                  <Text style={[s.cardPrice, { color: tier.color }]}>{getPrice(tier.price)}</Text>
                  {tier.price > 0 && <Text style={s.cardPeriod}>/{isAnnual ? 'yr' : 'mo'}</Text>}
                </View>
                <Text style={s.cardModel}>{tier.model}</Text>
                <Text style={s.cardCredits}>
                  {tier.credits === -1 ? 'Unlimited credits' : `${tier.credits.toLocaleString()} credits/mo`}
                </Text>
                <TouchableOpacity
                  style={[s.cardBtn, isPro ? { backgroundColor: C.amber } : { borderWidth: 1, borderColor: tier.color }, loadingTier === tier.name && { opacity: 0.6 }]}
                  onPress={() => handleSubscribe(tier.name)}
                  activeOpacity={0.85}
                  disabled={loadingTier !== null}
                >
                  <Text style={[s.cardBtnText, isPro ? { color: C.bg } : { color: tier.color }]}>
                    {loadingTier === tier.name ? 'Opening...' : tier.price === 0 ? 'Start Free' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Feature Comparison Matrix */}
        <View style={s.matrixSection}>
          <Text style={s.matrixTitle}>FEATURE COMPARISON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header Row */}
              <View style={s.matrixHeaderRow}>
                <View style={s.matrixFeatureCol}>
                  <Text style={s.matrixHeaderText}>Feature</Text>
                </View>
                {PRICING_TIERS.map((tier) => (
                  <View key={tier.id} style={s.matrixValueCol}>
                    <View style={[s.matrixDot, { backgroundColor: tier.color }]} />
                    <Text style={s.matrixHeaderText}>{tier.name}</Text>
                  </View>
                ))}
              </View>
              {/* Data Rows */}
              {FEATURE_MATRIX.map((row, i) => (
                <View key={row.feature} style={[s.matrixRow, i % 2 === 0 && s.matrixRowAlt]}>
                  <View style={s.matrixFeatureCol}>
                    <Text style={s.matrixFeature}>{row.feature}</Text>
                  </View>
                  {row.values.map((val, j) => (
                    <View key={j} style={s.matrixValueCol}>
                      <Text style={[
                        s.matrixValue,
                        val === '✓' && { color: C.green, fontWeight: '800' },
                        val === '—' && { color: C.textGhost },
                      ]}>
                        {val}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* FAQ */}
        <View style={s.faqSection}>
          <Text style={s.faqTitle}>FREQUENTLY ASKED</Text>
          {FAQ.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={s.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={s.faqHeader}>
                <Text style={s.faqQuestion}>{item.q}</Text>
                <Text style={s.faqChevron}>{expandedFaq === i ? '−' : '+'}</Text>
              </View>
              {expandedFaq === i && (
                <Text style={s.faqAnswer}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerPatent}>US Patent #10,290,222 · HACP Protocol</Text>
          <View style={s.stripeBadge}>
            <Text style={s.stripeIcon}>💳</Text>
            <Text style={s.stripeBadgeText}>SECURED BY STRIPE</Text>
          </View>
          <Text style={s.footerCopy}>© 2026 SaintSal Labs · All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  headerBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 16, color: C.amber },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  headerLogo: { fontSize: 11, fontWeight: '800', letterSpacing: 3, color: C.text },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: C.text, textAlign: 'center', lineHeight: 40, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: C.textDim, textAlign: 'center', marginTop: 14, lineHeight: 20, maxWidth: 300 },
  toggleWrap: { alignItems: 'center', paddingVertical: 20 },
  toggleBar: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  togglePill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  togglePillActive: { backgroundColor: C.amber },
  toggleText: { fontSize: 13, fontWeight: '700', color: C.textDim },
  toggleTextActive: { color: C.bg },
  saveBadge: { backgroundColor: C.greenGhost, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveBadgeText: { fontSize: 8, fontWeight: '800', color: C.green, letterSpacing: 1 },
  cardsScroll: { paddingHorizontal: 20, paddingBottom: 4, gap: 12 },
  card: { backgroundColor: C.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border },
  cardPro: { borderWidth: 2, borderColor: C.amber },
  popularTag: { position: 'absolute', top: -10, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' },
  popularTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.amber, backgroundColor: C.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  cardDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 10 },
  cardName: { fontSize: 20, fontWeight: '800', color: C.text },
  cardPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  cardPrice: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  cardPeriod: { fontSize: 14, fontWeight: '600', color: C.textDim, marginLeft: 2 },
  cardModel: { fontSize: 11, fontWeight: '700', color: C.amberDim, letterSpacing: 1, marginTop: 6 },
  cardCredits: { fontSize: 12, color: C.textDim, marginTop: 2, marginBottom: 20 },
  cardBtn: { height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  matrixSection: { paddingLeft: 20, marginTop: 36 },
  matrixTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 14 },
  matrixHeaderRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: C.borderGlow, paddingBottom: 10 },
  matrixFeatureCol: { width: 130, paddingRight: 8 },
  matrixValueCol: { width: 80, alignItems: 'center', flexDirection: 'column', gap: 4 },
  matrixDot: { width: 6, height: 6, borderRadius: 3 },
  matrixHeaderText: { fontSize: 10, fontWeight: '800', color: C.textSub, letterSpacing: 0.5 },
  matrixRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  matrixRowAlt: { backgroundColor: C.bgCard },
  matrixFeature: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  matrixValue: { fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' },
  faqSection: { paddingHorizontal: 20, marginTop: 36 },
  faqTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 14 },
  faqItem: { backgroundColor: C.bgCard, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: C.text, flex: 1, marginRight: 12 },
  faqChevron: { fontSize: 18, fontWeight: '600', color: C.amber },
  faqAnswer: { fontSize: 12, color: C.textDim, marginTop: 10, lineHeight: 18 },
  footer: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 32, paddingBottom: 40 },
  footerPatent: { fontSize: 9, fontWeight: '600', color: C.textGhost, letterSpacing: 1 },
  stripeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, gap: 6, opacity: 0.6 },
  stripeIcon: { fontSize: 12 },
  stripeBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
  footerCopy: { fontSize: 10, color: C.textGhost, marginTop: 12 },
});
