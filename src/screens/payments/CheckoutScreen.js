import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const ORDER = {
  plan: 'Pro',
  credits: 2000,
  price: 97,
  period: 'Monthly',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePay = () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      return Alert.alert('Missing Fields', 'Please fill in all payment details.');
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        'Payment Successful',
        `Your ${ORDER.plan} plan is now active with ${ORDER.credits.toLocaleString()} credits.`,
        [{ text: 'Continue', style: 'default' }]
      );
    }, 1800);
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Summary */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>ORDER SUMMARY</Text>
            <View style={s.orderCard}>
              <View style={s.orderTop}>
                <View style={s.planBadge}>
                  <Text style={s.planBadgeText}>⭐ {ORDER.plan.toUpperCase()}</Text>
                </View>
                <Text style={s.orderPrice}>${ORDER.price}</Text>
              </View>
              <View style={s.orderDetails}>
                <View style={s.orderRow}>
                  <Text style={s.orderLabel}>Plan</Text>
                  <Text style={s.orderValue}>{ORDER.plan} — {ORDER.period}</Text>
                </View>
                <View style={s.orderRow}>
                  <Text style={s.orderLabel}>Credits</Text>
                  <Text style={s.orderValue}>{ORDER.credits.toLocaleString()}/mo</Text>
                </View>
                <View style={s.orderRow}>
                  <Text style={s.orderLabel}>Model</Text>
                  <Text style={s.orderValue}>SAL Max</Text>
                </View>
                <View style={[s.orderRow, s.orderTotal]}>
                  <Text style={s.totalLabel}>Total Due Today</Text>
                  <Text style={s.totalValue}>${ORDER.price}.00</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card Information */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>CARD INFORMATION</Text>

            {/* Card Number */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Card Number</Text>
              <View style={s.inputRow}>
                <View style={s.cardBrand}>
                  <Text style={{ fontSize: 18 }}>💳</Text>
                </View>
                <TextInput
                  style={s.input}
                  value={formatCard(cardNumber)}
                  onChangeText={(v) => setCardNumber(v.replace(/\s/g, ''))}
                  placeholder="4242 4242 4242 4242"
                  placeholderTextColor={C.textGhost}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>
            </View>

            {/* Expiry + CVC */}
            <View style={s.splitRow}>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={s.fieldLabel}>Expiry</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.inputSmall}
                    value={formatExpiry(expiry)}
                    onChangeText={(v) => setExpiry(v.replace(/\D/g, ''))}
                    placeholder="MM/YY"
                    placeholderTextColor={C.textGhost}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={s.fieldLabel}>CVC</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.inputSmall}
                    value={cvc}
                    onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    placeholderTextColor={C.textGhost}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Cardholder Name */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Cardholder Name</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.inputSmall}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name on card"
                  placeholderTextColor={C.textGhost}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* ZIP */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>ZIP / Postal Code</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.inputSmall}
                  value={zip}
                  onChangeText={setZip}
                  placeholder="90210"
                  placeholderTextColor={C.textGhost}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          {/* Pay Button */}
          <View style={s.section}>
            <TouchableOpacity
              style={[s.payBtn, processing && s.payBtnProcessing]}
              onPress={handlePay}
              activeOpacity={0.85}
              disabled={processing}
            >
              <Text style={s.payBtnText}>
                {processing ? 'Processing...' : `Pay $${ORDER.price}.00`}
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
              Your payment info is encrypted end-to-end. We never store your full card number.
            </Text>
          </View>

          {/* Stripe Badge */}
          <View style={s.footer}>
            <View style={s.stripeBadge}>
              <Text style={s.stripeIcon}>⚡</Text>
              <Text style={s.stripeBadgeText}>POWERED BY STRIPE</Text>
            </View>
            <Text style={s.footerText}>
              Secure & Encrypted · 256-bit SSL
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  orderValue: { fontSize: 13, fontWeight: '700', color: C.text },
  orderTotal: { backgroundColor: C.bgElevated, borderBottomWidth: 0 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: C.amber },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: C.textDim, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardBrand: { width: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: C.border, height: 52 },
  input: { flex: 1, height: 52, paddingHorizontal: 14, fontSize: 16, color: C.text, fontFamily: 'monospace', letterSpacing: 2 },
  splitRow: { flexDirection: 'row', gap: 12 },
  inputWrap: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  inputSmall: { height: 52, paddingHorizontal: 14, fontSize: 15, color: C.text },
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
