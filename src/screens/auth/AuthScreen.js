import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { C } from '../../config/theme';

const FEATURES = [
  { icon: '🔍', label: 'Intelligence Search', desc: 'Deep research across every domain' },
  { icon: '⚡', label: 'Builder IDE', desc: 'Full-stack code generation & deploy' },
  { icon: '📊', label: 'Real-Time Analytics', desc: 'Portfolio, markets & deal analysis' },
  { icon: '🤖', label: 'Multi-Model AI', desc: 'Claude, Grok, Gemini stitched together' },
];

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  const handleContinueEmail = () => {
    if (!email.trim() || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
    Alert.alert(
      isSignUp ? 'Account Created' : 'Magic Link Sent',
      isSignUp
        ? `Welcome to SaintSal Labs! Check ${email} to verify.`
        : `Check ${email} for your login link`
    );
  };

  const handleGoogle = () => {
    Alert.alert('Google Sign In', 'Redirecting to Google OAuth...');
  };

  const handleGitHub = () => {
    Alert.alert('GitHub Sign In', 'Redirecting to GitHub OAuth...');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.closeBtn}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={s.topCenter}>
            <View style={s.topLogoDot} />
            <Text style={s.topLogoText}>SAINTSALLABS</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={s.logoArea}>
            <Animated.View style={[s.logoOuter, { opacity: pulseAnim }]}>
              <View style={s.logoCircle}>
                <View style={s.logoInner}>
                  <Text style={s.logoLetter}>S</Text>
                </View>
              </View>
            </Animated.View>
            <Text style={s.heading}>Welcome to{'\n'}SaintSal Labs</Text>
            <Text style={s.tagline}>Intelligence. Amplified.</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Email Input */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>IDENTITY</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@saintsal.com"
                  placeholderTextColor={C.textGhost}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Continue with Email */}
            <TouchableOpacity style={s.primaryBtn} onPress={handleContinueEmail} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>
                {isSignUp ? 'Create Account' : 'Continue with Email'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>PROTOCOL CONNECT</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialBtn} onPress={handleGoogle} activeOpacity={0.7}>
                <Text style={s.socialIcon}>G</Text>
                <Text style={s.socialBtnText}>GOOGLE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialBtn} onPress={handleGitHub} activeOpacity={0.7}>
                <Text style={s.socialIcon}>⌥</Text>
                <Text style={s.socialBtnText}>GITHUB</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Preview */}
          <View style={s.features}>
            <Text style={s.featuresTitle}>WHAT YOU GET ACCESS TO</Text>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.featureRow}>
                <View style={s.featureIcon}>
                  <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.featureLabel}>{f.label}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Toggle Sign Up / Sign In */}
          <TouchableOpacity
            style={s.toggleAuth}
            onPress={() => setIsSignUp((p) => !p)}
          >
            <Text style={s.toggleText}>
              {isSignUp ? 'Already a member? ' : 'New subject? '}
              <Text style={s.toggleLink}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              By continuing, you agree to our{' '}
              <Text style={s.footerLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={s.footerLink}>Privacy Policy</Text>
            </Text>

            {/* Patent Badge */}
            <Text style={s.patentText}>
              US Patent #10,290,222 · HACP Protocol
            </Text>

            {/* Supabase Badge */}
            <View style={s.badge}>
              <Text style={s.badgeIcon}>⚡</Text>
              <Text style={s.badgeText}>POWERED BY SUPABASE</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom decorative line */}
        <Animated.View style={[s.bottomLine, { opacity: glowAnim }]} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: C.amber, fontWeight: '600' },
  topCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLogoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  topLogoText: { fontSize: 11, fontWeight: '800', letterSpacing: 3, color: C.text },
  scrollContent: { paddingHorizontal: 32, paddingBottom: 20 },
  logoArea: { alignItems: 'center', marginTop: 24, marginBottom: 36 },
  logoOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  logoCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  logoInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderGlow },
  logoLetter: { fontSize: 32, fontWeight: '800', color: C.amber },
  heading: { fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center', marginTop: 20, lineHeight: 36, letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontWeight: '600', color: C.amberDim, marginTop: 10, letterSpacing: 2, textTransform: 'uppercase' },
  form: { marginBottom: 28 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amber, marginBottom: 8 },
  inputWrap: { borderRadius: 12, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, overflow: 'hidden' },
  input: { height: 54, paddingHorizontal: 16, fontSize: 15, color: C.text },
  primaryBtn: { height: 54, borderRadius: 12, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  primaryBtnText: { fontSize: 14, fontWeight: '800', color: C.bg, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.borderGlow },
  dividerText: { marginHorizontal: 12, fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textGhost },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  socialIcon: { fontSize: 16, fontWeight: '800', color: C.textSub },
  socialBtnText: { fontSize: 11, fontWeight: '800', color: C.textSub, letterSpacing: 1 },
  features: { marginBottom: 28 },
  featuresTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  featureDesc: { fontSize: 11, color: C.textDim, marginTop: 1 },
  toggleAuth: { alignItems: 'center', marginBottom: 24 },
  toggleText: { fontSize: 12, fontWeight: '600', color: C.textDim },
  toggleLink: { color: C.amber, textDecorationLine: 'underline' },
  footer: { alignItems: 'center', paddingBottom: 16 },
  footerText: { fontSize: 11, color: C.textDim, textAlign: 'center', lineHeight: 18 },
  footerLink: { color: C.amber, textDecorationLine: 'underline' },
  patentText: { fontSize: 9, fontWeight: '600', color: C.textGhost, marginTop: 14, letterSpacing: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.bgCard, gap: 6, opacity: 0.5 },
  badgeIcon: { fontSize: 12, color: C.amber },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: C.textDim },
  bottomLine: { height: 1, marginHorizontal: 40, marginBottom: 8, backgroundColor: C.amber },
});
