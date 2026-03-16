/* ═══════════════════════════════════════════════════
   SCREEN 21 — ELITE SOCIAL CONTENT GENERATOR
   social_content_generator_elite → Multi-platform content
   Wire: GPT-4o + SAL API social generation
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { generateSocialServer } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const PLATFORMS = [
  { id: 'twitter',   label: 'X / Twitter', icon: '𝕏',  color: '#1DA1F2', limit: 280 },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '💼', color: '#0A66C2', limit: 3000 },
  { id: 'instagram', label: 'Instagram',   icon: '📸', color: '#E1306C', limit: 2200 },
  { id: 'tiktok',    label: 'TikTok',      icon: '🎵', color: '#FF0050', limit: 2200 },
  { id: 'facebook',  label: 'Facebook',    icon: '👤', color: '#1877F2', limit: 63206 },
  { id: 'threads',   label: 'Threads',     icon: '🧵', color: '#FFFFFF', limit: 500 },
];

const TONES = [
  { id: 'bold',        label: '🔥 BOLD' },
  { id: 'professional', label: '💼 PROFESSIONAL' },
  { id: 'casual',      label: '😎 CASUAL' },
  { id: 'luxury',      label: '✨ LUXURY' },
  { id: 'motivational', label: '⚡ MOTIVATIONAL' },
  { id: 'educational', label: '🎓 EDUCATIONAL' },
];

export default function SocialContentGenScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [prompt, setPrompt]   = useState('');
  const [tone, setTone]       = useState('bold');
  const [selected, setSelected] = useState(['twitter', 'linkedin', 'instagram']);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const togglePlatform = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return Alert.alert('Error', 'Enter your content topic.');
    if (selected.length === 0) return Alert.alert('Error', 'Select at least one platform.');
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setResults(null);
    try {
      const data = await generateSocialServer({ prompt, platforms: selected, tone });
      setResults(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    Clipboard.setString(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Elite Content Generator</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>GPT-4o · MULTI-PLATFORM</Text>
          </View>
        </View>
        <View style={s.statBadge}>
          <Text style={s.statTxt}>{selected.length}</Text>
          <Text style={s.statLabel}>PLATFORMS</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.pad}>
          {/* Platform Selector */}
          <Text style={s.fieldLabel}>PLATFORMS</Text>
          <View style={s.platformGrid}>
            {PLATFORMS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[s.platformChip, selected.includes(p.id) && { borderColor: p.color, backgroundColor: p.color + '15' }]}
                onPress={() => togglePlatform(p.id)}
                activeOpacity={0.8}
              >
                <Text style={s.platformIcon}>{p.icon}</Text>
                <Text style={[s.platformLabel, selected.includes(p.id) && { color: p.color }]}>{p.label}</Text>
                {selected.includes(p.id) && <Text style={[s.platformCheck, { color: p.color }]}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tone Selector */}
          <Text style={s.fieldLabel}>TONE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.toneRow}>
            {TONES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.toneChip, tone === t.id && s.toneActive]}
                onPress={() => setTone(t.id)}
              >
                <Text style={[s.toneTxt, tone === t.id && { color: BG }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Topic Input */}
          <Text style={s.fieldLabel}>CONTENT TOPIC</Text>
          <TextInput
            style={s.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="What's your content about? Be specific..."
            placeholderTextColor="#444"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.generateBtn, loading && { opacity: 0.6 }]}
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.generateTxt}>{loading ? '✨ GENERATING...' : '✨ GENERATE CONTENT'}</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>GENERATED CONTENT</Text>
            {PLATFORMS.filter(p => selected.includes(p.id) && results[p.id]).map(p => (
              <View key={p.id} style={[s.resultCard, { borderColor: p.color + '30' }]}>
                <View style={s.resultHeader}>
                  <Text style={s.resultPlatformIcon}>{p.icon}</Text>
                  <Text style={[s.resultPlatform, { color: p.color }]}>{p.label}</Text>
                  <Text style={s.charCount}>{(results[p.id] || '').length}/{p.limit}</Text>
                  <TouchableOpacity
                    style={[s.copyBtn, { borderColor: p.color + '40', backgroundColor: p.color + '10' }]}
                    onPress={() => handleCopy(p.id, results[p.id])}
                  >
                    <Text style={[s.copyBtnTxt, { color: p.color }]}>{copied === p.id ? '✓ COPIED' : '⧉ COPY'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.resultContent}>{results[p.id]}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!results && !loading && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>✨</Text>
            <Text style={s.emptyTxt}>Elite Content Studio</Text>
            <Text style={s.emptySub}>Select platforms, set tone, and generate viral-ready content for all channels simultaneously</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  liveTxt: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 1.5 },
  statBadge: { alignItems: 'center', backgroundColor: GOLD + '20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '40' },
  statTxt: { fontSize: 16, fontWeight: '800', color: GOLD },
  statLabel: { fontSize: 7, fontWeight: '800', color: GOLD + '80', letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 10, marginTop: 14 },
  platformGrid: { gap: 8, marginBottom: 4 },
  platformChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 12, padding: 12 },
  platformIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  platformLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#E8E6E1' },
  platformCheck: { fontSize: 14, fontWeight: '800' },
  toneRow: { gap: 8, paddingBottom: 4 },
  toneChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD },
  toneActive: { backgroundColor: GOLD, borderColor: GOLD },
  toneTxt: { fontSize: 11, fontWeight: '700', color: GOLD },
  promptInput: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14, minHeight: 80 },
  generateBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  generateTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  resultCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  resultPlatformIcon: { fontSize: 16 },
  resultPlatform: { flex: 1, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  charCount: { fontSize: 10, color: '#6B7280' },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  copyBtnTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  resultContent: { fontSize: 13, color: '#E8E6E1', lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
