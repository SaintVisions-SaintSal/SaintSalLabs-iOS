/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — BUSINESS DNA SCREEN
   business_dna_setup — Multi-step onboarding
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

const VIBES = ['Elite / Luxury', 'Creative / Avant-Garde', 'Institutional / Tech', 'Minimalist / Clean'];
const COLORS_OPTS = ['Gold', 'Neon', 'Custom'];
const INDUSTRIES = ['Technology', 'Real Estate', 'Finance', 'Healthcare', 'Marketing', 'Legal', 'Construction', 'Retail', 'Other'];

export default function BusinessDNAScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedColor, setSelectedColor] = useState('Gold');
  const [selectedVibe, setSelectedVibe] = useState('Elite / Luxury');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSave = async () => {
    if (!businessName.trim()) { setError('Enter your business name.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not authenticated.'); return; }

      const { error: dbError } = await supabase.from('profiles').upsert({
        id: user.id,
        business_name: businessName.trim(),
        industry: industry || 'Other',
        platform_color: selectedColor,
        vibe_style: selectedVibe,
        business_goals: goals.trim(),
        onboarded: true,
        updated_at: new Date().toISOString(),
      });

      if (dbError) { setError(dbError.message); return; }
      router.replace('/(tabs)');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
              <Text style={{ fontSize: 22, color: '#E8E6E1', fontWeight: '300' }}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerBrand}>SAINTSAL™ LABS</Text>
            <View style={styles.headerAccent} />
          </View>
          <Text style={styles.headerTitle}>
            Initialize Your{'\n'}
            <Text style={styles.headerTitleGold}>Business DNA</Text>
          </Text>
          <Text style={styles.headerSub}>ONBOARDING PROTOCOL 1.0</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>BUSINESS NAME</Text>
            <View style={styles.underlineWrapper}>
              <TextInput
                style={[styles.underlineInput, focusedField === 'name' && styles.underlineInputFocused]}
                placeholder="E.g. Nexus Corp"
                placeholderTextColor="rgba(75,85,99,1)"
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>INDUSTRY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {INDUSTRIES.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[styles.chip, industry === ind && styles.chipActive]}
                    onPress={() => setIndustry(ind)}
                  >
                    <Text style={[styles.chipText, industry === ind && styles.chipTextActive]}>{ind}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PLATFORM COLORS</Text>
            <View style={styles.colorRow}>
              {COLORS_OPTS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorBtn, selectedColor === c && styles.colorBtnActive]}
                  onPress={() => setSelectedColor(c)}
                >
                  <Text style={[styles.colorBtnText, selectedColor === c && styles.colorBtnTextActive]}>{c.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>VIBE & STYLE</Text>
            <View style={styles.vibeGrid}>
              {VIBES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.vibeBtn, selectedVibe === v && styles.vibeBtnActive]}
                  onPress={() => setSelectedVibe(v)}
                >
                  <Text style={[styles.vibeBtnText, selectedVibe === v && styles.vibeBtnTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>BUSINESS GOALS & BRIEF</Text>
            <View style={[styles.textareaWrapper, focusedField === 'goals' && styles.textareaFocused]}>
              <TextInput
                style={styles.textarea}
                placeholder="Describe your laboratory objectives..."
                placeholderTextColor="rgba(75,85,99,1)"
                value={goals}
                onChangeText={setGoals}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                onFocus={() => setFocusedField('goals')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>SAVE & ENTER LABORATORY</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipBtnText}>SKIP FOR NOW</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: `${BLACK}E6`,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerBrand: { color: GOLD, fontWeight: '700', letterSpacing: 4, fontSize: 12, fontFamily: 'PublicSans-Bold' },
  headerAccent: { height: 4, width: 48, backgroundColor: GOLD, borderRadius: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 36, fontFamily: 'PublicSans-ExtraBold' },
  headerTitleGold: { color: GOLD },
  headerSub: { color: 'rgba(156,163,175,1)', fontSize: 10, marginTop: 8, letterSpacing: 4, fontFamily: 'PublicSans-Regular' },
  scroll: { padding: 24, gap: 28 },
  fieldGroup: { gap: 12 },
  fieldLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 4, fontFamily: 'PublicSans-Bold' },
  underlineWrapper: { borderBottomWidth: 2, borderBottomColor: `${GOLD}33`, paddingBottom: 8 },
  underlineInput: { color: '#fff', fontSize: 16, paddingVertical: 4, fontFamily: 'PublicSans-Regular' },
  underlineInputFocused: { borderBottomColor: GOLD },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  chipActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  chipText: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  chipTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(55,65,81,1)', backgroundColor: 'transparent',
    alignItems: 'center',
  },
  colorBtnActive: { borderColor: GOLD, backgroundColor: GOLD },
  colorBtnText: { color: 'rgba(156,163,175,1)', fontSize: 10, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  colorBtnTextActive: { color: BLACK },
  vibeGrid: { gap: 8 },
  vibeBtn: {
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  vibeBtnActive: { borderColor: GOLD, backgroundColor: GOLD_DIM },
  vibeBtnText: { color: MUTED, fontSize: 13, fontFamily: 'PublicSans-Regular' },
  vibeBtnTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  textareaWrapper: {
    backgroundColor: 'rgba(17,24,39,0.5)', borderWidth: 1, borderColor: 'rgba(55,65,81,1)',
    borderRadius: 12, padding: 16,
  },
  textareaFocused: { borderColor: GOLD },
  textarea: { color: '#fff', fontSize: 14, minHeight: 100, fontFamily: 'PublicSans-Regular' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 32,
    backgroundColor: `${BLACK}F0`,
    gap: 12,
  },
  submitBtn: {
    backgroundColor: GOLD, borderRadius: 32, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: GOLD, shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: BLACK, fontWeight: '900', fontSize: 12, letterSpacing: 3, fontFamily: 'PublicSans-ExtraBold' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipBtnText: { color: MUTED, fontSize: 11, letterSpacing: 2, fontFamily: 'PublicSans-Regular' },
});
