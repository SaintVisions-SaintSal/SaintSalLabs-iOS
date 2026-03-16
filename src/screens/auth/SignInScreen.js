/* ═══════════════════════════════════════════════════
   SCREEN 2 — ELITE SIGN IN
   elite_sign_in_screen → Supabase email/password auth
   Colors: #0F0F0F bg · #F9A307 gold · Space Grotesk
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
  ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithPassword, signInWithGoogle } from '../../lib/supabase';

const GOLD  = '#F9A307';
const GOLD_DIM = '#C48206';
const BG    = '#0F0F0F';
const DARK  = '#1A1A1A';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const glowAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.2, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Missing Fields', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
      router.replace('/(tabs)/');
    } catch (err) {
      Alert.alert('Auth Error', err.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const data = await signInWithGoogle();
      if (data?.url) {
        const { Linking } = require('react-native');
        await Linking.openURL(data.url);
      }
    } catch (err) {
      Alert.alert('Auth Error', err.message || 'Google sign-in failed.');
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
            <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
              <Text style={s.closeTxt}>✕</Text>
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
            <Text style={s.heroTitle}>
              Welcome to the{'\n'}
              <Text style={[s.heroTitle, { color: GOLD }]}>Elite</Text>
            </Text>
            <Text style={s.heroSub}>ENTER THE EXCLUSIVE LABORATORY</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Identity field */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>IDENTITY</Text>
              <Animated.View style={[s.inputContainer, { borderColor: glowAnim.interpolate({ inputRange: [0.2, 0.4], outputRange: ['#FFFFFF18', '#F9A30740'] }) }]}>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@saintsal.com"
                  placeholderTextColor="#FFFFFF33"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>
            </View>

            {/* Access Key field */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>ACCESS KEY</Text>
              <View style={[s.inputContainer, s.inputBorder]}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#FFFFFF33"
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                  <Text style={s.eyeTxt}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            <TouchableOpacity style={s.forgotWrap}>
              <Text style={s.forgotTxt}>Forgot access key?</Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitDisabled]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={s.submitTxt}>
                {loading ? 'INITIALIZING...' : 'INITIALIZE SESSION'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>PROTOCOL CONNECT</Text>
            <View style={s.divLine} />
          </View>

          {/* Social buttons */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={s.socialIcon}>G</Text>
              <Text style={s.socialTxt}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
              <Text style={s.socialIcon}>⌥</Text>
              <Text style={s.socialTxt}>GITHUB</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={s.footer}>
            <Text style={s.footerTxt}>New Subject?{' '}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Create Account</Text>
            </TouchableOpacity>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8,
  },
  closeBtn: { padding: 8 },
  closeTxt: { fontSize: 18, color: '#FFFFFF99' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: GOLD + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  logoTxt: { fontSize: 20, fontWeight: '800', color: GOLD },
  brandTxt: { fontSize: 12, fontWeight: '800', color: '#E8E6E1', letterSpacing: 3 },
  hero: { alignItems: 'center', marginTop: 40, marginBottom: 36 },
  heroTitle: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 50, letterSpacing: -1 },
  heroSub: { fontSize: 9, fontWeight: '700', color: '#FFFFFF40', letterSpacing: 3, marginTop: 10, textTransform: 'uppercase' },
  form: { gap: 20 },
  fieldWrap: { gap: 8 },
  label: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 2, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#00000066', borderRadius: 12,
    borderWidth: 1, borderColor: '#FFFFFF18',
    paddingHorizontal: 16,
  },
  inputBorder: { borderColor: '#FFFFFF18' },
  input: { flex: 1, height: 54, fontSize: 15, color: '#FFFFFFCC' },
  eyeBtn: { padding: 8 },
  eyeTxt: { fontSize: 16 },
  forgotWrap: { alignItems: 'flex-end' },
  forgotTxt: { fontSize: 12, color: GOLD + '99', fontWeight: '600' },
  submitBtn: {
    backgroundColor: GOLD, borderRadius: 12, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitTxt: { fontSize: 14, fontWeight: '800', color: BG, letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 28, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: '#FFFFFF10' },
  divTxt: { fontSize: 9, fontWeight: '800', color: '#FFFFFF40', letterSpacing: 2 },
  socialRow: { flexDirection: 'row', gap: 14 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#FFFFFF10',
    borderRadius: 12, backgroundColor: '#FFFFFF08', height: 52,
  },
  socialIcon: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  socialTxt: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 2 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerTxt: { fontSize: 11, fontWeight: '700', color: '#FFFFFF40', letterSpacing: 2, textTransform: 'uppercase' },
  footerLink: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1, textDecorationLine: 'underline' },
  poweredBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#FFFFFF10',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#FFFFFF05', alignSelf: 'center', marginTop: 24,
  },
  poweredIcon: { fontSize: 10, color: '#22C55E' },
  poweredTxt: { fontSize: 9, fontWeight: '800', color: '#FFFFFF40', letterSpacing: 2 },
});
