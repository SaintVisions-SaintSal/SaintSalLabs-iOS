/* ═══════════════════════════════════════════════════
   STITCH SCREEN — BUSINESS DNA SETUP
   Source: stitch_ai_chat_suite/business_dna_setup
   Multi-step onboarding form → Supabase user_profiles
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { supabase } from '../../lib/supabase';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const STEPS = [
  { id: 1, title: 'Business Identity', subtitle: 'Tell us about your company' },
  { id: 2, title: 'Industry & Model', subtitle: 'Define your market position' },
  { id: 3, title: 'Scale & Goals', subtitle: 'Set your intelligence objectives' },
  { id: 4, title: 'Activation', subtitle: 'Launch your elite profile' },
];

const INDUSTRIES = [
  'Technology / SaaS', 'Real Estate', 'Finance / Fintech', 'Healthcare',
  'E-Commerce', 'Consulting', 'Legal', 'Creative / Media', 'Other',
];

const MODELS = [
  'B2B SaaS', 'B2C Product', 'Agency / Services', 'Marketplace',
  'E-Commerce', 'Hybrid', 'Non-Profit',
];

const GOALS = [
  'Automate workflows', 'Close more deals', 'Build products faster',
  'Scale operations', 'Market intelligence', 'Financial analysis',
];

export default function BusinessDNASetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const progressAnim = useRef(new Animated.Value(0.25)).current;

  const [form, setForm] = useState({
    businessName: '',
    website: '',
    tagline: '',
    industry: '',
    model: '',
    teamSize: '',
    annualRevenue: '',
    goals: [],
    description: '',
  });

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleGoal = (goal) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const advanceStep = () => {
    const next = step + 1;
    setStep(next);
    Animated.spring(progressAnim, {
      toValue: next / 4,
      useNativeDriver: false,
      tension: 60,
    }).start();
  };

  const goBack = () => {
    if (step === 1) { router.back(); return; }
    const prev = step - 1;
    setStep(prev);
    Animated.spring(progressAnim, {
      toValue: prev / 4,
      useNativeDriver: false,
      tension: 60,
    }).start();
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to save your Business DNA.');
        setSaving(false);
        return;
      }

      const payload = {
        user_id: user.id,
        business_name: form.businessName,
        website: form.website,
        tagline: form.tagline,
        industry: form.industry,
        business_model: form.model,
        team_size: form.teamSize,
        annual_revenue: form.annualRevenue,
        goals: form.goals,
        description: form.description,
        onboarding_complete: true,
        created_at: new Date().toISOString(),
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 201) {
        Alert.alert('Business DNA Initialized', 'Your elite profile is live. Welcome to SaintSal Labs.', [
          { text: 'Launch Dashboard', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Save Error', `Status ${res.status}. Profile may already exist.`);
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert('Connection Error', 'Could not save. Proceeding to dashboard.');
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <View style={s.stepContent}>
      <Text style={s.stepLabel}>BUSINESS NAME *</Text>
      <TextInput
        style={s.input}
        value={form.businessName}
        onChangeText={v => updateForm('businessName', v)}
        placeholder="SaintSal Labs Inc."
        placeholderTextColor={C.textGhost}
      />
      <Text style={s.stepLabel}>WEBSITE</Text>
      <TextInput
        style={s.input}
        value={form.website}
        onChangeText={v => updateForm('website', v)}
        placeholder="https://yourdomain.com"
        placeholderTextColor={C.textGhost}
        autoCapitalize="none"
        keyboardType="url"
      />
      <Text style={s.stepLabel}>BRAND TAGLINE</Text>
      <TextInput
        style={s.input}
        value={form.tagline}
        onChangeText={v => updateForm('tagline', v)}
        placeholder="Intelligence. Elevated."
        placeholderTextColor={C.textGhost}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={s.stepContent}>
      <Text style={s.stepLabel}>INDUSTRY</Text>
      <View style={s.chipGrid}>
        {INDUSTRIES.map(ind => (
          <TouchableOpacity
            key={ind}
            style={[s.chip, form.industry === ind && s.chipActive]}
            onPress={() => updateForm('industry', ind)}
          >
            <Text style={[s.chipTxt, form.industry === ind && s.chipTxtActive]}>{ind}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.stepLabel, { marginTop: 20 }]}>BUSINESS MODEL</Text>
      <View style={s.chipGrid}>
        {MODELS.map(m => (
          <TouchableOpacity
            key={m}
            style={[s.chip, form.model === m && s.chipActive]}
            onPress={() => updateForm('model', m)}
          >
            <Text style={[s.chipTxt, form.model === m && s.chipTxtActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={s.stepContent}>
      <Text style={s.stepLabel}>TEAM SIZE</Text>
      <View style={s.chipGrid}>
        {['Solo', '2-10', '11-50', '51-200', '200+'].map(sz => (
          <TouchableOpacity
            key={sz}
            style={[s.chip, form.teamSize === sz && s.chipActive]}
            onPress={() => updateForm('teamSize', sz)}
          >
            <Text style={[s.chipTxt, form.teamSize === sz && s.chipTxtActive]}>{sz}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.stepLabel, { marginTop: 20 }]}>PRIMARY GOALS</Text>
      <View style={s.chipGrid}>
        {GOALS.map(g => (
          <TouchableOpacity
            key={g}
            style={[s.chip, form.goals.includes(g) && s.chipActive]}
            onPress={() => toggleGoal(g)}
          >
            <Text style={[s.chipTxt, form.goals.includes(g) && s.chipTxtActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.stepLabel, { marginTop: 20 }]}>DESCRIBE YOUR BUSINESS</Text>
      <TextInput
        style={[s.input, s.textArea]}
        value={form.description}
        onChangeText={v => updateForm('description', v)}
        placeholder="What does your business do and what problem does it solve?"
        placeholderTextColor={C.textGhost}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={s.stepContent}>
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>BUSINESS DNA PROFILE</Text>
        {[
          ['Company', form.businessName || '—'],
          ['Website', form.website || '—'],
          ['Industry', form.industry || '—'],
          ['Model', form.model || '—'],
          ['Team Size', form.teamSize || '—'],
          ['Goals', form.goals.join(', ') || '—'],
        ].map(([k, v]) => (
          <View key={k} style={s.summaryRow}>
            <Text style={s.summaryKey}>{k}</Text>
            <Text style={s.summaryVal}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={s.activationBadge}>
        <Text style={s.activationIcon}>✦</Text>
        <Text style={s.activationTxt}>Ready to Initialize</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SAINTSAL™ LABS</Text>
          <Text style={s.headerSub}>INITIALIZE YOUR BUSINESS DNA</Text>
        </View>
        <View style={s.stepBadge}>
          <Text style={s.stepBadgeTxt}>{step}/4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, {
          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>

      {/* Step Info */}
      <View style={s.stepHeader}>
        <Text style={s.stepTitle}>{STEPS[step - 1].title}</Text>
        <Text style={s.stepSubtitle}>{STEPS[step - 1].subtitle}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* CTA */}
        <View style={s.footer}>
          {step < 4 ? (
            <TouchableOpacity style={s.ctaBtn} onPress={advanceStep} activeOpacity={0.85}>
              <Text style={s.ctaTxt}>CONTINUE →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.ctaBtn, s.ctaActivate]}
              onPress={saveProfile}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={[s.ctaTxt, { color: C.bg }]}>✦ ACTIVATE BUSINESS DNA</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 3 },
  headerSub: { fontSize: 9, fontWeight: '600', color: C.textDim, letterSpacing: 1.5, marginTop: 2 },
  stepBadge: {
    backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  stepBadgeTxt: { fontSize: 11, fontWeight: '800', color: C.gold },
  progressTrack: { height: 3, backgroundColor: C.bgElevated },
  progressFill: { height: 3, backgroundColor: C.gold },
  stepHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  stepSubtitle: { fontSize: 12, color: C.textDim, marginTop: 4 },
  scroll: { flex: 1 },
  stepContent: { paddingHorizontal: 20, paddingTop: 12 },
  stepLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 10, marginTop: 8 },
  input: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, color: C.text, fontSize: 14,
    marginBottom: 4,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9,
  },
  chipActive: { backgroundColor: C.gold + '20', borderColor: C.gold },
  chipTxt: { fontSize: 12, fontWeight: '600', color: C.textDim },
  chipTxtActive: { color: C.gold, fontWeight: '700' },
  summaryCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 20, gap: 12,
  },
  summaryTitle: { fontSize: 9, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryKey: { fontSize: 11, fontWeight: '700', color: C.textDim, flex: 1 },
  summaryVal: { fontSize: 12, color: C.text, flex: 2, textAlign: 'right' },
  activationBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 24, padding: 16,
    backgroundColor: C.gold + '10', borderWidth: 1, borderColor: C.gold + '30', borderRadius: 12,
  },
  activationIcon: { fontSize: 18, color: C.gold },
  activationTxt: { fontSize: 14, fontWeight: '700', color: C.gold },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: C.border },
  ctaBtn: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.gold,
    borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center',
  },
  ctaActivate: { backgroundColor: C.gold },
  ctaTxt: { fontSize: 13, fontWeight: '800', color: C.gold, letterSpacing: 2 },
});
