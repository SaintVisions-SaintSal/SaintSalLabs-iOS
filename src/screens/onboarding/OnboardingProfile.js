/* ═══════════════════════════════════════════════════
   ONBOARDING STEP 3 — Profile Setup
   Display name, business name (optional), avatar
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';

const AVATARS = ['🤖', '🧑‍💼', '👨‍💻', '👩‍💼', '🦊', '🐺', '🦅', '🏆'];

export default function OnboardingProfile() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!displayName.trim()) return;
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            name: displayName.trim(),
            business_name: businessName.trim() || null,
            avatar_url: avatar,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[Profile] Save error:', e);
    }

    setSaving(false);
    router.push('/(stack)/onboarding-tutorial');
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.step}>STEP 3 OF 4</Text>
          <Text style={s.title}>Make it yours</Text>
          <Text style={s.subtitle}>How should SAL know you?</Text>

          {/* Avatar picker */}
          <Text style={s.label}>Choose your avatar</Text>
          <View style={s.avatarRow}>
            {AVATARS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[s.avatarCircle, avatar === a && s.avatarSelected]}
                onPress={() => setAvatar(a)}
              >
                <Text style={{ fontSize: 28 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Display Name */}
          <Text style={s.label}>Display Name</Text>
          <TextInput
            style={s.input}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          {/* Business Name */}
          <Text style={s.label}>Business Name <Text style={s.optional}>(optional)</Text></Text>
          <TextInput
            style={s.input}
            placeholder="Your company or brand"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
          />

          <View style={{ flex: 1, minHeight: 40 }} />

          <TouchableOpacity
            style={[s.goldBtn, !displayName.trim() && { opacity: 0.4 }]}
            onPress={handleContinue}
            disabled={!displayName.trim() || saving}
          >
            <Text style={s.goldBtnText}>{saving ? 'Saving...' : 'Continue →'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 24, paddingTop: 20, flexGrow: 1 },
  step: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 10, marginTop: 20 },
  optional: { fontWeight: '400', color: 'rgba(255,255,255,0.25)' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  avatarSelected: { borderColor: GOLD, backgroundColor: 'rgba(212,175,55,0.1)' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  goldBtn: {
    backgroundColor: GOLD, borderRadius: 16, paddingVertical: 16,
    width: '100%', alignItems: 'center', marginBottom: 20,
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', color: BG },
});
