/* ═══════════════════════════════════════════════════
   ONBOARDING STEP 2 — Business DNA Selection
   Pick 3 intelligence areas
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const MAX = 3;

const DNA_OPTIONS = [
  { id: 'Real Estate',  icon: '🏠', color: '#22C55E' },
  { id: 'Finance',      icon: '📈', color: '#3B82F6' },
  { id: 'Sports',       icon: '🏀', color: '#F97316' },
  { id: 'Collectibles', icon: '🃏', color: '#A855F7' },
  { id: 'Tech',         icon: '💻', color: '#06B6D4' },
  { id: 'News',         icon: '📰', color: '#EF4444' },
  { id: 'Medical',      icon: '🏥', color: '#14B8A6' },
  { id: 'Business',     icon: '🏢', color: '#F59E0B' },
];

export default function OnboardingDNA() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = async () => {
    if (selected.length < MAX) {
      Alert.alert('Pick 3', 'Please select 3 intelligence areas to continue.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            interests: selected,
            dna_set_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[DNA] Save error:', e);
    }

    router.push('/(stack)/onboarding-profile');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.step}>STEP 2 OF 4</Text>
        <Text style={s.title}>What's your Business DNA?</Text>
        <Text style={s.subtitle}>Pick 3 intelligence areas — SAL personalizes everything for you</Text>

        <View style={s.grid}>
          {DNA_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  s.tile,
                  isSelected && { borderColor: opt.color, backgroundColor: opt.color + '15' },
                ]}
                onPress={() => toggle(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 36 }}>{opt.icon}</Text>
                <Text style={[s.tileLabel, isSelected && { color: opt.color }]}>{opt.id}</Text>
                {isSelected && (
                  <View style={[s.checkCircle, { backgroundColor: opt.color }]}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.counter}>{selected.length} / {MAX} selected</Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[s.goldBtn, selected.length < MAX && { opacity: 0.4 }]}
          onPress={handleContinue}
          disabled={selected.length < MAX}
        >
          <Text style={s.goldBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1, padding: 24, paddingTop: 20 },
  step: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%', aspectRatio: 1.2, borderRadius: 16,
    backgroundColor: '#141416', borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  tileLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  checkCircle: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  counter: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 16 },
  goldBtn: {
    backgroundColor: GOLD, borderRadius: 16, paddingVertical: 16,
    width: '100%', alignItems: 'center', marginBottom: 20,
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', color: BG },
});
