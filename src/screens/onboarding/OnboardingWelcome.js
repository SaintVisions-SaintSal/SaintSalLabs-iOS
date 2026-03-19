/* ═══════════════════════════════════════════════════
   ONBOARDING STEP 1 — Welcome Screen
═══════════════════════════════════════════════════ */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Text style={{ fontSize: 64 }}>🤖</Text>
        </View>

        <Text style={s.title}>Welcome to{'\n'}SaintSal™ Labs</Text>
        <Text style={s.subtitle}>The AI platform built for your business</Text>

        {/* Features */}
        <View style={s.featureList}>
          {[
            { icon: '🧠', text: 'Personalized AI intelligence across every vertical' },
            { icon: '⚡', text: 'Build websites, apps, and automations' },
            { icon: '📈', text: 'Real-time market data and analytics' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={s.goldBtn}
          onPress={() => router.push('/(stack)/onboarding-dna')}
        >
          <Text style={s.goldBtnText}>Get Started →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1, padding: 32, alignItems: 'center', paddingTop: 60 },
  logoWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 2, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    shadowColor: GOLD, shadowOpacity: 0.4, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 40 },
  featureList: { width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14, paddingHorizontal: 8 },
  featureText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', flex: 1, lineHeight: 21 },
  goldBtn: {
    backgroundColor: GOLD, borderRadius: 16, paddingVertical: 16,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', color: BG },
  skipBtn: { paddingVertical: 12 },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.3)' },
});
