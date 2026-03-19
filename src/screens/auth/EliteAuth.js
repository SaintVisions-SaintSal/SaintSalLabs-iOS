/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — ELITE AUTH SCREEN
   elite_auth_supabase — Premium auth with biometrics
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';

export default function EliteAuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) { setError('Enter your identity and access key.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) { setError(authError.message); return; }
      router.replace('/(tabs)');
    } catch {
      setError('Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'saintsallabs://auth/callback' },
      });
      if (authError) setError(authError.message);
    } catch {
      setError('Google unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = () => {
    Alert.alert('Apple Sign In', 'Apple authentication requires additional native setup. Use email or Google for now.');
  };

  const handleBiometrics = () => {
    Alert.alert('Biometric Auth', 'Face ID / Touch ID authentication coming soon.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.canGoBack() && router.back()}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoLetter}>S</Text>
              </View>
              <Text style={styles.logoLabel}>SAINTSAL LABS</Text>
            </View>
            <View style={{ width: 32 }} />
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome to{'\n'}the <Text style={styles.heroGold}>Elite</Text></Text>
            <Text style={styles.heroSub}>ENTER THE EXCLUSIVE LABORATORY</Text>
          </View>

          {/* Biometric CTA */}
          <View style={styles.biometricSection}>
            <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometrics}>
              <View style={styles.biometricIcon}>
                <Text style={styles.biometricEmoji}>⬡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.biometricTitle}>BIOMETRIC ACCESS</Text>
                <Text style={styles.biometricSub}>Face ID / Touch ID — Instant entry</Text>
              </View>
              <Text style={styles.biometricArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR USE CREDENTIALS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>IDENTITY</Text>
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="email@saintsal.com"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ACCESS KEY</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={BLACK} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>INITIALIZE SESSION</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider social */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>PROTOCOL CONNECT</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social auth */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialBtnText}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={handleAppleAuth} disabled={loading}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialBtnText}>APPLE</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation links */}
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.navLink}>← SIGN IN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.navLink}>CREATE ACCOUNT →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.poweredByRow}>
            <View style={styles.poweredByBadge}>
              <Text style={styles.poweredByText}>⚡ POWERED BY SUPABASE</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  closeText: { color: MUTED, fontSize: 18, padding: 8 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: GOLD, fontWeight: '800', fontSize: 20, fontFamily: 'PublicSans-Bold' },
  logoLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  heroTitle: { fontSize: 42, fontWeight: '800', color: '#fff', lineHeight: 50, fontFamily: 'PublicSans-ExtraBold' },
  heroGold: { color: GOLD },
  heroSub: { color: MUTED, fontSize: 10, letterSpacing: 4, marginTop: 8, fontFamily: 'PublicSans-Regular' },
  biometricSection: { paddingHorizontal: 24, marginBottom: 8 },
  biometricBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20,
    borderWidth: 1, borderColor: `${GOLD}4D`, borderRadius: 12,
    backgroundColor: GOLD_DIM,
  },
  biometricIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: `${GOLD}33`,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  biometricEmoji: { fontSize: 24, color: GOLD },
  biometricTitle: { color: GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  biometricSub: { color: MUTED, fontSize: 11, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  biometricArrow: { color: GOLD, fontSize: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: MUTED, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  form: { paddingHorizontal: 24, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  inputWrapper: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)', overflow: 'hidden',
  },
  inputFocused: { borderColor: GOLD },
  input: { color: 'rgba(255,255,255,0.8)', fontSize: 16, paddingHorizontal: 16, paddingVertical: 16, fontFamily: 'PublicSans-Regular' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  submitBtn: {
    backgroundColor: GOLD, borderRadius: 10, paddingVertical: 18, alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  socialRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 4 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingVertical: 14,
    backgroundColor: SURFACE,
  },
  socialIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  socialBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  navLinks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 24 },
  navLink: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  poweredByRow: { alignItems: 'center', marginTop: 24 },
  poweredByBadge: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: SURFACE,
  },
  poweredByText: { color: MUTED, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Regular' },
});
