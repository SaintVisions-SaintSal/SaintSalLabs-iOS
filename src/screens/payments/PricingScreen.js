import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C, PRICING_TIERS, STRIPE_LINKS } from '../../config/theme';

const FEATURES_BY_TIER = {
  free: ['100 credits/mo', 'SAL Mini model', 'Basic search', 'Community support'],
  starter: ['500 credits/mo', 'SAL Pro model', 'Intelligence Search', 'Builder IDE access', 'Email support'],
  pro: ['2,000 credits/mo', 'SAL Max model', 'All 12 Intelligence Suites', 'Real-time analytics', 'Priority support', 'API access'],
  teams: ['10,000 credits/mo', 'SAL Max Fast model', 'Up to 10 seats', 'Team dashboard', 'GHL CRM integration', 'Dedicated Slack'],
  enterprise: ['Unlimited credits', 'All models unlocked', 'Unlimited seats', 'HACP Protocol license', 'White-glove onboarding', 'Custom SLA', 'SSO / SAML'],
};

const OVERAGE_RATES = [
  { tier: 'Free / Starter', rate: '$0.05', per: 'per 100 credits' },
  { tier: 'Pro / Teams', rate: '$0.12', per: 'per 100 credits' },
  { tier: 'Enterprise', rate: '$0.25', per: 'per 100 credits' },
];

export default function PricingScreen() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');
  const pulseAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleSubscribe = (tierName) => {
    const link = STRIPE_LINKS[tierName];
    if (link) Linking.openURL(link);
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
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Pricing</Text>
          <Text style={s.headerSub}>CHOOSE YOUR PLAN</Text>
        </View>
        <TouchableOpacity style={s.restoreBtn}>
          <Text style={s.restoreBtnText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Intelligence.{'\n'}Amplified.</Text>
          <Text style={s.heroSub}>
            From solo builders to enterprise teams — pick the tier that matches your velocity.
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
                <Text style={s.saveBadgeText}>SAVE 20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tier Cards */}
        <View style={s.tiersSection}>
          {PRICING_TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isPro = tier.id === 'pro';
            const features = FEATURES_BY_TIER[tier.id] || [];

            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  s.tierCard,
                  isSelected && { borderColor: tier.color },
                  isPro && s.tierCardPro,
                ]}
                onPress={() => setSelectedTier(tier.id)}
                activeOpacity={0.8}
              >
                {isPro && (
                  <Animated.View style={[s.popularBadge, { opacity: pulseAnim }]}>
                    <Text style={s.popularText}>⭐ MOST POPULAR</Text>
                  </Animated.View>
                )}

                <View style={s.tierTop}>
                  <View style={[s.tierDot, { backgroundColor: tier.color }]} />
                  <Text style={s.tierName}>{tier.name}</Text>
                </View>

                <View style={s.tierPriceRow}>
                  <Text style={[s.tierPrice, { color: tier.color }]}>
                    {getPrice(tier.price)}
                  </Text>
                  {tier.price > 0 && (
                    <Text style={s.tierPeriod}>/{isAnnual ? 'yr' : 'mo'}</Text>
                  )}
                </View>

                <Text style={s.tierModel}>{tier.model}</Text>
                <Text style={s.tierCredits}>
                  {tier.credits === -1 ? 'Unlimited' : `${tier.credits.toLocaleString()} credits/mo`}
                </Text>

                <View style={s.tierFeatures}>
                  {features.map((feat) => (
                    <View key={feat} style={s.featRow}>
                      <Text style={[s.featCheck, { color: tier.color }]}>✓</Text>
                      <Text style={s.featText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    s.tierBtn,
                    isPro ? { backgroundColor: C.amber } : { borderWidth: 1, borderColor: tier.color },
                  ]}
                  onPress={() => handleSubscribe(tier.name)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.tierBtnText, isPro ? { color: C.bg } : { color: tier.color }]}>
                    {tier.price === 0 ? 'Get Started Free' : `Subscribe to ${tier.name}`}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Compute Overage Rates */}
        <View style={s.overageSection}>
          <Text style={s.overageTitle}>METERED COMPUTE OVERAGES</Text>
          <Text style={s.overageSub}>
            When your credits run out, you can keep building with pay-as-you-go pricing.
          </Text>
          {OVERAGE_RATES.map((o) => (
            <View key={o.tier} style={s.overageRow}>
              <Text style={s.overageTier}>{o.tier}</Text>
              <View style={s.overageRight}>
                <Text style={s.overageRate}>{o.rate}</Text>
                <Text style={s.overagePer}>{o.per}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Patent / Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            All plans include the SaintSal Intelligence Engine powered by US Patent #10,290,222 HACP Protocol.
          </Text>
          <View style={s.stripeBadge}>
            <Text style={s.stripeIcon}>💳</Text>
            <Text style={s.stripeBadgeText}>SECURED BY STRIPE</Text>
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
  restoreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.borderGlow },
  restoreBtnText: { fontSize: 11, fontWeight: '700', color: C.amberDim },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 32, paddingBottom: 8 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.text, textAlign: 'center', lineHeight: 38, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: C.textDim, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  toggleWrap: { alignItems: 'center', paddingVertical: 20 },
  toggleBar: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  togglePill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  togglePillActive: { backgroundColor: C.amber },
  toggleText: { fontSize: 13, fontWeight: '700', color: C.textDim },
  toggleTextActive: { color: C.bg },
  saveBadge: { backgroundColor: C.greenGhost, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveBadgeText: { fontSize: 8, fontWeight: '800', color: C.green, letterSpacing: 1 },
  tiersSection: { paddingHorizontal: 20, gap: 16 },
  tierCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.border },
  tierCardPro: { borderColor: C.amber, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', right: 20, left: 20, alignItems: 'center' },
  popularText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amber, backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  tierTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  tierName: { fontSize: 18, fontWeight: '800', color: C.text },
  tierPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  tierPrice: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tierPeriod: { fontSize: 14, fontWeight: '600', color: C.textDim, marginLeft: 2 },
  tierModel: { fontSize: 11, fontWeight: '700', color: C.amberDim, letterSpacing: 1, marginBottom: 2 },
  tierCredits: { fontSize: 12, color: C.textDim, marginBottom: 16 },
  tierFeatures: { marginBottom: 16 },
  featRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  featCheck: { fontSize: 14, fontWeight: '700' },
  featText: { fontSize: 13, color: C.textSub },
  tierBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tierBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  overageSection: { paddingHorizontal: 20, marginTop: 32 },
  overageTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 8 },
  overageSub: { fontSize: 12, color: C.textDim, marginBottom: 16, lineHeight: 18 },
  overageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  overageTier: { fontSize: 13, fontWeight: '600', color: C.text },
  overageRight: { alignItems: 'flex-end' },
  overageRate: { fontSize: 15, fontWeight: '800', color: C.amber },
  overagePer: { fontSize: 10, color: C.textDim, marginTop: 2 },
  footer: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 32, paddingBottom: 40 },
  footerText: { fontSize: 11, color: C.textDim, textAlign: 'center', lineHeight: 18 },
  stripeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, gap: 6, opacity: 0.6 },
  stripeIcon: { fontSize: 12 },
  stripeBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
});
