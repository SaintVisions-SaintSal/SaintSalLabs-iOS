/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — EMAIL VERIFY SCREEN
   saintsal_branded_auth_email — Check your inbox
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, StatusBar, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';

export default function EmailVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || 'your email';
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendError, setResendError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Poll for verification every 3s
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        clearInterval(interval);
        router.replace('/(auth)/business-dna');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    setResendError('');
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: typeof email === 'string' ? email : email[0],
      });
      if (error) { setResendError(error.message); return; }
      setResendDone(true);
      setTimeout(() => setResendDone(false), 5000);
    } catch {
      setResendError('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        router.replace('/(auth)/business-dna');
      } else {
        setResendError('Not verified yet. Check your inbox.');
      }
    } catch {
      setResendError('Could not check status. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top accent */}
        <View style={styles.topAccent} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>S</Text>
          </View>
          <Text style={styles.logoLabel}>SAINTSAL™ LABS</Text>
        </View>

        {/* Identity verification title */}
        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>IDENTITY VERIFICATION</Text>
          <Text style={styles.title}>Your Elite Access{'\n'}Key is here.</Text>
        </View>

        {/* Main card */}
        <View style={styles.card}>
          {/* Email icon */}
          <View style={styles.emailIconCircle}>
            <Text style={styles.emailIcon}>✉</Text>
          </View>

          <Text style={styles.cardBody}>
            To complete your secure authentication and access the SaintSal™ Labs infrastructure, please verify your identity using the link sent to:
          </Text>

          <View style={styles.emailBadge}>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <Text style={styles.expiryNote}>Access key expires in 10 minutes.</Text>

          {/* Fallback code section */}
          <View style={styles.fallbackSection}>
            <Text style={styles.fallbackLabel}>ALTERNATIVE ACCESS CODE</Text>
            <View style={styles.codePlaceholder}>
              <Text style={styles.codeText}>— — — — — —</Text>
            </View>
            <Text style={styles.fallbackNote}>Check your email for the numeric code</Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryBtn, checking && styles.btnDisabled]}
            onPress={handleCheckVerification}
            disabled={checking}
            activeOpacity={0.85}
          >
            {checking ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>VERIFY IDENTITY</Text>
            )}
          </TouchableOpacity>

          {resendDone ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ New access key sent! Check your inbox.</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.resendBtn, resending && styles.btnDisabled]}
              onPress={handleResend}
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator color={GOLD} size="small" />
              ) : (
                <Text style={styles.resendBtnText}>RESEND ACCESS KEY</Text>
              )}
            </TouchableOpacity>
          )}

          {!!resendError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{resendError}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCopy}>© 2024 Saint Vision Technologies. All Rights Reserved.</Text>
          <Text style={styles.footerSub}>SaintSal™ Labs Division</Text>
          <Text style={styles.footerSub}>Confidentiality Level: Restricted</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={styles.footerLink}>Privacy Policy</Text></TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity><Text style={styles.footerLink}>Security Protocols</Text></TouchableOpacity>
          </View>
        </View>

        {/* Back */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.backText}>← BACK TO SIGN IN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0F' },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  topAccent: { height: 4, backgroundColor: GOLD },
  logoSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, gap: 12 },
  logoBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: `${GOLD}4D`, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: GOLD, fontWeight: '800', fontSize: 24, fontFamily: 'PublicSans-Bold' },
  logoLabel: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  titleSection: { paddingHorizontal: 32, paddingBottom: 24 },
  eyebrow: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 5, marginBottom: 12, fontFamily: 'PublicSans-Bold' },
  title: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 34, letterSpacing: 1, fontFamily: 'PublicSans-Light' },
  card: {
    marginHorizontal: 24, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, padding: 24, gap: 16, overflow: 'hidden',
  },
  emailIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  emailIcon: { fontSize: 28, color: GOLD },
  cardBody: { color: 'rgba(156,163,175,1)', fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: 'PublicSans-Regular' },
  emailBadge: {
    backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}4D`,
    borderRadius: 8, padding: 12, alignItems: 'center',
  },
  emailText: { color: GOLD, fontWeight: '700', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  expiryNote: { color: MUTED, fontSize: 12, textAlign: 'center', fontStyle: 'italic', fontFamily: 'PublicSans-Regular' },
  fallbackSection: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: BORDER,
    borderRadius: 8, padding: 20, alignItems: 'center', gap: 8,
  },
  fallbackLabel: { color: MUTED, fontSize: 9, letterSpacing: 4, fontFamily: 'PublicSans-Bold' },
  codePlaceholder: { paddingVertical: 8 },
  codeText: { color: GOLD, fontSize: 28, fontWeight: '700', letterSpacing: 12, fontFamily: 'PublicSans-Bold' },
  fallbackNote: { color: 'rgba(75,85,99,1)', fontSize: 10, fontFamily: 'PublicSans-Regular' },
  primaryBtn: {
    backgroundColor: GOLD, borderRadius: 4, paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 4, fontFamily: 'PublicSans-ExtraBold' },
  resendBtn: {
    borderWidth: 1, borderColor: GOLD, borderRadius: 4, paddingVertical: 14,
    alignItems: 'center',
  },
  resendBtnText: { color: GOLD, fontWeight: '700', fontSize: 11, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  successBox: {
    backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)', borderRadius: 8, padding: 12, alignItems: 'center',
  },
  successText: { color: '#4ade80', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  footer: {
    marginTop: 32, paddingHorizontal: 32, backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 1, borderTopColor: BORDER, paddingVertical: 32, alignItems: 'center', gap: 4,
  },
  footerCopy: { color: 'rgba(107,114,128,1)', fontSize: 11, fontFamily: 'PublicSans-Regular' },
  footerSub: { color: 'rgba(75,85,99,1)', fontSize: 10, letterSpacing: 2, fontFamily: 'PublicSans-Regular' },
  footerLinks: { flexDirection: 'row', gap: 12, marginTop: 16 },
  footerLink: { color: `${GOLD}80`, fontSize: 10, fontFamily: 'PublicSans-Regular' },
  footerDot: { color: BORDER },
  backRow: { alignItems: 'center', paddingVertical: 16 },
  backText: { color: GOLD, fontSize: 11, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
});
