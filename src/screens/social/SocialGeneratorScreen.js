import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';
import { generateSocial } from '../../lib/api';
import { SALMark } from '../../components';

const PLATFORMS = [
  { id: 'twitter',   label: 'X / Twitter',  icon: '𝕏', charLimit: 280 },
  { id: 'linkedin',  label: 'LinkedIn',      icon: '💼', charLimit: 3000 },
  { id: 'instagram', label: 'Instagram',     icon: '📸', charLimit: 2200 },
  { id: 'tiktok',    label: 'TikTok',        icon: '🎵', charLimit: 2200 },
  { id: 'discord',   label: 'Discord',       icon: '🎮', charLimit: 2000 },
  { id: 'threads',   label: 'Threads',       icon: '🧵', charLimit: 500 },
];

export default function SocialGeneratorScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState(['twitter', 'linkedin', 'instagram']);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const togglePlatform = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || selected.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const data = await generateSocial({ prompt: prompt.trim(), platforms: selected });
      setResults(data);
    } catch (e) {
      setResults({ _error: 'Generation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (platformId, text) => {
    Clipboard.setStringAsync(text);
    setCopiedId(platformId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={36} />
          <View>
            <Text style={s.headerTitle}>SaintSal <Text style={s.headerBadge}> AI</Text></Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.statusRow}>
            <Animated.View style={[s.statusDot, { opacity: pulseAnim }]} />
            <Text style={s.statusLabel}>Neural Engine</Text>
          </View>
          <Text style={s.statusLoad}>Load: 24%</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* System Integrity */}
        <View style={s.integrityCard}>
          <View style={s.integrityRow}>
            <Text style={s.integrityLabel}>System Integrity</Text>
            <Text style={s.integrityValue}>100%</Text>
          </View>
          <View style={s.integrityBarBg}>
            <View style={s.integrityBarFill} />
          </View>
        </View>

        {/* Prompt Input */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Post Content</Text>
          <View style={s.textareaWrap}>
            <TextInput
              style={s.textarea}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="What's the core message of your post? SaintSal will handle the formatting and tone for each platform..."
              placeholderTextColor={C.textGhost}
              multiline
              textAlignVertical="top"
            />
            <View style={s.textareaActions}>
              <Text style={s.textareaIcon}>🎤</Text>
              <Text style={s.textareaIcon}>📎</Text>
            </View>
          </View>
        </View>

        {/* Platform Selector */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Target Platforms</Text>
            <Text style={s.selectedCount}>{selected.length} SELECTED</Text>
          </View>
          <View style={s.platformGrid}>
            {PLATFORMS.map(p => {
              const active = selected.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[s.platformBtn, active && s.platformBtnActive]}
                  onPress={() => togglePlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.platformIcon}>{p.icon}</Text>
                  <Text style={[s.platformLabel, active && s.platformLabelActive]}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[s.generateBtn, (!prompt.trim() || selected.length === 0) && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={loading || !prompt.trim() || selected.length === 0}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <>
              <Text style={s.generateIcon}>✨</Text>
              <Text style={s.generateText}>GENERATE CONTENT</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {results && !results._error && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Live Previews</Text>
            {PLATFORMS.filter(p => selected.includes(p.id) && results[p.id]).map(p => (
              <View key={p.id} style={s.previewCard}>
                <View style={s.previewHeader}>
                  <View style={s.previewHeaderLeft}>
                    <Text style={s.previewPlatformIcon}>{p.icon}</Text>
                    <Text style={s.previewPlatformName}>{p.label} Preview</Text>
                  </View>
                  <Text style={s.previewCharCount}>
                    {results[p.id].length}/{p.charLimit}
                  </Text>
                </View>
                <View style={s.previewBody}>
                  <Text style={s.previewText}>{results[p.id]}</Text>
                </View>
                <View style={s.previewFooter}>
                  <View style={s.previewEngagement}>
                    <Text style={s.engagementIcon}>💬</Text>
                    <Text style={s.engagementIcon}>🔄</Text>
                    <Text style={s.engagementIcon}>❤️</Text>
                    <Text style={s.engagementIcon}>↗</Text>
                  </View>
                  <TouchableOpacity
                    style={s.copyBtn}
                    onPress={() => copyContent(p.id, results[p.id])}
                    activeOpacity={0.7}
                  >
                    <Text style={s.copyBtnText}>
                      {copiedId === p.id ? '✓ Copied' : '📋 Copy Post'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {results?._error && (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{results._error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { icon: '✨', label: 'Generate', active: true },
          { icon: '🕐', label: 'Archive', active: false },
          { icon: '📋', label: 'Drafts', active: false },
          { icon: '⚙️', label: 'Engine', active: false },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={s.navItem}>
            <Text style={s.navIcon}>{tab.icon}</Text>
            <Text style={[s.navLabel, tab.active && s.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  headerBadge: {
    fontSize: 11, fontWeight: '600', color: C.amber,
    backgroundColor: C.amberGhost, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, overflow: 'hidden', letterSpacing: 1,
  },
  headerRight: { alignItems: 'flex-end' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase' },
  statusLoad: { fontSize: 9, color: C.amber, marginTop: 2 },

  scroll: { flex: 1 },

  integrityCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 14,
  },
  integrityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  integrityLabel: { fontSize: 13, fontWeight: '500', color: C.textMuted },
  integrityValue: { fontSize: 13, fontWeight: '700', color: C.amber },
  integrityBarBg: { height: 5, backgroundColor: '#1A1A24', borderRadius: 3, overflow: 'hidden' },
  integrityBarFill: { height: '100%', width: '100%', backgroundColor: C.amber, borderRadius: 3 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.textDim,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectedCount: { fontSize: 10, fontWeight: '700', color: C.amber },

  textareaWrap: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, overflow: 'hidden',
  },
  textarea: {
    minHeight: 140, padding: 16, color: C.text, fontSize: 14, lineHeight: 22,
  },
  textareaActions: {
    flexDirection: 'row', gap: 12, justifyContent: 'flex-end',
    paddingHorizontal: 12, paddingBottom: 10,
  },
  textareaIcon: { fontSize: 18, opacity: 0.5 },

  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformBtn: {
    width: '22%', flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard,
  },
  platformBtnActive: {
    borderWidth: 2, borderColor: C.amber, backgroundColor: C.amberGhost,
  },
  platformIcon: { fontSize: 22, marginBottom: 6 },
  platformLabel: { fontSize: 9, fontWeight: '700', color: C.textDim },
  platformLabelActive: { color: C.amber },

  generateBtn: {
    marginHorizontal: 16, marginTop: 24, paddingVertical: 16,
    backgroundColor: C.amber, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  generateBtnDisabled: { opacity: 0.4 },
  generateIcon: { fontSize: 18 },
  generateText: { fontSize: 14, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },

  previewCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, overflow: 'hidden', marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  previewHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewPlatformIcon: { fontSize: 14 },
  previewPlatformName: { fontSize: 12, fontWeight: '700', color: C.text },
  previewCharCount: { fontSize: 10, fontWeight: '600', color: C.textDim },
  previewBody: { padding: 16 },
  previewText: { fontSize: 14, lineHeight: 22, color: C.textSub },
  previewFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.amberGhost, borderTopWidth: 1, borderTopColor: C.borderGlow,
  },
  previewEngagement: { flexDirection: 'row', gap: 14 },
  engagementIcon: { fontSize: 14, opacity: 0.5 },
  copyBtn: {
    backgroundColor: C.amber, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
  },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: C.bg },

  errorCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16,
    backgroundColor: C.redGhost, borderWidth: 1, borderColor: '#EF444428',
    borderRadius: 14,
  },
  errorText: { fontSize: 13, color: C.red },

  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 10, paddingBottom: 6,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard,
  },
  navItem: { alignItems: 'center', gap: 3, paddingHorizontal: 12 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, fontWeight: '700', color: C.textGhost, textTransform: 'uppercase', letterSpacing: 0.8 },
  navLabelActive: { color: C.amber },
});
