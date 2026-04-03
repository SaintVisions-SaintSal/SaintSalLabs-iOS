import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Clipboard, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { generateSocial, publishToSocials } from '../../lib/api';
import { SALMark } from '../../components';
import { AuthContext } from '../../lib/AuthContext';

const TABS = [
  { id: 'social', label: 'Social' },
  { id: 'code', label: 'Code' },
  { id: 'images', label: 'Images' },
  { id: 'video', label: 'Video' },
];

const PLATFORM_CHIPS = [
  { id: 'facebook',       label: 'Facebook',        icon: '📘' },
  { id: 'instagram',      label: 'Instagram',        icon: '📸' },
  { id: 'linkedin',       label: 'LinkedIn',         icon: '💼' },
  { id: 'tiktok',         label: 'TikTok',           icon: '🎵' },
  { id: 'googlebusiness', label: 'Google Business',  icon: '📍' },
];

export default function SocialStudioScreen() {
  const router = useRouter();
  const { profile, session } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('social');
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState(['facebook', 'instagram']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(null); // { platformId, content }

  const togglePlatform = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || selected.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateSocial({ prompt: prompt.trim(), platforms: selected });
      setResult(data);
    } catch {
      setResult({ _error: 'Generation failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (platformId, text) => {
    Clipboard.setString(text);
    setCopiedId(platformId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRegenerate = () => {
    if (prompt.trim() && selected.length > 0) handleGenerate();
  };

  const doPublish = async (platformId, content, scheduleDate = null) => {
    setPublishingId(platformId);
    try {
      await publishToSocials({
        content,
        mediaUrls: [],
        platforms: [platformId],
        scheduleDate,
        ghl_location_id: profile?.ghl_location_id || '',
        accessToken: session?.access_token || '',
      });
      Alert.alert('', scheduleDate ? 'Scheduled in your GHL Social Calendar 🔥' : 'Published to your social accounts!');
    } catch (e) {
      Alert.alert('Publish Failed', e.message || 'Something went wrong. Try again.');
    } finally {
      setPublishingId(null);
      setPendingPublish(null);
    }
  };

  const handlePostNow = (platformId, content) => doPublish(platformId, content, null);

  const handleSchedule = (platformId, content) => {
    setPendingPublish({ platformId, content });
    setShowDatePicker(true);
  };

  const onDatePicked = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && pendingPublish) {
      doPublish(pendingPublish.platformId, pendingPublish.content, selectedDate.toISOString());
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Text style={s.headerBtnIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Social Studio</Text>
        <TouchableOpacity style={s.headerBtn}>
          <Text style={s.headerBtnIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tab, activeTab === tab.id && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* New Creation */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>New Creation</Text>
            <Text style={s.draftLabel}>Draft Saved</Text>
          </View>
          <View style={s.inputWrap}>
            <TextInput
              style={s.textarea}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="What is the post about? Describe your idea or paste a link..."
              placeholderTextColor={C.textGhost}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[s.inlineGenBtn, (!prompt.trim() || loading) && { opacity: 0.4 }]}
              onPress={handleGenerate}
              disabled={loading || !prompt.trim()}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <>
                  <Text style={s.inlineGenIcon}>✨</Text>
                  <Text style={s.inlineGenText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Chips */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Target Platforms</Text>
          <View style={s.chipRow}>
            {PLATFORM_CHIPS.map(p => {
              const active = selected.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => togglePlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.chipIcon}>{p.icon}</Text>
                  <Text style={[s.chipLabel, active && s.chipLabelActive]}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Generated Content */}
        {result && !result._error && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Generated Content</Text>
              <TouchableOpacity onPress={handleRegenerate} style={s.regenBtn}>
                <Text style={s.regenIcon}>🔄</Text>
                <Text style={s.regenText}>Regenerate</Text>
              </TouchableOpacity>
            </View>

            {PLATFORM_CHIPS.filter(p => selected.includes(p.id) && result[p.id]).map(p => (
              <View key={p.id} style={s.contentCard}>
                {/* Card Header */}
                <View style={s.cardHeader}>
                  <View style={s.cardHeaderLeft}>
                    <SALMark size={28} />
                    <View>
                      <Text style={s.cardAuthor}>SaintSal Labs</Text>
                      <Text style={s.cardHandle}>@saintsal_labs · Just now</Text>
                    </View>
                  </View>
                  <Text style={s.cardPlatformBadge}>{p.icon} {p.label}</Text>
                </View>

                {/* Card Body */}
                <View style={s.cardBody}>
                  <Text style={s.cardText}>{result[p.id]}</Text>
                </View>

                {/* Card Footer */}
                <View style={s.cardFooter}>
                  <TouchableOpacity
                    style={s.copyPostBtn}
                    onPress={() => handleCopy(p.id, result[p.id])}
                    activeOpacity={0.7}
                  >
                    <Text style={s.copyPostBtnText}>
                      {copiedId === p.id ? '✓ Copied' : '📋 Copy'}
                    </Text>
                  </TouchableOpacity>
                  <View style={s.cardActions}>
                    <TouchableOpacity
                      style={s.scheduleBtn}
                      onPress={() => handleSchedule(p.id, result[p.id])}
                      disabled={!!publishingId}
                      activeOpacity={0.7}
                    >
                      <Text style={s.scheduleBtnText}>🕐 Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.postNowBtn}
                      onPress={() => handlePostNow(p.id, result[p.id])}
                      disabled={!!publishingId}
                      activeOpacity={0.7}
                    >
                      {publishingId === p.id ? (
                        <ActivityIndicator size="small" color={C.bg} />
                      ) : (
                        <Text style={s.postNowBtnText}>🚀 Post Now</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {result?._error && (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{result._error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>Ready to Create</Text>
            <Text style={s.emptySubtitle}>
              Enter your idea above and select platforms to generate platform-native content
            </Text>
          </View>
        )}
      </ScrollView>

      {/* DateTimePicker for scheduling */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={onDatePicked}
        />
      )}

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { icon: '⬠', label: 'Studio', active: true },
          { icon: '📂', label: 'Library', active: false },
          { icon: '📊', label: 'Analytics', active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={s.navItem}>
            <Text style={[s.navIcon, tab.active && s.navIconActive]}>{tab.icon}</Text>
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
    borderBottomWidth: 1, borderBottomColor: C.borderGlow,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 18, color: C.amber },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },

  tabBar: { borderBottomWidth: 1, borderBottomColor: C.borderGlow },
  tabContent: { paddingHorizontal: 16, gap: 24 },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.amber },
  tabText: { fontSize: 14, fontWeight: '700', color: C.textDim },
  tabTextActive: { color: C.amber },

  scroll: { flex: 1 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.text,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },
  draftLabel: { fontSize: 11, fontWeight: '500', color: C.amber },

  inputWrap: {
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 14, overflow: 'hidden',
  },
  textarea: {
    minHeight: 120, padding: 16, color: C.text, fontSize: 14, lineHeight: 22,
  },
  inlineGenBtn: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.amber, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  inlineGenIcon: { fontSize: 12 },
  inlineGenText: { fontSize: 11, fontWeight: '700', color: C.bg },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    borderWidth: 1, borderColor: C.borderGlow, backgroundColor: C.amberGhost,
  },
  chipActive: { borderColor: C.amber, backgroundColor: C.amber + '22' },
  chipIcon: { fontSize: 13 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: C.textDim },
  chipLabelActive: { color: C.amber },

  regenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regenIcon: { fontSize: 12 },
  regenText: { fontSize: 12, fontWeight: '500', color: C.amber },

  contentCard: {
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 14, overflow: 'hidden', marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: C.borderGlow,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardAuthor: { fontSize: 12, fontWeight: '700', color: C.text },
  cardHandle: { fontSize: 10, color: C.textGhost },
  cardPlatformBadge: { fontSize: 10, fontWeight: '600', color: C.textMuted },
  cardBody: { padding: 18 },
  cardText: { fontSize: 14, lineHeight: 22, color: C.textSub },
  cardFooter: {
    padding: 12, borderTopWidth: 1, borderTopColor: C.borderGlow,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.amberGhost,
  },
  cardEngagement: { flexDirection: 'row', gap: 14 },
  engageIcon: { fontSize: 14, opacity: 0.5 },
  cardActions: { flexDirection: 'row', gap: 8 },
  scheduleBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  scheduleBtnText: { fontSize: 10, fontWeight: '600', color: C.textMuted },
  copyPostBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  copyPostBtnText: { fontSize: 10, fontWeight: '600', color: C.textMuted },
  postNowBtn: {
    backgroundColor: C.amber, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    minWidth: 80, alignItems: 'center',
  },
  postNowBtnText: { fontSize: 10, fontWeight: '700', color: C.bg },

  errorCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16,
    backgroundColor: C.redGhost, borderWidth: 1, borderColor: '#EF444428', borderRadius: 14,
  },
  errorText: { fontSize: 13, color: C.red },

  emptyState: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: C.textDim, textAlign: 'center', lineHeight: 20 },

  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 10, paddingBottom: 6,
    borderTopWidth: 1, borderTopColor: C.borderGlow, backgroundColor: C.bg,
  },
  navItem: { alignItems: 'center', gap: 3, paddingHorizontal: 12 },
  navIcon: { fontSize: 20, opacity: 0.4 },
  navIconActive: { opacity: 1 },
  navLabel: { fontSize: 9, fontWeight: '700', color: C.textGhost, textTransform: 'uppercase', letterSpacing: 0.5 },
  navLabelActive: { color: C.amber },
});
