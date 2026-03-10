/**
 * SaintSal Labs — Auth Screen
 * Magic link + Google OAuth via Supabase
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../src/config/theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: 'saintsallabs://auth/callback',
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'saintsallabs://auth/callback',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo-120.png')} style={{ width: 100, height: 100, borderRadius: 28, marginBottom: Spacing.md }} />
          <Text style={styles.brand}>SaintSal™ Labs</Text>
          <Text style={styles.tagline}>Full Spectrum Intelligence</Text>
        </View>

        {sent ? (
          /* Email sent state */
          <View style={styles.sentContainer}>
            <Text style={styles.sentIcon}>📧</Text>
            <Text style={styles.sentTitle}>Check your email</Text>
            <Text style={styles.sentDesc}>
              We sent a magic link to{'\n'}
              <Text style={styles.sentEmail}>{email}</Text>
            </Text>
            <TouchableOpacity style={styles.resendBtn} onPress={() => setSent(false)}>
              <Text style={styles.resendText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Login form */
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome</Text>
            <Text style={styles.formSub}>
              Sign in to access 53 AI models, Builder, and 88 connectors.
            </Text>

            {/* Email input */}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Magic link button */}
            <TouchableOpacity
              style={[styles.primaryBtn, !email.trim() && styles.btnDisabled]}
              onPress={handleMagicLink}
              disabled={!email.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0A0A0F" />
              ) : (
                <Text style={styles.primaryBtnText}>Continue with Email</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Skip for now */}
            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.skipText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Saint Vision Technologies LLC
          </Text>
          <Text style={styles.footerPatent}>
            US Patent #10,290,222 · Responsible Intelligence™
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
  // Logo
  logoContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  brand: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700' },
  tagline: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '500', marginTop: 4 },
  // Form
  formContainer: { marginBottom: Spacing.huge },
  formTitle: { color: Colors.textPrimary, fontSize: FontSize.xxxl, fontWeight: '700', marginBottom: 4 },
  formSub: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.xxl },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    color: Colors.textPrimary, fontSize: FontSize.lg, marginBottom: Spacing.lg,
  },
  primaryBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#0A0A0F', fontSize: FontSize.lg, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: FontSize.sm, marginHorizontal: Spacing.lg },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  googleIcon: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  googleText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '500' },
  skipBtn: { alignItems: 'center', marginTop: Spacing.xl },
  skipText: { color: Colors.gold, fontSize: FontSize.md },
  // Sent
  sentContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  sentIcon: { fontSize: 56, marginBottom: Spacing.lg },
  sentTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.sm },
  sentDesc: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  sentEmail: { color: Colors.gold, fontWeight: '600' },
  resendBtn: { marginTop: Spacing.xl },
  resendText: { color: Colors.blue, fontSize: FontSize.md },
  // Footer
  footer: { alignItems: 'center' },
  footerText: { color: Colors.textMuted, fontSize: FontSize.xs },
  footerPatent: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
});
