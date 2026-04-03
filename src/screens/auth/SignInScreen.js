/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — SIGN IN SCREEN
   Email + password, Google OAuth, magic link
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignIn = async () => {
    if (!email.trim()) { setError('Enter your email address.'); return; }
    if (!password) { setError('Enter your access key.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) { setError(authError.message); return; }
      router.replace('/(tabs)');
    } catch (e) {
      setError('Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) { setError('Enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: 'saintsallabs://auth/callback' },
      });
      if (authError) { setError(authError.message); return; }
      setMagicSent(true);
    } catch (e) {
      setError('Failed to send magic link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'saintsallabs://auth/callback' },
      });
      if (authError) setError(authError.message);
    } catch {
      setError('Google authentication unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BLACK} />
        <View style={styles.centeredContainer}>
          <View style={styles.magicIconCircle}>
            <Text style={styles.magicIcon}>✉</Text>
          </View>
          <Text style={styles.magicTitle}>Access Key Sent</Text>
          <Text style={styles.magicBody}>
            Check {email} for your elite access link. It expires in 10 minutes.
          </Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => setMagicSent(false)}>
            <Text style={styles.outlineBtnText}>BACK TO SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.canGoBack() && router.back()}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoLetter}>S</Text>
              </View>
              <Text style={styles.logoLabel}>SAINTSAL LABS</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              Welcome to{'\n'}the <Text style={styles.heroGold}>Elite</Text>
            </Text>
            <Text style={styles.heroSub}>ENTER THE EXCLUSIVE LABORATORY</Text>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeBtn, !magicLinkMode && styles.modeBtnActive]}
              onPress={() => { setMagicLinkMode(false); setError(''); }}
            >
              <Text style={[styles.modeBtnText, !magicLinkMode && styles.modeBtnTextActive]}>PASSWORD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, magicLinkMode && styles.modeBtnActive]}
              onPress={() => { setMagicLinkMode(true); setError(''); }}
            >
              <Text style={[styles.modeBtnText, magicLinkMode && styles.modeBtnTextActive]}>MAGIC LINK</Text>
            </TouchableOpacity>
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

            {!magicLinkMode && (
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
            )}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={magicLinkMode ? handleMagicLink : handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={BLACK} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {magicLinkMode ? 'SEND MAGIC LINK' : 'INITIALIZE SESSION'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>PROTOCOL CONNECT</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialBtnText}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => Alert.alert('Apple Sign In', 'Coming soon.')}
              disabled={loading}
            >
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialBtnText}>APPLE</Text>
            </TouchableOpacity>
          </View>

          {/* Footer nav */}
          <View style={styles.footerNav}>
            <Text style={styles.footerText}>NEW SUBJECT? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>CREATE ACCOUNT</Text>
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
  centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  closeBtn: { padding: 8 },
  closeBtnText: { color: MUTED, fontSize: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: GOLD, fontWeight: '800', fontSize: 20, fontFamily: 'PublicSans-Bold' },
  logoLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  heroTitle: { fontSize: 42, fontWeight: '800', color: '#fff', lineHeight: 50, fontFamily: 'PublicSans-ExtraBold' },
  heroGold: { color: GOLD },
  heroSub: { color: MUTED, fontSize: 10, letterSpacing: 4, marginTop: 8, fontFamily: 'PublicSans-Regular' },
  modeToggleRow: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 24,
    backgroundColor: SURFACE, borderRadius: 8, borderWidth: 1, borderColor: BORDER, padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  modeBtnActive: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: GOLD },
  modeBtnText: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  modeBtnTextActive: { color: GOLD },
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
    backgroundColor: GOLD, borderRadius: 10, paddingVertical: 18,
    alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 28, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: MUTED, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  socialRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingVertical: 14,
    backgroundColor: SURFACE,
  },
  socialIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  socialBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  footerNav: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  footerText: { color: MUTED, fontSize: 11, letterSpacing: 2, fontFamily: 'PublicSans-Regular' },
  footerLink: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2, textDecorationLine: 'underline', fontFamily: 'PublicSans-Bold' },
  poweredByRow: { alignItems: 'center', marginTop: 24 },
  poweredByBadge: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: SURFACE,
  },
  poweredByText: { color: MUTED, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Regular' },
  magicIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: GOLD_DIM,
    borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  magicIcon: { fontSize: 36, color: GOLD },
  magicTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 12, fontFamily: 'PublicSans-ExtraBold' },
  magicBody: { color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 22, fontFamily: 'PublicSans-Regular' },
  outlineBtn: {
    marginTop: 32, borderWidth: 1, borderColor: GOLD, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  outlineBtnText: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
});
