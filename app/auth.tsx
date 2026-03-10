/**
 * SaintSal Labs — Auth Screen
 * Magic link + Password + Google OAuth via Supabase
 * Premium charcoal + gold — Apple-level design
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius } from '../src/config/theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<'magic' | 'password'>('password');

  // Email + Password sign in (for test accounts & regular users)
  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        // If user doesn't exist, try to sign up
        if (error.message.includes('Invalid login') || error.message.includes('invalid')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
          });
          if (signUpError) throw signUpError;
          if (signUpData?.user) {
            router.replace('/(tabs)');
            return;
          }
        }
        throw error;
      }
      if (data?.user) {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Sign In Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Magic link
  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: 'saintsallabs://auth/callback' },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'saintsallabs://auth/callback' },
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo-120.png')} style={styles.logoImg} />
            <Text style={styles.brand}>SaintSal™ Labs</Text>
            <Text style={styles.tagline}>Full Spectrum Intelligence</Text>
          </View>

          {sent ? (
            /* Magic link sent */
            <View style={styles.sentContainer}>
              <Text style={styles.sentIcon}>📧</Text>
              <Text style={styles.sentTitle}>Check your email</Text>
              <Text style={styles.sentDesc}>
                {'We sent a magic link to\n'}
                <Text style={styles.sentEmail}>{email}</Text>
              </Text>
              <TouchableOpacity style={styles.resendBtn} onPress={() => setSent(false)}>
                <Text style={styles.resendText}>Use a different email</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Sign in form */
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Welcome</Text>
              <Text style={styles.formSub}>
                Sign in to access 51 AI models, Builder, and more.
              </Text>

              {/* Email */}
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

              {/* Password (shown in password mode) */}
              {mode === 'password' && (
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}

              {/* Primary action */}
              {mode === 'password' ? (
                <TouchableOpacity
                  style={[styles.primaryBtn, (!email.trim() || !password.trim()) && styles.btnDisabled]}
                  onPress={handlePasswordLogin}
                  disabled={!email.trim() || !password.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0A0A0F" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryBtn, !email.trim() && styles.btnDisabled]}
                  onPress={handleMagicLink}
                  disabled={!email.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0A0A0F" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Continue with Email</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Toggle between password and magic link */}
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setMode(mode === 'password' ? 'magic' : 'password')}
              >
                <Text style={styles.toggleText}>
                  {mode === 'password' ? 'Use magic link instead' : 'Sign in with password'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google */}
              <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth} activeOpacity={0.7}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Guest */}
              <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Saint Vision Technologies LLC</Text>
            <Text style={styles.footerPatent}>US Patent #10,290,222 · Responsible Intelligence™</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  logoImg: { width: 90, height: 90, borderRadius: 24, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: 'rgba(212, 160, 23, 0.3)' },
  brand: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700', letterSpacing: -0.3 },
  tagline: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '500', marginTop: 4, letterSpacing: 0.3 },

  // Form
  formContainer: { marginBottom: Spacing.huge },
  formTitle: { color: Colors.textPrimary, fontSize: FontSize.xxxl, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
  formSub: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.xxl },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    color: Colors.textPrimary, fontSize: FontSize.lg, marginBottom: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#0A0A0F', fontSize: FontSize.lg, fontWeight: '700' },

  toggleBtn: { alignItems: 'center', marginTop: Spacing.md },
  toggleText: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '500' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: FontSize.sm, marginHorizontal: Spacing.lg },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  socialIcon: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  socialText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '500' },

  guestBtn: { alignItems: 'center', marginTop: Spacing.xl },
  guestText: { color: Colors.gold, fontSize: FontSize.md, fontWeight: '500' },

  // Sent state
  sentContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  sentIcon: { fontSize: 52, marginBottom: Spacing.lg },
  sentTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.sm },
  sentDesc: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  sentEmail: { color: Colors.gold, fontWeight: '600' },
  resendBtn: { marginTop: Spacing.xl },
  resendText: { color: Colors.gold, fontSize: FontSize.md },

  // Footer
  footer: { alignItems: 'center', marginTop: Spacing.xxl },
  footerText: { color: Colors.textMuted, fontSize: FontSize.xs },
  footerPatent: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
});
