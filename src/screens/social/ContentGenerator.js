import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';
import { mcpChat } from '../../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';
// MCP gateway handles all AI routing (Build #70)
const OPENAI_API_KEY =
  '';
const RUNWAY_API_KEY =
  '';
const ELEVENLABS_API_KEY = '';

const CONTENT_TYPES = [
  { id: 'post', label: 'Post', icon: '📝' },
  { id: 'reel', label: 'Reel', icon: '🎬' },
  { id: 'story', label: 'Story', icon: '⭕' },
  { id: 'article', label: 'Article', icon: '📰' },
];

const PLATFORMS = [
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'discord', label: 'Discord', icon: 'DC' },
  { id: 'threads', label: 'Threads', icon: '@' },
  { id: 'tiktok', label: 'TikTok', icon: '♪' },
];

const TONE_OPTIONS = ['Professional', 'Casual', 'Bold', 'Inspirational', 'Humorous'];

export default function ContentGenerator({ navigation }) {
  const [contentType, setContentType] = useState('post');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'instagram']);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [voiceReady, setVoiceReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);
  const [systemIntegrity] = useState(100);

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const generateCopy = useCallback(async () => {
    if (!topic.trim()) {
      Alert.alert('Topic Required', 'Enter a topic or core message to generate content.');
      return;
    }
    setGenerating(true);
    setGeneratedContent(null);
    setImageUrl(null);
    setVoiceReady(false);
    try {
      const platformList = selectedPlatforms.join(', ');
      const systemPrompt = `You are an elite social media content strategist for SaintSal Labs. Generate ${contentType} content optimized for ${platformList}. Tone: ${tone}. Return a JSON object with keys for each platform requested, each containing: "copy" (the post text), "hashtags" (array of 5 relevant hashtags), "cta" (call to action). Keep copy platform-appropriate (Twitter: under 280 chars, LinkedIn: professional, Instagram: engaging with emojis).`;

      const mcpRes = await mcpChat({
        message: `${systemPrompt}\n\nTopic: "${topic}"\n\nGenerate content. Return raw JSON only, no markdown.`,
        model: 'pro',
        vertical: 'general',
      });
      const rawText = mcpRes.response || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // fallback: create basic structure
        parsed = {};
        selectedPlatforms.forEach((p) => {
          parsed[p] = {
            copy: rawText.slice(0, 200),
            hashtags: ['#SaintSal', '#AI', '#Innovation'],
            cta: 'Learn more at saintsal.ai',
          };
        });
      }
      setGeneratedContent(parsed);
    } catch (err) {
      Alert.alert('Generation Failed', 'Unable to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [topic, tone, contentType, selectedPlatforms]);

  const generateImage = useCallback(async () => {
    if (!topic.trim()) return;
    setGeneratingImage(true);
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${tone} social media visual for: ${topic}. Dark luxury aesthetic with gold accents. Premium quality, suitable for ${selectedPlatforms[0] || 'social media'}.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      });
      const data = await res.json();
      if (data?.data?.[0]?.url) {
        setImageUrl(data.data[0].url);
      } else {
        Alert.alert('Image Failed', 'Could not generate image.');
      }
    } catch {
      Alert.alert('Error', 'Image generation failed.');
    } finally {
      setGeneratingImage(false);
    }
  }, [topic, tone, selectedPlatforms]);

  const generateVoice = useCallback(async () => {
    if (!generatedContent) return;
    const firstPlatform = selectedPlatforms[0];
    const copy = generatedContent[firstPlatform]?.copy;
    if (!copy) return;
    setGeneratingVoice(true);
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: copy,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (res.ok) {
        setVoiceReady(true);
        Alert.alert('Voice Ready', 'Voice-over generated successfully.');
      } else {
        Alert.alert('Voice Failed', 'Could not generate voice-over.');
      }
    } catch {
      Alert.alert('Error', 'Voice generation failed.');
    } finally {
      setGeneratingVoice(false);
    }
  }, [generatedContent, selectedPlatforms]);

  const saveToSupabase = async () => {
    if (!generatedContent) return;
    setSaving(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/generated_content`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          content_type: contentType,
          platforms: selectedPlatforms,
          tone,
          content: generatedContent,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        }),
      });
      Alert.alert('Saved', 'Content saved to your library.');
    } catch {
      Alert.alert('Error', 'Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Content Generator" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              SaintSal <Text style={styles.headerAI}>AI</Text>
            </Text>
          </View>
        </View>
        <View style={styles.headerStatus}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>NEURAL ENGINE</Text>
          </View>
          <Text style={styles.statusLoad}>Load: 24%</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* System Integrity Bar */}
        <View style={styles.integrityCard}>
          <View style={styles.integrityRow}>
            <Text style={styles.integrityLabel}>System Integrity</Text>
            <Text style={styles.integrityValue}>{systemIntegrity}%</Text>
          </View>
          <View style={styles.integrityBar}>
            <View style={[styles.integrityFill, { width: `${systemIntegrity}%` }]} />
          </View>
        </View>

        {/* Content Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTENT TYPE</Text>
          <View style={styles.contentTypeRow}>
            {CONTENT_TYPES.map((ct) => (
              <TouchableOpacity
                key={ct.id}
                style={[styles.contentTypeBtn, contentType === ct.id && styles.contentTypeBtnActive]}
                onPress={() => setContentType(ct.id)}
              >
                <Text style={styles.contentTypeIcon}>{ct.icon}</Text>
                <Text
                  style={[styles.contentTypeLabel, contentType === ct.id && styles.contentTypeLabelActive]}
                >
                  {ct.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topic Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>POST CONTENT</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="What's the core message of your post? SaintSal will handle the formatting and tone for each platform..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.inputActionBtn}>
                <Text style={styles.inputActionIcon}>🎤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputActionBtn}>
                <Text style={styles.inputActionIcon}>📎</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tone Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TONE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.toneRow}>
              {TONE_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toneBtn, tone === t && styles.toneBtnActive]}
                  onPress={() => setTone(t)}
                >
                  <Text style={[styles.toneBtnText, tone === t && styles.toneBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Platform Selector */}
        <View style={styles.section}>
          <View style={styles.platformHeaderRow}>
            <Text style={styles.sectionLabel}>TARGET PLATFORMS</Text>
            <Text style={styles.selectedCount}>{selectedPlatforms.length} SELECTED</Text>
          </View>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.platformBtn, selectedPlatforms.includes(p.id) && styles.platformBtnActive]}
                onPress={() => togglePlatform(p.id)}
              >
                <Text style={styles.platformIcon}>{p.icon}</Text>
                <Text
                  style={[styles.platformLabel, selectedPlatforms.includes(p.id) && styles.platformLabelActive]}
                >
                  {p.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.platformBtnMore}>
              <Text style={styles.platformBtnMoreText}>+</Text>
              <Text style={styles.platformLabel}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={generateCopy}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={styles.generateBtnText}>✦ GENERATE CONTENT</Text>
          )}
        </TouchableOpacity>

        {/* Generated Previews */}
        {generatedContent && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LIVE PREVIEWS</Text>

            {selectedPlatforms.map((pid) => {
              const plat = PLATFORMS.find((p) => p.id === pid);
              const content = generatedContent[pid];
              if (!plat || !content) return null;
              return (
                <View key={pid} style={styles.previewCard}>
                  <View style={styles.previewCardHeader}>
                    <View style={styles.previewCardHeaderLeft}>
                      <Text style={styles.previewCardIcon}>{plat.icon}</Text>
                      <Text style={styles.previewCardTitle}>{plat.label} Preview</Text>
                    </View>
                    <TouchableOpacity onPress={() => setPreviewModal({ pid, plat, content })}>
                      <Text style={styles.previewEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  {pid === 'instagram' && imageUrl ? (
                    <View style={styles.previewImageContainer}>
                      <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                    </View>
                  ) : null}
                  <Text style={styles.previewCopy}>{content.copy}</Text>
                  {content.hashtags && (
                    <Text style={styles.previewHashtags}>{content.hashtags.join(' ')}</Text>
                  )}
                  {content.cta && (
                    <View style={styles.previewCTARow}>
                      <Text style={styles.previewCTALabel}>CTA: </Text>
                      <Text style={styles.previewCTA}>{content.cta}</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Media Generation Tools */}
            <View style={styles.mediaToolsRow}>
              <TouchableOpacity
                style={[styles.mediaToolBtn, generatingImage && styles.mediaToolBtnDisabled]}
                onPress={generateImage}
                disabled={generatingImage}
              >
                {generatingImage ? (
                  <ActivityIndicator color={C.gold} size="small" />
                ) : (
                  <>
                    <Text style={styles.mediaToolIcon}>🖼</Text>
                    <Text style={styles.mediaToolText}>Generate Image</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mediaToolBtn, generatingVoice && styles.mediaToolBtnDisabled]}
                onPress={generateVoice}
                disabled={generatingVoice || !generatedContent}
              >
                {generatingVoice ? (
                  <ActivityIndicator color={C.gold} size="small" />
                ) : (
                  <>
                    <Text style={styles.mediaToolIcon}>{voiceReady ? '🔊' : '🎙'}</Text>
                    <Text style={styles.mediaToolText}>{voiceReady ? 'Voice Ready' : 'Generate Voice'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Image Preview */}
            {imageUrl && (
              <View style={styles.imagePreviewSection}>
                <Text style={styles.imagePreviewLabel}>GENERATED IMAGE</Text>
                <Image source={{ uri: imageUrl }} style={styles.generatedImage} resizeMode="cover" />
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={saveToSupabase}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={C.gold} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>SAVE TO LIBRARY</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Discord Preview (always visible as template) */}
        {!generatedContent && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LIVE PREVIEWS</Text>
            <View style={styles.discordPreviewCard}>
              <View style={styles.discordPreviewHeader}>
                <Text style={styles.discordPreviewIcon}>DC</Text>
                <Text style={styles.discordPreviewTitle}>Discord Embed</Text>
              </View>
              <View style={styles.discordEmbedBody}>
                <View style={styles.discordAccentBar} />
                <View style={styles.discordEmbedContent}>
                  <Text style={styles.discordEmbedTitle}>System Update: SaintSal AI</Text>
                  <Text style={styles.discordEmbedText}>
                    The neural core has been synchronized. All creators now have access to the multi-platform expansion pack.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Preview Edit Modal */}
      <Modal visible={!!previewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{previewModal?.plat?.label} Content</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalCopyText}>{previewModal?.content?.copy}</Text>
              {previewModal?.content?.hashtags && (
                <Text style={styles.modalHashtags}>
                  {previewModal?.content?.hashtags?.join(' ')}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setPreviewModal(null)}>
              <Text style={styles.modalCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C24',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.gold,
    fontWeight: '900',
    fontSize: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  headerAI: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: C.gold + '20',
  },
  headerStatus: {
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusLoad: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 0,
  },
  integrityCard: {
    backgroundColor: C.gold + '08',
    borderWidth: 1,
    borderColor: C.gold + '15',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  integrityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  integrityLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
  },
  integrityValue: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  integrityBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  integrityFill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  contentTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contentTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: C.bgCard,
    alignItems: 'center',
    gap: 4,
  },
  contentTypeBtnActive: {
    borderColor: C.gold,
    backgroundColor: C.gold + '18',
  },
  contentTypeIcon: {
    fontSize: 20,
  },
  contentTypeLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '700',
  },
  contentTypeLabelActive: {
    color: C.gold,
  },
  inputContainer: {
    position: 'relative',
  },
  topicInput: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 140,
    paddingBottom: 48,
  },
  inputActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  inputActionBtn: {
    padding: 6,
  },
  inputActionIcon: {
    fontSize: 18,
  },
  toneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: C.bgCard,
  },
  toneBtnActive: {
    backgroundColor: C.gold + '20',
    borderColor: C.gold + '60',
  },
  toneBtnText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '600',
  },
  toneBtnTextActive: {
    color: C.gold,
    fontWeight: '700',
  },
  platformHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCount: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  platformBtn: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  platformBtnActive: {
    borderWidth: 2,
    borderColor: C.gold,
    backgroundColor: C.gold + '18',
  },
  platformBtnMore: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  platformBtnMoreText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 22,
    fontWeight: '300',
  },
  platformIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  platformLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  platformLabelActive: {
    color: C.gold,
  },
  generateBtn: {
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 2,
  },
  previewCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C24',
  },
  previewCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewCardIcon: {
    fontSize: 14,
    color: C.gold,
  },
  previewCardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewEditText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  previewImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCopy: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    padding: 14,
  },
  previewHashtags: {
    color: C.gold,
    fontSize: 12,
    paddingHorizontal: 14,
    paddingBottom: 10,
    lineHeight: 18,
  },
  previewCTARow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  previewCTALabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
  },
  previewCTA: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  mediaToolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  mediaToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '30',
  },
  mediaToolBtnDisabled: {
    opacity: 0.6,
  },
  mediaToolIcon: {
    fontSize: 16,
  },
  mediaToolText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  imagePreviewSection: {
    marginBottom: 14,
    gap: 8,
  },
  imagePreviewLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  generatedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
  },
  saveBtn: {
    borderWidth: 1,
    borderColor: C.gold + '40',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: C.gold,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
  },
  discordPreviewCard: {
    backgroundColor: '#2B2D31',
    borderWidth: 1,
    borderColor: '#3A3C42',
    borderRadius: 14,
    overflow: 'hidden',
  },
  discordPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1F22',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  discordPreviewIcon: {
    color: '#5865F2',
    fontWeight: '800',
    fontSize: 12,
  },
  discordPreviewTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  discordEmbedBody: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  discordAccentBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: C.gold,
  },
  discordEmbedContent: {
    flex: 1,
    gap: 6,
  },
  discordEmbedTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  discordEmbedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: C.gold + '30',
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalCopyText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
  },
  modalHashtags: {
    color: C.gold,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
  },
});
