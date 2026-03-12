import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { C } from '../../config/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const pulseBar = useRef(new Animated.Value(0)).current;
  const glowA = useRef(new Animated.Value(0.08)).current;
  const glowB = useRef(new Animated.Value(0.05)).current;
  const shieldPulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseBar, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseBar, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowA, { toValue: 0.16, duration: 3000, useNativeDriver: true }),
        Animated.timing(glowA, { toValue: 0.08, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowB, { toValue: 0.12, duration: 3500, useNativeDriver: true }),
        Animated.timing(glowB, { toValue: 0.05, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(shieldPulse, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleMagicLink = () => {
    if (!email.trim() || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid corporate email address.');
    }
    Alert.alert(
      'Magic Link Sent',
      `A secure login link has been sent to ${email}. Check your inbox.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Background Glow Circles */}
      <Animated.View style={[s.glowCircleA, { opacity: glowA }]} />
      <Animated.View style={[s.glowCircleB, { opacity: glowB }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <Animated.View style={{ opacity: shieldPulse }}>
            <Text style={{ fontSize: 20 }}>🛡</Text>
          </Animated.View>
          <Text style={s.headerTitle}>
            SaintSal <Text style={{ color: C.amber }}>Labs</Text>
          </Text>
          <TouchableOpacity style={s.helpBtn}>
            <Text style={s.helpText}>?</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={s.heroSection}>
            <Text style={s.heroTitle}>Elite Access</Text>
            <Text style={s.heroSub}>Enter your credentials to enter the secure perimeter.</Text>
          </View>

          {/* Glass Panel Card */}
          <View style={s.glassCard}>
            <View style={s.glassInner}>
              {/* Email Field */}
              <Text style={s.fieldLabel}>CORPORATE EMAIL</Text>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>✉</Text>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@saintsal.com"
                  placeholderTextColor={C.textGhost}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              {/* Magic Link Button */}
              <TouchableOpacity style={s.magicBtn} onPress={handleMagicLink} activeOpacity={0.85}>
                <Text style={{ fontSize: 14 }}>✨</Text>
                <Text style={s.magicBtnText}>Get Magic Link</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>SECURE HANDSHAKE</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Terms */}
              <Text style={s.termsText}>
                By continuing, you agree to our{' '}
                <Text style={s.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={s.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>

          {/* Animated Gold Pulse Bar */}
          <View style={s.pulseBarWrap}>
            <Animated.View style={[s.pulseBarInner, { opacity: pulseBar }]} />
          </View>

          {/* Protocol Features */}
          <View style={s.protocolSection}>
            <Text style={s.protocolTitle}>SECURITY PROTOCOL</Text>
            {[
              { icon: '🔐', label: 'End-to-End Encryption', desc: 'AES-256 military-grade' },
              { icon: '🛡', label: 'HACP Protocol', desc: 'Patent #10,290,222' },
              { icon: '⚡', label: 'Zero-Knowledge Auth', desc: 'We never store passwords' },
              { icon: '🌐', label: 'Multi-Region Deploy', desc: 'Edge nodes worldwide' },
            ].map((f) => (
              <View key={f.label} style={s.protocolRow}>
                <View style={s.protocolIcon}>
                  <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.protocolLabel}>{f.label}</Text>
                  <Text style={s.protocolDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer Glass Panel */}
          <View style={s.footerCard}>
            <View style={s.footerRow}>
              <View style={s.footerDot} />
              <Text style={s.footerStatus}>System Ready</Text>
              <View style={s.footerDivLine} />
              <View style={s.encBadge}>
                <Text style={{ fontSize: 10 }}>🔒</Text>
                <Text style={s.encText}>AES-256</Text>
              </View>
            </View>
          </View>

          {/* Patent Footer */}
          <View style={s.patentSection}>
            <Text style={s.patentText}>US Patent #10,290,222 · HACP Protocol</Text>
            <View style={s.poweredRow}>
              <Text style={{ fontSize: 10 }}>⚡</Text>
              <Text style={s.poweredText}>POWERED BY SUPABASE</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  glowCircleA: { position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: C.amber, zIndex: 0 },
  glowCircleB: { position: 'absolute', bottom: 60, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: C.gold, zIndex: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  helpBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  helpText: { fontSize: 14, fontWeight: '700', color: C.textDim },
  scrollContent: { paddingHorizontal: 28, zIndex: 1 },
  heroSection: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -1 },
  heroSub: { fontSize: 14, color: C.textMuted, marginTop: 10, textAlign: 'center', lineHeight: 22 },
  glassCard: { backgroundColor: C.bgCard + 'CC', borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  glassInner: { padding: 24 },
  fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amber, marginBottom: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput, borderRadius: 14, borderWidth: 1, borderColor: C.borderGlow, paddingHorizontal: 16, marginBottom: 18 },
  inputIcon: { fontSize: 16, marginRight: 12, color: C.textDim },
  input: { flex: 1, height: 54, fontSize: 15, color: C.text },
  magicBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 14, backgroundColor: C.amber },
  magicBtnText: { fontSize: 15, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { marginHorizontal: 14, fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textGhost },
  termsText: { fontSize: 12, color: C.textDim, textAlign: 'center', lineHeight: 20 },
  termsLink: { color: C.amber, textDecorationLine: 'underline' },
  pulseBarWrap: { height: 3, marginTop: 20, marginHorizontal: 20, borderRadius: 2, backgroundColor: C.amber + '15', overflow: 'hidden' },
  pulseBarInner: { flex: 1, backgroundColor: C.amber, borderRadius: 2 },
  protocolSection: { marginTop: 32 },
  protocolTitle: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1.5, marginBottom: 16 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  protocolIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  protocolLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  protocolDesc: { fontSize: 11, color: C.textDim, marginTop: 2 },
  footerCard: { marginTop: 28, backgroundColor: C.bgCard + 'CC', borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  footerStatus: { fontSize: 12, fontWeight: '700', color: C.green },
  footerDivLine: { flex: 1, height: 1, backgroundColor: C.border },
  encBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bgElevated, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  encText: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1 },
  patentSection: { alignItems: 'center', marginTop: 24 },
  patentText: { fontSize: 9, fontWeight: '600', color: C.textGhost, letterSpacing: 1 },
  poweredRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, opacity: 0.5 },
  poweredText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
});
