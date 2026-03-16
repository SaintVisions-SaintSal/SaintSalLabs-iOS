/* ═══════════════════════════════════════════════════
   SCREEN 3 — ELITE SIGN UP
   elite_sign_up_flow → Supabase email/password signup
   Colors: #0F0F0F bg · #D4AF37 gold · monospace font
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signUpWithPassword } from '../../lib/supabase';

const GOLD     = '#D4AF37';
const GOLD_DIM = '#B8942A';
const BG       = '#0F0F0F';
const FIELD_BG = '#1A1A1A';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim()) return Alert.alert('Required', 'Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Required', 'Please enter a valid email.');
    if (password.length < 8) return Alert.alert('Weak Password', 'Password must be at least 8 characters.');
    if (password !== confirm) return Alert.alert('Mismatch', 'Passwords do not match.');

    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password, {
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      // Navigate to email verification screen
      router.push({ pathname: '/(auth)/verify-email', params: { email: email.trim() } });
    } catch (err) {
      Alert.alert('Signup Error', err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Text style={s.backTxt}>✕</Text>
            </TouchableOpacity>
            <View style={s.brandRow}>
              <View style={s.logoBox}>
                <Text style={s.logoTxt}>S</Text>
              </View>
              <Text style={s.brandTxt}>SAINTSAL LABS</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.heroTitle}>Join the{'\n'}Elite</Text>
            <Text style={s.heroSub}>CREATE YOUR LABORATORY PROFILE</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Field label="FULL NAME" value={fullName} onChangeText={setFullName}
              placeholder="John Doe" autoComplete="name" />
            <Field label="PHONE NUMBER" value={phone} onChangeText={setPhone}
              placeholder="+1 (555) 000-0000" keyboardType="phone-pad" autoComplete="tel" />
            <Field label="EMAIL ADDRESS" value={email} onChangeText={setEmail}
              placeholder="email@saintsal.com" keyboardType="email-address"
              autoCapitalize="none" autoComplete="email" />
            <Field label="CREATE PASSWORD" value={password} onChangeText={setPassword}
              placeholder="••••••••" secure />
            <Field label="VERIFY PASSWORD" value={confirm} onChangeText={setConfirm}
              placeholder="••••••••" secure />

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={s.submitTxt}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>PROTOCOL CONNECT</Text>
            <View style={s.divLine} />
          </View>

          {/* Social */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
              <Text style={s.socialIcon}>G</Text>
              <Text style={s.socialTxt}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
              <Text style={s.socialIcon}>⌥</Text>
              <Text style={s.socialTxt}>GITHUB</Text>
            </TouchableOpacity>
          </View>

          {/* Sign in link */}
          <View style={s.signinRow}>
            <Text style={s.signinTxt}>Already a subject?{' '}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={s.signinLink}>Initialize Session</Text>
            </TouchableOpacity>
          </View>

          {/* Footer links */}
          <View style={s.footerLinks}>
            <TouchableOpacity><Text style={s.footerLinkTxt}>Terms of Protocol</Text></TouchableOpacity>
            <Text style={s.footerDot}>·</Text>
            <TouchableOpacity><Text style={s.footerLinkTxt}>Privacy Shield</Text></TouchableOpacity>
          </View>

          {/* Powered badge */}
          <View style={s.poweredBadge}>
            <Text style={s.poweredIcon}>⚡</Text>
            <Text style={s.poweredTxt}>POWERED BY SUPABASE</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, secure, keyboardType, autoCapitalize, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={f.inputRow}>
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
          secureTextEntry={secure && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || (secure ? 'none' : 'words')}
          autoCorrect={false}
          autoComplete={autoComplete}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} style={f.eyeBtn}>
            <Text>{show ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 2, marginLeft: 2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: FIELD_BG, borderRadius: 8,
    borderWidth: 1, borderColor: GOLD + '44',
    paddingHorizontal: 14,
  },
  input: { flex: 1, height: 52, fontSize: 15, color: '#FFFFFF', fontFamily: 'monospace' },
  eyeBtn: { padding: 8 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  backTxt: { fontSize: 18, color: '#FFFFFF99' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: FIELD_BG, borderWidth: 1, borderColor: GOLD + '55',
    alignItems: 'center', justifyContent: 'center',
  },
  logoTxt: { fontSize: 20, fontWeight: '800', color: GOLD },
  brandTxt: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 3 },
  hero: { alignItems: 'center', marginTop: 36, marginBottom: 32 },
  heroTitle: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 50 },
  heroSub: { fontSize: 9, fontWeight: '700', color: GOLD + '60', letterSpacing: 3, marginTop: 10, textTransform: 'uppercase' },
  form: { gap: 18 },
  submitBtn: {
    backgroundColor: GOLD, borderRadius: 8, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 3, textTransform: 'uppercase' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 28, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: '#FFFFFF10' },
  divTxt: { fontSize: 9, fontWeight: '800', color: '#FFFFFF40', letterSpacing: 2 },
  socialRow: { flexDirection: 'row', gap: 14 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#FFFFFF10',
    borderRadius: 8, backgroundColor: FIELD_BG, height: 52,
  },
  socialIcon: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  socialTxt: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 2 },
  signinRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  signinTxt: { fontSize: 10, fontWeight: '700', color: '#FFFFFF40', letterSpacing: 2, textTransform: 'uppercase' },
  signinLink: { fontSize: 10, fontWeight: '700', color: GOLD, textDecorationLine: 'underline', letterSpacing: 1 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 18 },
  footerLinkTxt: { fontSize: 9, color: '#FFFFFF40', letterSpacing: 2, textTransform: 'uppercase' },
  footerDot: { fontSize: 9, color: '#FFFFFF20' },
  poweredBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#FFFFFF10', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#FFFFFF05', alignSelf: 'center', marginTop: 16,
  },
  poweredIcon: { fontSize: 10, color: '#22C55E' },
  poweredTxt: { fontSize: 9, fontWeight: '800', color: '#FFFFFF40', letterSpacing: 2 },
});
