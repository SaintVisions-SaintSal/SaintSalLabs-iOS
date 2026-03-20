/* ═══════════════════════════════════════════════════
   SCREEN 13 — PRODUCTION PRICING + STRIPE INTEGRATION
   saintsal_production_pricing_stripe_integration
   Wire: Stripe checkout links, Supabase plan check
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const LABS_API = 'https://saintsallabs-api.onrender.com';

const STRIPE_PRICE_IDS = {
  Free:       'price_1T7p1tL47U80vDLAe9aWVKA0',
  Starter:    'price_1T7p1sL47U80vDLAgU2shcQO',
  Pro:        'price_1T7p1tL47U80vDLAVC0N4N4J',
  Teams:      'price_1T7p1uL47U80vDLA9QF62BKS',
  Enterprise: 'price_1T7p1uL47U80vDLAR4Wk6uW0',
};

// Direct Stripe payment links — no server round-trip needed
const STRIPE_PAYMENT_LINKS = {
  free:       'https://buy.stripe.com/28EaEYgvk7zjbaPa2gbjW06',
  starter:    'https://buy.stripe.com/8x2eVea6W3j30wb3DSbjW07',
  pro:        'https://buy.stripe.com/5kQ3cw92S8Dn3In4HWbjW08',
  teams:      'https://buy.stripe.com/fZufZi5QG9Hr2Ej4HWbjW09',
  enterprise: 'https://buy.stripe.com/7sY5kEbb0cTDa6L2zObjW0a',
};

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    icon: '🌱',
    price: 0,
    annualPrice: 0,
    subtitle: 'Start Free',
    features: [
      'SAL Mini (Haiku/GPT-5 Fast)',
      '100 compute min/mo',
      '1 seat',
      'Basic search + chat',
      '7 intelligence verticals',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    icon: '⚡',
    price: 27,
    annualPrice: 22,
    subtitle: 'Launch your workflow',
    features: [
      'SAL Mini + Pro',
      '500 compute min/mo',
      '1 seat',
      'Builder IDE access',
      'GitHub connect',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '✦',
    price: 97,
    annualPrice: 78,
    subtitle: 'Full-stack intelligence',
    popular: true,
    features: [
      'SAL Mini + Pro + Max',
      '2,000 compute min/mo',
      'SaintSal Labs access',
      'Full Builder + Deploy',
      'Voice AI synthesis',
      'Image + Video gen',
      'Vercel + Render deploy',
      'Priority support',
    ],
  },
  {
    id: 'teams',
    name: 'Teams',
    icon: '👥',
    price: 297,
    annualPrice: 238,
    subtitle: 'Enterprise velocity for teams',
    features: [
      'SAL Max Fast model',
      '10,000 compute min/mo',
      '5 seats included',
      'GHL CRM integration',
      'Cloudflare deploy',
      'Custom domains',
      'Team dashboard',
      'Dedicated Slack',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '🏛',
    price: 497,
    annualPrice: 398,
    subtitle: 'White-label. No limits.',
    features: [
      'Unlimited seats + compute',
      'White-label branding',
      'HACP Protocol license',
      'API access + webhooks',
      'SSO / SAML',
      'Custom SLA',
      'Dedicated engineering support',
      'On-prem deployment option',
    ],
  },
];

const OVERAGE_RATES = [
  { label: 'SAL Mini',    rate: '$0.05', unit: '/min' },
  { label: 'SAL Pro',     rate: '$0.25', unit: '/min' },
  { label: 'SAL Max',     rate: '$0.75', unit: '/min' },
  { label: 'SAL Max Fast',rate: '$1.00', unit: '/min' },
];

export default function PricingScreen() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      // Get current user session first
      const { createClient } = await import('@supabase/supabase-js');
      const sbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await sbClient.auth.getSession();

      if (!session) { setCurrentPlan('free'); setLoading(false); return; }

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${session.user.id}&select=tier,role&limit=1`,
        {
          headers: {
            apikey:         SUPABASE_ANON_KEY,
            Authorization:  `Bearer ${session.access_token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const profile = data?.[0];
        setCurrentPlan(profile?.tier || profile?.role || 'free');
      } else {
        setCurrentPlan('free');
      }
    } catch {
      setCurrentPlan('free');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier) => {
    if (tier.id === 'free') {
      Alert.alert('Free Plan Active', 'You are on the Free plan. Upgrade anytime to unlock more compute.');
      return;
    }

    // Use direct Stripe payment links — instant, no server needed
    const paymentLink = STRIPE_PAYMENT_LINKS[tier.id];
    if (!paymentLink) {
      Alert.alert('Error', 'Payment link not found.');
      return;
    }

    setPurchasing(tier.id);
    try {
      const supported = await Linking.canOpenURL(paymentLink);
      if (supported) {
        await Linking.openURL(paymentLink);
      } else {
        Alert.alert('Error', 'Cannot open payment page. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open checkout. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const getDisplayPrice = (tier) => {
    if (tier.price === 0) return '$0';
    return isAnnual ? `$${tier.annualPrice}` : `$${tier.price}`;
  };

  const isCurrentPlan = (tier) => currentPlan === tier.id;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SaintSal Labs</Text>
          <Text style={s.headerSub}>ELEVATE YOUR INTELLIGENCE</Text>
        </View>
        <View style={s.walletIcon}>
          <Text style={s.walletEmoji}>💳</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Elevate your{'\n'}Intelligence</Text>
          <Text style={s.heroSub}>
            Scale your compute with elite SAL models and enterprise infrastructure.
          </Text>
        </View>

        {/* Monthly / Annual Toggle */}
        <View style={s.toggleWrap}>
          <View style={s.toggleBar}>
            <TouchableOpacity
              style={[s.togglePill, !isAnnual && s.togglePillActive]}
              onPress={() => setIsAnnual(false)}
            >
              <Text style={[s.toggleTxt, !isAnnual && s.toggleTxtActive]}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.togglePill, isAnnual && s.togglePillActive]}
              onPress={() => setIsAnnual(true)}
            >
              <Text style={[s.toggleTxt, isAnnual && s.toggleTxtActive]}>Annual</Text>
              <View style={s.saveBadge}>
                <Text style={s.saveBadgeTxt}>SAVE 20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Plan Pill */}
        {!loading && currentPlan && (
          <View style={s.currentPlanWrap}>
            <View style={s.currentPlanPill}>
              <View style={s.greenDot} />
              <Text style={s.currentPlanTxt}>
                Current plan: <Text style={{ color: C.gold, fontWeight: '800' }}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Tier Cards */}
        <View style={s.tiersWrap}>
          {TIERS.map((tier) => {
            const isCurrent = isCurrentPlan(tier);
            const isPro = tier.id === 'pro';
            const isBuying = purchasing === tier.id;

            return (
              <View
                key={tier.id}
                style={[
                  s.tierCard,
                  isPro && s.tierCardPro,
                  isCurrent && s.tierCardCurrent,
                ]}
              >
                {/* Most Popular Badge */}
                {isPro && (
                  <Animated.View style={[s.popularBadge, { opacity: pulseAnim }]}>
                    <Text style={s.popularTxt}>✦ MOST POPULAR</Text>
                  </Animated.View>
                )}

                {/* Current Badge */}
                {isCurrent && (
                  <View style={s.currentBadge}>
                    <Text style={s.currentBadgeTxt}>CURRENT PLAN</Text>
                  </View>
                )}

                {/* Tier Header */}
                <View style={s.tierHeader}>
                  <View>
                    <Text style={[s.tierLabel, isPro && { color: C.gold }]}>{tier.name.toUpperCase()}</Text>
                    <View style={s.priceRow}>
                      <Text style={[s.tierPrice, isPro && { color: C.gold }]}>{getDisplayPrice(tier)}</Text>
                      {tier.price > 0 && (
                        <Text style={s.tierPeriod}>/{isAnnual ? 'mo (billed annually)' : 'mo'}</Text>
                      )}
                    </View>
                  </View>
                  <View style={[s.tierIconWrap, isPro && s.tierIconWrapPro]}>
                    <Text style={s.tierIconEmoji}>{tier.icon}</Text>
                  </View>
                </View>

                <Text style={s.tierSubtitle}>{tier.subtitle}</Text>

                {/* Feature List */}
                <View style={s.featList}>
                  {tier.features.map((feat) => (
                    <View key={feat} style={s.featRow}>
                      <Text style={[s.featCheck, isPro && { color: C.gold }]}>✓</Text>
                      <Text style={s.featTxt}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  style={[
                    s.tierBtn,
                    isPro ? s.tierBtnPro : s.tierBtnDefault,
                    isCurrent && s.tierBtnCurrent,
                    isBuying && { opacity: 0.7 },
                  ]}
                  onPress={() => handleSubscribe(tier)}
                  disabled={isCurrent || isBuying}
                  activeOpacity={0.82}
                >
                  {isBuying ? (
                    <ActivityIndicator size="small" color={isPro ? C.bg : C.gold} />
                  ) : (
                    <Text style={[s.tierBtnTxt, isPro ? { color: C.bg } : { color: C.gold }]}>
                      {isCurrent ? '✓ CURRENT PLAN' : tier.price === 0 ? 'GET STARTED FREE' : `UPGRADE TO ${tier.name.toUpperCase()}`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Metered Compute Overages */}
        <View style={s.overageSection}>
          <Text style={s.overageTitle}>METERED COMPUTE OVERAGES</Text>
          <Text style={s.overageSub}>Pay-as-you-go when included compute runs out.</Text>
          <View style={s.overageGrid}>
            {OVERAGE_RATES.map((o) => (
              <View key={o.label} style={s.overageCard}>
                <Text style={s.overageLabel}>{o.label}</Text>
                <Text style={s.overageRate}>
                  {o.rate}<Text style={s.overageUnit}>{o.unit}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Secure Footer */}
        <View style={s.secureSection}>
          <View style={s.secureBadge}>
            <Text style={s.secureLock}>🔒</Text>
            <Text style={s.secureTxt}>SSL SECURED</Text>
          </View>
          <View style={s.secureBadge}>
            <Text style={s.secureLock}>✓</Text>
            <Text style={s.secureTxt}>POWERED BY STRIPE</Text>
          </View>
        </View>

        <Text style={s.legalTxt}>
          By completing a purchase, you agree to SaintSal Labs' Terms of Service and Privacy Policy. Subscriptions renew automatically unless cancelled. US Patent #10,290,222 HACP Protocol.
        </Text>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bgCard,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 18, color: C.text, fontWeight: '500' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 2, marginTop: 2 },
  walletIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  walletEmoji: { fontSize: 18 },

  // Hero
  hero: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 32, paddingBottom: 12 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.text, textAlign: 'center', lineHeight: 38, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: C.textDim, textAlign: 'center', marginTop: 12, lineHeight: 20 },

  // Toggle
  toggleWrap: { alignItems: 'center', paddingVertical: 20 },
  toggleBar: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 40, padding: 4, borderWidth: 1, borderColor: C.border },
  togglePill: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 36, flexDirection: 'row', alignItems: 'center', gap: 6 },
  togglePillActive: { backgroundColor: C.gold },
  toggleTxt: { fontSize: 13, fontWeight: '700', color: C.textDim },
  toggleTxtActive: { color: C.bg },
  saveBadge: { backgroundColor: '#22C55E15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E30' },
  saveBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },

  // Current Plan
  currentPlanWrap: { alignItems: 'center', marginBottom: 8 },
  currentPlanPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  currentPlanTxt: { fontSize: 12, fontWeight: '600', color: C.textSub },

  // Tier Cards
  tiersWrap: { paddingHorizontal: 16, gap: 16, paddingTop: 8 },
  tierCard: {
    backgroundColor: C.bgCard, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border,
  },
  tierCardPro: { borderColor: C.gold, borderWidth: 2 },
  tierCardCurrent: { borderColor: C.gold, borderWidth: 2 },
  popularBadge: {
    position: 'absolute', top: -12, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
  },
  popularTxt: {
    fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.bg,
    backgroundColor: C.gold, paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 10, overflow: 'hidden',
  },
  currentBadge: {
    position: 'absolute', top: -10, right: 16, zIndex: 10,
    backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  currentBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, marginTop: 4 },
  tierLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, color: C.textDim, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  tierPrice: { fontSize: 36, fontWeight: '900', color: C.text, letterSpacing: -1 },
  tierPeriod: { fontSize: 11, color: C.textDim, fontWeight: '500' },
  tierIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tierIconWrapPro: { backgroundColor: C.gold + '20', borderColor: C.gold + '50' },
  tierIconEmoji: { fontSize: 22 },
  tierSubtitle: { fontSize: 12, color: C.textDim, marginBottom: 16, lineHeight: 18 },
  featList: { marginBottom: 20, gap: 10 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featCheck: { fontSize: 13, fontWeight: '800', color: C.textDim, width: 16 },
  featTxt: { fontSize: 13, color: C.textSub, flex: 1, lineHeight: 18 },
  tierBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tierBtnPro: { backgroundColor: C.gold, borderColor: C.gold },
  tierBtnDefault: { backgroundColor: 'transparent', borderColor: C.gold + '50' },
  tierBtnCurrent: { backgroundColor: '#22C55E15', borderColor: '#22C55E50' },
  tierBtnTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },

  // Overage
  overageSection: { paddingHorizontal: 16, marginTop: 32 },
  overageTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 3, color: C.gold, marginBottom: 6, textAlign: 'center' },
  overageSub: { fontSize: 12, color: C.textDim, textAlign: 'center', marginBottom: 16 },
  overageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overageCard: { flex: 1, minWidth: '46%', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 },
  overageLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  overageRate: { fontSize: 18, fontWeight: '800', color: C.text },
  overageUnit: { fontSize: 10, color: C.textDim, fontWeight: '400' },

  // Footer
  secureSection: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 24, opacity: 0.6 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureLock: { fontSize: 12, color: C.textDim },
  secureTxt: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1.5 },
  legalTxt: { fontSize: 10, color: C.textGhost, textAlign: 'center', lineHeight: 16, paddingHorizontal: 24 },

  scroll: { flex: 1 },
});
