/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — SIGN UP SCREEN
   elite_sign_up_flow — Full registration
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const FIELD_BG = '#1A1A1A';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignUp = async () => {
    if (!fullName.trim()) { setError('Enter your full name.'); return; }
    if (!email.trim()) { setError('Enter your email address.'); return; }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!termsAccepted) { setError('You must accept the Terms of Protocol.'); return; }

    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: 'saintsallabs://auth/callback',
        },
      });
      if (authError) { setError(authError.message); return; }
      if (data?.user) {
        // Try to create profile
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
          });
        } catch {}
        router.replace('/(auth)/business-dna');
      }
    } catch (e) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'saintsallabs://auth/callback' },
      });
      if (authError) setError(authError.message);
    } catch {
      setError('Google sign up unavailable.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.heroTitle}>Join the{'\n'}Elite</Text>
            <Text style={styles.heroSub}>CREATE YOUR LABORATORY PROFILE</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {[
              { label: 'FULL NAME', value: fullName, setter: setFullName, placeholder: 'John Doe', key: 'name', type: 'default' },
              { label: 'PHONE NUMBER', value: phone, setter: setPhone, placeholder: '+1 (555) 000-0000', key: 'phone', type: 'phone-pad' },
              { label: 'EMAIL ADDRESS', value: email, setter: setEmail, placeholder: 'email@saintsal.com', key: 'email', type: 'email-address' },
              { label: 'CREATE PASSWORD', value: password, setter: setPassword, placeholder: '••••••••', key: 'pass', secure: true },
              { label: 'VERIFY PASSWORD', value: confirmPassword, setter: setConfirmPassword, placeholder: '••••••••', key: 'confirm', secure: true },
            ].map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={[styles.inputWrapper, focusedField === field.key && styles.inputFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="rgba(100,100,100,1)"
                    value={field.value}
                    onChangeText={field.setter}
                    keyboardType={field.type || 'default'}
                    autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                    autoCorrect={false}
                    secureTextEntry={!!field.secure}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            ))}

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setTermsAccepted(!termsAccepted)}>
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.termsLink}>Terms of Protocol</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Shield</Text>
              </Text>
            </TouchableOpacity>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={BLACK} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>CREATE ACCOUNT</Text>
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
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignUp} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialBtnText}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} disabled={loading}>
              <Text style={styles.socialIcon}>⌃</Text>
              <Text style={styles.socialBtnText}>GITHUB</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>ALREADY A SUBJECT? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>INITIALIZE SESSION</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={styles.footerLink}>Terms of Protocol</Text></TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity><Text style={styles.footerLink}>Privacy Shield</Text></TouchableOpacity>
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
  scroll: { flexGrow: 1, paddingBottom: 48 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  closeText: { color: GOLD, fontSize: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: `${GOLD}4D`, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: GOLD, fontWeight: '800', fontSize: 20, fontFamily: 'PublicSans-Bold' },
  logoLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  hero: { paddingHorizontal: 32, paddingTop: 16, paddingBottom: 32 },
  heroTitle: { fontSize: 40, fontWeight: '700', color: '#fff', lineHeight: 48, fontFamily: 'PublicSans-ExtraBold' },
  heroSub: { color: `${GOLD}99`, fontSize: 10, letterSpacing: 4, marginTop: 8, fontFamily: 'PublicSans-Regular' },
  form: { paddingHorizontal: 32, gap: 20 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginLeft: 4, fontFamily: 'PublicSans-Bold' },
  inputWrapper: {
    borderWidth: 1, borderColor: `${GOLD}4D`, borderRadius: 6,
    backgroundColor: FIELD_BG, overflow: 'hidden',
  },
  inputFocused: { borderColor: GOLD },
  input: { color: '#fff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 16, fontFamily: 'PublicSans-Regular' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: `${GOLD}4D`,
    backgroundColor: FIELD_BG, alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: GOLD, borderColor: GOLD },
  checkmark: { color: BLACK, fontSize: 12, fontWeight: '800' },
  termsText: { flex: 1, color: MUTED, fontSize: 12, lineHeight: 18, fontFamily: 'PublicSans-Regular' },
  termsLink: { color: GOLD, textDecorationLine: 'underline' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  submitBtn: {
    backgroundColor: GOLD, borderRadius: 6, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 3, fontFamily: 'PublicSans-ExtraBold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, marginVertical: 32, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: `${GOLD}66`, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  socialRow: { flexDirection: 'row', paddingHorizontal: 32, gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: BORDER, borderRadius: 6, paddingVertical: 12,
    backgroundColor: FIELD_BG,
  },
  socialIcon: { color: '#fff', fontSize: 16 },
  socialBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loginText: { color: MUTED, fontSize: 10, letterSpacing: 3, fontFamily: 'PublicSans-Regular' },
  loginLink: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 3, textDecorationLine: 'underline', fontFamily: 'PublicSans-Bold' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 },
  footerLink: { color: `${GOLD}66`, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Regular' },
  footerDot: { color: BORDER },
  poweredByRow: { alignItems: 'center', marginTop: 16 },
  poweredByBadge: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: SURFACE, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  poweredByText: { color: `rgba(255,255,255,0.3)`, fontSize: 9, letterSpacing: 3, fontFamily: 'PublicSans-Regular' },
});
