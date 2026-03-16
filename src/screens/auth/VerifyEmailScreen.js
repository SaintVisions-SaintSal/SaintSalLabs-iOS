/* ═══════════════════════════════════════════════════
   SCREEN 4 — EMAIL VERIFICATION
   saintsal_branded_auth_email → Check your inbox
   Colors: #0C0C0F bg · #D4AF37 gold gradient border
═══════════════════════════════════════════════════ */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD     = '#D4AF37';
const GOLD_DIM = '#B8860B';
const BG       = '#0C0C0F';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Gold shimmer on border
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();

    // Poll for auth state change (user clicks link in email)
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(interval);
        router.replace('/(auth)/business-dna');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await supabase.auth.resend({ type: 'signup', email });
      Alert.alert('Sent!', 'Verification email resent. Check your inbox.');
      setCountdown(60);
      const cd = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(cd); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  const borderColor = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [GOLD_DIM, GOLD, GOLD_DIM],
  });

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.container, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        {/* Gold gradient top bar */}
        <View style={s.topBar} />

        {/* Card */}
        <Animated.View style={[s.card, { borderColor }]}>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <Text style={s.logoTxt}>S</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={s.tagline}>IDENTITY VERIFICATION</Text>
          <Text style={s.title}>Your Elite Access Key is here.</Text>

          {/* Body */}
          <Text style={s.body}>
            To complete your secure authentication and access the SaintSal™ Labs infrastructure, please verify your identity using the link sent to:
          </Text>

          {/* Email display */}
          <View style={s.emailBadge}>
            <Text style={s.emailTxt}>{email || 'your email'}</Text>
          </View>

          {/* Verify instruction */}
          <View style={s.instructionBox}>
            <Text style={s.instructionLabel}>ALTERNATIVE ACCESS CODE</Text>
            <Text style={s.instructionBody}>
              Check your inbox for the verification email and click the button inside. This page will automatically continue once verified.
            </Text>
          </View>

          {/* Waiting indicator */}
          <View style={s.waitRow}>
            <View style={s.waitDot} />
            <Text style={s.waitTxt}>Waiting for verification...</Text>
          </View>

          {/* Resend */}
          <TouchableOpacity
            style={[s.resendBtn, (countdown > 0 || resending) && s.resendDisabled]}
            onPress={handleResend}
            disabled={countdown > 0 || resending}
          >
            <Text style={s.resendTxt}>
              {resending ? 'SENDING...' : countdown > 0 ? `RESEND IN ${countdown}s` : 'RESEND EMAIL'}
            </Text>
          </TouchableOpacity>

          {/* Back to login */}
          <TouchableOpacity style={s.backRow} onPress={() => router.replace('/(auth)/login')}>
            <Text style={s.backTxt}>← Back to Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>© 2025 Saint Vision Technologies. All Rights Reserved.</Text>
          <Text style={s.footerSub}>SaintSal™ Labs Division · Confidentiality Level: Restricted</Text>
          <View style={s.footerLinks}>
            <TouchableOpacity><Text style={s.footerLink}>Privacy Policy</Text></TouchableOpacity>
            <Text style={s.footerDot}>•</Text>
            <TouchableOpacity><Text style={s.footerLink}>Security Protocols</Text></TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  topBar: {
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginBottom: 24,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: '#111116',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD + '44',
    padding: 28,
    gap: 16,
  },
  logoWrap: { alignItems: 'center', marginBottom: 4 },
  logoBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: GOLD + '55',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  logoTxt: { fontSize: 28, fontWeight: '800', color: GOLD },
  tagline: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5 },
  body: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  emailBadge: {
    backgroundColor: GOLD + '15', borderRadius: 8, borderWidth: 1,
    borderColor: GOLD + '30', paddingVertical: 10, paddingHorizontal: 16,
    alignSelf: 'center',
  },
  emailTxt: { fontSize: 13, fontWeight: '700', color: GOLD, letterSpacing: 0.5 },
  instructionBox: {
    backgroundColor: '#FFFFFF08', borderRadius: 10, borderWidth: 1,
    borderColor: '#FFFFFF10', padding: 16, gap: 8,
  },
  instructionLabel: { fontSize: 9, fontWeight: '700', color: '#6B7280', letterSpacing: 2, textTransform: 'uppercase' },
  instructionBody: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, textAlign: 'center' },
  waitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  waitDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  waitTxt: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  resendBtn: {
    backgroundColor: GOLD, borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  resendDisabled: { backgroundColor: GOLD + '55' },
  resendTxt: { fontSize: 12, fontWeight: '800', color: BG, letterSpacing: 2 },
  backRow: { alignItems: 'center' },
  backTxt: { fontSize: 12, color: GOLD + '80', fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 24, paddingBottom: 16, gap: 4 },
  footerTxt: { fontSize: 10, color: '#444455', textAlign: 'center' },
  footerSub: { fontSize: 9, color: '#333344', textAlign: 'center' },
  footerLinks: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 4 },
  footerLink: { fontSize: 9, color: GOLD + '66', letterSpacing: 1 },
  footerDot: { fontSize: 9, color: '#333344' },
});
