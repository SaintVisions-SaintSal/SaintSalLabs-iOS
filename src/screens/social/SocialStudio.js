/* ═══════════════════════════════════════════════════
   SOCIAL STUDIO — Tab 4 (Build #68)
   AI-powered social media post creator
   SAL generates platform-optimized content
   Select platforms → schedule → post
═══════════════════════════════════════════════════ */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateSocial, generateSocialServer, postToTwitter, postToLinkedIn } from '../../lib/api';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD = '#141416';

const PLATFORMS = [
  { id: 'twitter',   icon: '𝕏',  label: 'X / Twitter',   color: '#000' },
  { id: 'linkedin',  icon: '💼', label: 'LinkedIn',       color: '#0A66C2' },
  { id: 'instagram', icon: '📸', label: 'Instagram',      color: '#E4405F' },
  { id: 'tiktok',    icon: '🎵', label: 'TikTok',         color: '#000' },
  { id: 'facebook',  icon: '📘', label: 'Facebook',       color: '#1877F2' },
  { id: 'threads',   icon: '🧵', label: 'Threads',        color: '#000' },
];

export default function SocialStudio() {
  const insets = useSafeAreaInsets();
  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState({ twitter: true, linkedin: true });
  const [generatedPosts, setGeneratedPosts] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activePlatforms = Object.keys(selectedPlatforms).filter(k => selectedPlatforms[k]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || activePlatforms.length === 0) {
      Alert.alert('Missing info', 'Enter a topic and select at least one platform.');
      return;
    }
    setGenerating(true);
    setGeneratedPosts(null);

    try {
      const result = await generateSocial({ prompt: topic.trim(), platforms: activePlatforms });
      setGeneratedPosts(result);
    } catch (e) {
      console.warn('[Social] Gen error:', e);
      // Fallback to server-side generation
      try {
        const result = await generateSocialServer({ prompt: topic.trim(), platforms: activePlatforms, tone: 'professional' });
        if (result.posts) setGeneratedPosts(result.posts);
        else Alert.alert('Error', 'Failed to generate posts. Please try again.');
      } catch {
        Alert.alert('Error', 'Failed to generate posts. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [topic, activePlatforms]);

  const handlePost = useCallback(async () => {
    if (!generatedPosts) return;
    setPosting(true);

    const results = [];
    for (const platform of activePlatforms) {
      const content = generatedPosts[platform];
      if (!content) continue;

      try {
        if (platform === 'twitter') {
          await postToTwitter({ content });
          results.push({ platform, success: true });
        } else if (platform === 'linkedin') {
          // Would need stored access_token
          results.push({ platform, success: false, error: 'Connect LinkedIn first' });
        } else {
          results.push({ platform, success: false, error: 'Coming soon' });
        }
      } catch (e) {
        results.push({ platform, success: false, error: e.message });
      }
    }

    setPosting(false);
    const successes = results.filter(r => r.success).length;
    Alert.alert(
      successes > 0 ? 'Posted!' : 'Error',
      successes > 0
        ? `Posted to ${successes} platform${successes > 1 ? 's' : ''}`
        : 'Could not post. Check platform connections.'
    );
  }, [generatedPosts, activePlatforms]);

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Social Studio</Text>
          <Text style={s.headerSub}>AI-powered content creation</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Topic Input */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>WHAT DO YOU WANT TO POST ABOUT?</Text>
            <TextInput
              style={s.topicInput}
              placeholder="e.g. Our new AI platform launch..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={topic}
              onChangeText={setTopic}
              multiline
              maxLength={500}
            />
          </View>

          {/* Platform Selection */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>PLATFORMS</Text>
            <View style={s.platformGrid}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.platformCard, selectedPlatforms[p.id] && s.platformCardActive]}
                  onPress={() => togglePlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>{p.icon}</Text>
                  <Text style={[s.platformLabel, selectedPlatforms[p.id] && { color: GOLD }]}>{p.label}</Text>
                  {selectedPlatforms[p.id] && (
                    <View style={s.platformCheck}>
                      <Text style={{ color: BG, fontSize: 10, fontWeight: '800' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[s.generateBtn, (!topic.trim() || activePlatforms.length === 0) && { opacity: 0.4 }]}
            onPress={handleGenerate}
            disabled={!topic.trim() || activePlatforms.length === 0 || generating}
          >
            {generating ? (
              <ActivityIndicator color={BG} />
            ) : (
              <Text style={s.generateBtnText}>✨ Generate with SAL</Text>
            )}
          </TouchableOpacity>

          {/* Generated Posts Preview */}
          {generatedPosts && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>GENERATED POSTS</Text>
              {activePlatforms.map((platform) => {
                const content = generatedPosts[platform];
                if (!content) return null;
                const pConfig = PLATFORMS.find(p => p.id === platform);

                return (
                  <View key={platform} style={s.postCard}>
                    <View style={s.postHeader}>
                      <Text style={{ fontSize: 18 }}>{pConfig?.icon}</Text>
                      <Text style={s.postPlatform}>{pConfig?.label}</Text>
                      <TouchableOpacity onPress={() => setEditingPlatform(platform === editingPlatform ? null : platform)}>
                        <Text style={s.editBtn}>{editingPlatform === platform ? 'Done' : 'Edit'}</Text>
                      </TouchableOpacity>
                    </View>
                    {editingPlatform === platform ? (
                      <TextInput
                        style={s.postEditInput}
                        value={content}
                        onChangeText={(text) => setGeneratedPosts(prev => ({ ...prev, [platform]: text }))}
                        multiline
                      />
                    ) : (
                      <Text style={s.postContent}>{content}</Text>
                    )}
                    <Text style={s.charCount}>{content.length} chars</Text>
                  </View>
                );
              })}

              {/* Post Button */}
              <TouchableOpacity style={s.postBtn} onPress={handlePost} disabled={posting}>
                {posting ? (
                  <ActivityIndicator color={BG} />
                ) : (
                  <Text style={s.postBtnText}>Post Now</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 12 },

  topicInput: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, color: '#fff', fontSize: 15,
    minHeight: 80, textAlignVertical: 'top',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },

  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard: {
    width: '31%', backgroundColor: CARD, borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', position: 'relative',
  },
  platformCardActive: { borderColor: GOLD, backgroundColor: 'rgba(212,175,55,0.08)' },
  platformLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 6, textAlign: 'center' },
  platformCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },

  generateBtn: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16,
    marginHorizontal: 20, marginTop: 24, alignItems: 'center',
  },
  generateBtnText: { fontSize: 16, fontWeight: '800', color: BG },

  postCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  postPlatform: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 },
  editBtn: { fontSize: 12, fontWeight: '600', color: GOLD },
  postContent: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  postEditInput: {
    color: '#fff', fontSize: 14, lineHeight: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10,
    minHeight: 60,
  },
  charCount: { fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8, textAlign: 'right' },

  postBtn: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  postBtnText: { fontSize: 16, fontWeight: '800', color: BG },
});
