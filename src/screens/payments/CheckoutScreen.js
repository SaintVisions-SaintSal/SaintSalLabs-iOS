import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '../../config/theme';
import AuthContext from '../../lib/AuthContext';

const LABS_API = 'https://saintsallabs.com/api/mcp/stripe';
const SAL_KEY  = 'sal-live-2026';

const PLAN_META = {
  free:       { name: 'Free',       price: 0,    credits: 100,    priceKey: 'free_mo',       model: 'SAL Mini' },
  starter:    { name: 'Starter',    price: 27,   credits: 500,    priceKey: 'starter_mo',    model: 'SAL Pro' },
  pro:        { name: 'Pro',        price: 97,   credits: 2000,   priceKey: 'pro_mo',        model: 'SAL Max' },
  teams:      { name: 'Teams',      price: 297,  credits: 10000,  priceKey: 'teams_mo',      model: 'SAL Max Fast' },
  enterprise: { name: 'Enterprise', price: 497,  credits: -1,     priceKey: 'enterprise_mo', model: 'Unlimited' },
};

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, profile } = useContext(AuthContext);
  const [processing, setProcessing] = useState(false);

  const planId = params.plan || 'pro';
  const plan = PLAN_META[planId] || PLAN_META.pro;

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const res = await fetch(LABS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': SAL_KEY },
        body: JSON.stringify({
          action: 'create_checkout',
          payload: {
            priceKey:   plan.priceKey,
            email:      user?.email || profile?.email || '',
            successUrl: 'https://saintsallabs.com/success?upgraded=1',
            cancelUrl:  'https://saintsallabs.com/pricing',
            metadata:   { userId: user?.id || '', plan: planId, source: 'ios' },
          },
        }),
      });
      const data = await res.json();
      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', data?.error || 'Could not create checkout session. Try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Text style={s.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Checkout</Text>
          <Text style={s.headerSub}>SECURE PAYMENT</Text>
        </View>
        <View style={s.lockBadge}>
          <Text style={s.lockIcon}>🔒</Text>
          <Text style={s.lockText}>SSL</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ORDER SUMMARY</Text>
          <View style={s.orderCard}>
            <View style={s.orderTop}>
              <View style={s.planBadge}>
                <Text style={s.planBadgeText}>⭐ {plan.name.toUpperCase()}</Text>
              </View>
              <Text style={s.orderPrice}>{plan.price === 0 ? 'FREE' : `$${plan.price}`}</Text>
            </View>
            <View style={s.orderDetails}>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Plan</Text>
                <Text style={s.orderValue}>{plan.name} — Monthly</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Credits</Text>
                <Text style={s.orderValue}>{plan.credits === -1 ? 'Unlimited' : `${plan.credits.toLocaleString()}/mo`}</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Model</Text>
                <Text style={s.orderValue}>{plan.model}</Text>
              </View>
              {user?.email ? (
                <View style={s.orderRow}>
                  <Text style={s.orderLabel}>Account</Text>
                  <Text style={s.orderValue} numberOfLines={1}>{user.email}</Text>
                </View>
              ) : null}
              <View style={[s.orderRow, s.orderTotal]}>
                <Text style={s.totalLabel}>Total Due Today</Text>
                <Text style={s.totalValue}>{plan.price === 0 ? '$0.00' : `$${plan.price}.00`}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stripe Checkout CTA */}
        <View style={s.section}>
          <View style={s.stripeInfoBox}>
            <Text style={s.stripeInfoTitle}>🔒 Powered by Stripe</Text>
            <Text style={s.stripeInfoText}>
              You'll be taken to Stripe's secure checkout page to complete your payment. Your card details never touch our servers.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.payBtn, processing && s.payBtnProcessing]}
            onPress={handleCheckout}
            activeOpacity={0.85}
            disabled={processing}
          >
            <Text style={s.payBtnText}>
              {processing ? 'Opening Checkout...' : `Continue to Checkout →`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Indicators */}
        <View style={s.securitySection}>
          <View style={s.securityRow}>
            <View style={s.securityItem}>
              <Text style={s.secIcon}>🔒</Text>
              <Text style={s.secLabel}>Encrypted</Text>
            </View>
            <View style={s.securityItem}>
              <Text style={s.secIcon}>🛡️</Text>
              <Text style={s.secLabel}>PCI Compliant</Text>
            </View>
            <View style={s.securityItem}>
              <Text style={s.secIcon}>✓</Text>
              <Text style={s.secLabel}>3D Secure</Text>
            </View>
          </View>
          <Text style={s.securityNote}>
            Payment processed by Stripe. We never store card details.
          </Text>
        </View>

        <View style={s.footer}>
          <View style={s.stripeBadge}>
            <Text style={s.stripeIcon}>⚡</Text>
            <Text style={s.stripeBadgeText}>POWERED BY STRIPE</Text>
          </View>
          <Text style={s.footerText}>Secure & Encrypted · 256-bit SSL</Text>
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
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: C.greenGhost, borderWidth: 1, borderColor: '#22C55E30' },
  lockIcon: { fontSize: 12 },
  lockText: { fontSize: 10, fontWeight: '800', color: C.green, letterSpacing: 1 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 12 },
  orderCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.borderGlow, overflow: 'hidden' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: C.amberGhost },
  planBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.amber },
  planBadgeText: { fontSize: 10, fontWeight: '800', color: C.bg, letterSpacing: 1 },
  orderPrice: { fontSize: 32, fontWeight: '800', color: C.text },
  orderDetails: {},
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  orderLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  orderValue: { fontSize: 13, fontWeight: '700', color: C.text, flex: 1, textAlign: 'right', marginLeft: 8 },
  orderTotal: { backgroundColor: C.bgElevated, borderBottomWidth: 0 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: C.amber },
  stripeInfoBox: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.borderGlow, padding: 16, marginBottom: 16 },
  stripeInfoTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 },
  stripeInfoText: { fontSize: 12, color: C.textDim, lineHeight: 18 },
  payBtn: { height: 56, borderRadius: 14, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  payBtnProcessing: { opacity: 0.7 },
  payBtnText: { fontSize: 16, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },
  securitySection: { paddingHorizontal: 20, marginTop: 24 },
  securityRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 12 },
  securityItem: { alignItems: 'center', gap: 4 },
  secIcon: { fontSize: 18, color: C.green },
  secLabel: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 0.5 },
  securityNote: { fontSize: 11, color: C.textDim, textAlign: 'center', lineHeight: 18 },
  footer: { alignItems: 'center', paddingTop: 24, paddingBottom: 40 },
  stripeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, gap: 6, opacity: 0.6 },
  stripeIcon: { fontSize: 12, color: C.amber },
  stripeBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
  footerText: { fontSize: 10, color: C.textGhost, marginTop: 10, letterSpacing: 1 },
});
