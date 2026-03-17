/* ═══════════════════════════════════════════════════
   STITCH SCREEN — BRANDED AUTH EMAIL
   Source: stitch_ai_chat_suite/saintsal_branded_auth_email
   Branded magic link screen, OTP entry, identity verification
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

export default function BrandedAuthEmail() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [stage, setStage] = useState('email'); // 'email' | 'verify'
  const [loading, setLoading] = useState(false);

  const sendLink = async () => {
    if (!email.trim()) { Alert.alert('Email Required', 'Enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), create_user: true }),
      });
      if (res.ok) {
        setStage('verify');
        Alert.alert('Elite Access Key Sent', `Check ${email} for your verification code.`);
      } else {
        const d = await res.json();
        Alert.alert('Send Failed', d.error_description || 'Could not send verification email.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!token.trim() || token.length < 6) {
      Alert.alert('Enter Code', 'Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), token: token.trim(), type: 'email' }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        Alert.alert('Identity Verified', 'Welcome to SaintSal™ Labs. Elite access granted.', [
          { text: 'Launch Dashboard', onPress: () => router.replace('/(tabs)/dashboard') },
        ]);
      } else {
        Alert.alert('Verification Failed', data.error_description || 'Invalid or expired code.');
      }
    } catch {
      Alert.alert('Error', 'Could not verify identity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Gold Gradient Border */}
      <View style={s.topBorder} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          {/* Logo */}
          <View style={s.logoSection}>
            <View style={s.logoBox}>
              <Text style={s.logoTxt}>S</Text>
            </View>
            <Text style={s.brandLabel}>SAINTSAL™ LABS</Text>
            <Text style={s.brandSub}>IDENTITY VERIFICATION</Text>
          </View>

          {stage === 'email' ? (
            /* Email Entry */
            <View style={s.card}>
              <Text style={s.cardTitle}>Your Elite Access Key is waiting.</Text>
              <Text style={s.cardSub}>
                Enter your email to receive your secure authentication link and access the SaintSal™ Labs infrastructure.
              </Text>

              <Text style={s.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                placeholderTextColor={C.textGhost}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={s.verifyBtn}
                onPress={sendLink}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#000" />
                  : <Text style={s.verifyBtnTxt}>VERIFY IDENTITY</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            /* OTP Verification */
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter your Alternative Access Code</Text>
              <Text style={s.cardSub}>
                We sent a 6-digit code to {email}. Enter it below to complete verification.
              </Text>

              <View style={s.otpSection}>
                <Text style={s.otpHint}>ALTERNATIVE ACCESS CODE</Text>
                <TextInput
                  style={s.otpInput}
                  value={token}
                  onChangeText={setToken}
                  placeholder="000000"
                  placeholderTextColor={C.textGhost}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
                <Text style={s.otpExpiry}>This code expires in 10 minutes.</Text>
              </View>

              <TouchableOpacity
                style={s.verifyBtn}
                onPress={verifyToken}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#000" />
                  : <Text style={s.verifyBtnTxt}>✓ CONFIRM ACCESS</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.resendBtn} onPress={() => setStage('email')}>
                <Text style={s.resendTxt}>← Back to email</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerTxt}>Secured by Supabase Auth · US Patent #10,290,222</Text>
            <Text style={s.footerSub}>SaintSal™ Labs · Intelligence. Amplified.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBorder: { height: 4, backgroundColor: C.gold },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  logoTxt: { fontSize: 32, fontWeight: '900', color: C.bg },
  brandLabel: { fontSize: 10, fontWeight: '900', color: C.gold, letterSpacing: 4, marginBottom: 4 },
  brandSub: { fontSize: 8, fontWeight: '700', color: C.textGhost, letterSpacing: 3 },
  card: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 20, padding: 24, marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: '300', color: C.text, letterSpacing: 0.5, marginBottom: 12 },
  cardSub: { fontSize: 13, color: C.textDim, lineHeight: 20, marginBottom: 24 },
  inputLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 8 },
  input: {
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, color: C.text, fontSize: 14, marginBottom: 20,
  },
  verifyBtn: {
    backgroundColor: C.gold, borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  verifyBtnTxt: { fontSize: 13, fontWeight: '800', color: '#000', letterSpacing: 2.5 },
  otpSection: {
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 20, marginBottom: 20, alignItems: 'center',
  },
  otpHint: { fontSize: 9, fontWeight: '700', color: C.textGhost, letterSpacing: 2, marginBottom: 12 },
  otpInput: {
    fontSize: 32, fontWeight: '700', color: C.gold, letterSpacing: 8,
    fontFamily: 'monospace', paddingVertical: 8, minWidth: 200,
  },
  otpExpiry: { fontSize: 10, color: C.textGhost, fontStyle: 'italic', marginTop: 8 },
  resendBtn: { alignItems: 'center', marginTop: 14 },
  resendTxt: { fontSize: 12, color: C.textDim },
  footer: { alignItems: 'center', gap: 4, paddingBottom: 20 },
  footerTxt: { fontSize: 9, color: C.textGhost, letterSpacing: 0.5 },
  footerSub: { fontSize: 9, color: C.textGhost + '80' },
});
