/* ═══════════════════════════════════════════════════
   SCREEN 5 — BUSINESS DNA SETUP
   business_dna_setup → Onboarding: profile + prefs
   Colors: #0F0F0F bg · #D4AF37 gold · Inter font
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { upsertProfile } from '../../lib/supabase';

const GOLD      = '#D4AF37';
const GOLD_BRT  = '#FFD700';
const GOLD_DARK = '#996515';
const BG        = '#0F0F0F';

const VIBES = [
  { id: 'elite',         label: 'Elite / Luxury' },
  { id: 'creative',      label: 'Creative / Avant-Garde' },
  { id: 'institutional', label: 'Institutional / Tech' },
  { id: 'minimalist',    label: 'Minimalist / Clean' },
];

const COLOR_OPTIONS = ['Gold', 'Neon', 'Custom'];

export default function BusinessDNAScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [selectedColor, setSelectedColor] = useState('Gold');
  const [selectedVibe, setSelectedVibe] = useState('elite');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!businessName.trim()) {
      return Alert.alert('Required', 'Please enter your business name.');
    }
    setLoading(true);
    try {
      if (user) {
        await upsertProfile(user.id, {
          business_name: businessName.trim(),
          platform_color: selectedColor,
          vibe_style: selectedVibe,
          business_goals: goals.trim(),
          onboarding_complete: true,
        });
      }
      router.replace('/(tabs)/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Sticky Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.brandTxt}>SAINTSAL™ LABS</Text>
            <View style={s.headerAccent} />
          </View>
          <Text style={s.title}>
            Initialize Your{'\n'}
            <Text style={s.titleGold}>Business DNA</Text>
          </Text>
          <Text style={s.subtitle}>ONBOARDING PROTOCOL 1.0</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Business Name */}
          <View style={s.section}>
            <Text style={s.label}>BUSINESS NAME</Text>
            <TextInput
              style={s.underlineInput}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="E.g. Nexus Corp"
              placeholderTextColor="#666"
              autoCapitalize="words"
            />
          </View>

          {/* Platform Colors */}
          <View style={s.section}>
            <Text style={s.label}>PLATFORM COLORS</Text>
            <View style={s.colorRow}>
              {COLOR_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.colorBtn, selectedColor === opt && s.colorBtnActive]}
                  onPress={() => setSelectedColor(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.colorBtnTxt, selectedColor === opt && s.colorBtnTxtActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vibe & Style */}
          <View style={s.section}>
            <Text style={s.label}>VIBE & STYLE</Text>
            <View style={s.vibeList}>
              {VIBES.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[s.vibeItem, selectedVibe === v.id && s.vibeItemActive]}
                  onPress={() => setSelectedVibe(v.id)}
                  activeOpacity={0.8}
                >
                  <View style={[s.vibeRadio, selectedVibe === v.id && s.vibeRadioActive]}>
                    {selectedVibe === v.id && <View style={s.vibeRadioDot} />}
                  </View>
                  <Text style={[s.vibeLabel, selectedVibe === v.id && s.vibeLabelActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Goals */}
          <View style={s.section}>
            <Text style={s.label}>BUSINESS GOALS & BRIEF</Text>
            <TextInput
              style={s.textarea}
              value={goals}
              onChangeText={setGoals}
              placeholder="Describe your laboratory objectives..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Skip option */}
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={s.skipTxt}>Skip for now →</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Sticky Footer CTA */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.saveBtn, loading && s.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={s.saveTxt}>
              {loading ? 'SAVING...' : 'SAVE & ENTER LABORATORY'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24,
    backgroundColor: BG + 'EE',
    borderBottomWidth: 1, borderBottomColor: '#FFFFFF08',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  brandTxt: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 3 },
  headerAccent: { width: 48, height: 4, backgroundColor: GOLD, borderRadius: 2 },
  title: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', lineHeight: 36, letterSpacing: -0.5 },
  titleGold: { color: GOLD },
  subtitle: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', letterSpacing: 3, marginTop: 8, textTransform: 'uppercase' },
  scroll: { paddingHorizontal: 24, paddingTop: 20 },
  section: { marginBottom: 28 },
  label: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  underlineInput: {
    color: '#FFFFFF', fontSize: 16, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: GOLD + '30',
    paddingHorizontal: 0,
  },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#444', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  colorBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  colorBtnTxt: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  colorBtnTxtActive: { color: BG },
  vibeList: { gap: 10 },
  vibeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF05', borderRadius: 10,
    borderWidth: 1, borderColor: '#FFFFFF10',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  vibeItemActive: { borderColor: GOLD + '60', backgroundColor: GOLD + '10' },
  vibeRadio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#444',
    alignItems: 'center', justifyContent: 'center',
  },
  vibeRadioActive: { borderColor: GOLD },
  vibeRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
  vibeLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  vibeLabelActive: { color: '#FFFFFF' },
  textarea: {
    backgroundColor: '#111116', borderWidth: 1, borderColor: '#FFFFFF10',
    borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 14,
    minHeight: 100, lineHeight: 22,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipTxt: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 12,
    backgroundColor: BG + 'EE',
    borderTopWidth: 1, borderTopColor: '#FFFFFF08',
  },
  saveBtn: {
    backgroundColor: GOLD, borderRadius: 30, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveTxt: { fontSize: 12, fontWeight: '900', color: BG, letterSpacing: 2.5, textTransform: 'uppercase' },
});
