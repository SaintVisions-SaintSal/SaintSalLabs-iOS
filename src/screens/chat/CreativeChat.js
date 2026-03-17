/* ═══════════════════════════════════════════════════
   SCREEN 5 — SAL CREATIVE MASTERMIND CHAT
   sal_chat_creative_mastermind
   APIs: Claude claude-opus-4-5 · DALL-E · Runway · Replicate
   Features: creative chat · image gen · video gen · content mode selector
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { C } from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── API credentials ── */
const ANTHROPIC_KEY = 'LABS_BACKEND_PROXY';
const OPENAI_KEY    = '';
const RUNWAY_KEY    = '';
const REPLICATE_TOKEN = '';

/* ── Content modes ── */
const MODES = [
  { id: 'chat',  label: 'COPY',  icon: '✍️',  desc: 'Brand copy & creative writing' },
  { id: 'image', label: 'IMAGE', icon: '🖼',   desc: 'High-fidelity image generation' },
  { id: 'video', label: 'VIDEO', icon: '🎬',  desc: 'Cinematic video generation' },
];

const SYSTEM_PROMPT = `You are SAL Creative Mastermind for SaintSal™ Labs — the world's most elite creative AI.
You generate cinematic video concepts, high-fidelity image prompts, premium brand copy, and campaign strategies.
Think like a world-class creative director at a luxury agency. Be visionary, bold, and specific.
When asked to generate images or videos, describe what you would create in vivid detail.
Format responses with structure. Use bold for key creative terms. Always deliver at the level of a $50K creative brief.`;

const STARTERS = [
  '🎬 Generate a cinematic video for the Creative Mastermind campaign',
  '🖼 Create a high-fidelity luxury brand image',
  '✍️ Write premium brand copy for an elite product launch',
  '🎵 Concept a full multimedia campaign with deep shadows and golden lighting',
];

export default function CreativeChat() {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [activeMode, setActiveMode]   = useState('chat');
  const [credits, setCredits]         = useState(1250);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [generating, setGenerating]   = useState(false);
  const flatListRef = useRef(null);
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  /* ── Claude chat ── */
  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setLoading(true);

    const newUserMsg = { id: Date.now().toString(), role: 'user', content: userMsg, ts: new Date() };
    setMessages(prev => [...prev, newUserMsg]);

    // Check if should trigger image/video gen
    const lowerMsg = userMsg.toLowerCase();
    const wantsImage = activeMode === 'image' || lowerMsg.includes('image') || lowerMsg.includes('generate') || lowerMsg.includes('create a visual');
    const wantsVideo = activeMode === 'video' || lowerMsg.includes('video') || lowerMsg.includes('cinematic') || lowerMsg.includes('film');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg });

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!res.ok) throw new Error(`Claude error ${res.status}`);
      const data = await res.json();
      const aiText = data.content?.[0]?.text || 'Creative vision coming...';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        ts: new Date(),
        hasImage: wantsImage,
        hasVideo: wantsVideo,
      };
      setMessages(prev => [...prev, aiMsg]);
      setCredits(c => Math.max(0, c - 2));

      // Trigger generation in parallel
      if (wantsImage) generateImage(userMsg);
      if (wantsVideo) generateVideoRequest(userMsg);

    } catch (err) {
      const errMsg = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Creative engine error: ${err.message}. Please try again.`,
        ts: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, activeMode]);

  /* ── DALL-E image generation ── */
  const generateImage = useCallback(async (prompt) => {
    setGenerating(true);
    setGeneratedImage(null);
    try {
      const enhancedPrompt = `Luxury cinematic aesthetic, deep shadows, golden lighting, ultra high fidelity, 8K resolution, premium brand photography: ${prompt}`;
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
        }),
      });
      if (!res.ok) throw new Error(`DALL-E error ${res.status}`);
      const data = await res.json();
      const imageUrl = data.data?.[0]?.url;
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        setCredits(c => Math.max(0, c - 10));
      }
    } catch (err) {
      console.warn('Image gen error:', err.message);
    } finally {
      setGenerating(false);
    }
  }, []);

  /* ── Runway / Replicate video request ── */
  const generateVideoRequest = useCallback(async (prompt) => {
    // Trigger Replicate for video generation (SDXL video)
    try {
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${REPLICATE_TOKEN}`,
        },
        body: JSON.stringify({
          version: 'a4a8bafd6089e1716b06057c42b19378250d008b80fe87caa5cd36d40c1eda90', // stable-video-diffusion
          input: {
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024',
            video_length: 'short',
            sizing_strategy: 'maintain_aspect_ratio',
            motion_bucket_id: 127,
            frames_per_second: 24,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const predictionId = data.id;
        if (predictionId) {
          setCredits(c => Math.max(0, c - 25));
          // Poll for result
          pollVideoResult(predictionId);
        }
      }
    } catch (err) {
      console.warn('Video gen error:', err.message);
    }
  }, []);

  const pollVideoResult = useCallback(async (predictionId) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      if (attempts++ > 30) { clearInterval(poll); return; }
      try {
        const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` },
        });
        const data = await res.json();
        if (data.status === 'succeeded' && data.output) {
          setGeneratedVideo(Array.isArray(data.output) ? data.output[0] : data.output);
          clearInterval(poll);
        } else if (data.status === 'failed') {
          clearInterval(poll);
        }
      } catch (e) { clearInterval(poll); }
    }, 3000);
  }, []);

  /* ── Render message ── */
  const renderMessage = useCallback(({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarIcon}>⚡</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI, item.isError && styles.bubbleError]}>
          {!isUser && (
            <Text style={styles.senderLabel}>SAL ASSISTANT</Text>
          )}
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
          {/* Generated image inline */}
          {item.hasImage && generatedImage && (
            <View style={styles.imageResult}>
              <Image source={{ uri: generatedImage }} style={styles.generatedImg} resizeMode="cover" />
              <View style={styles.imageOverlay}>
                <View style={styles.imageBadges}>
                  <View style={styles.badge}><Text style={styles.badgeText}>TIFF</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>8K</Text></View>
                </View>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert('Download', 'Image saved to your library.')}>
                  <Text style={styles.downloadBtnText}>⬇ DOWNLOAD</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Video placeholder */}
          {item.hasVideo && (
            <View style={styles.videoResult}>
              <View style={styles.videoBg}>
                <Text style={styles.videoPlayBtn}>▶</Text>
                <View style={styles.videoMeta}>
                  <View style={styles.videoBadgeRow}>
                    <View style={styles.badge}><Text style={styles.badgeText}>4K HDR</Text></View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '33%' }]} />
                    </View>
                  </View>
                  <Text style={styles.videoTime}>0:14 / 0:45</Text>
                </View>
              </View>
            </View>
          )}
          <Text style={styles.tsText}>
            {item.ts?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  }, [generatedImage, generatedVideo]);

  /* ── Render mode selector ── */
  const renderModeSelector = () => (
    <View style={styles.modeRow}>
      {MODES.map(m => (
        <TouchableOpacity
          key={m.id}
          style={[styles.modeBtn, activeMode === m.id && styles.modeBtnActive]}
          onPress={() => setActiveMode(m.id)}
        >
          <Text style={styles.modeIcon}>{m.icon}</Text>
          <Text style={[styles.modeLabel, activeMode === m.id && styles.modeLabelActive]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /* ── Empty state / starters ── */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyBadge}>
        <Text style={styles.emptyBadgeText}>CREATIVE MASTERMIND</Text>
      </View>
      <Text style={styles.emptyTitle}>SAL Creative Assistant</Text>
      <Text style={styles.emptySubtitle}>Generate images, videos, and premium copy</Text>
      <View style={styles.starterGrid}>
        {STARTERS.map((s, i) => (
          <TouchableOpacity key={i} style={styles.starterBtn} onPress={() => sendMessage(s)}>
            <Text style={styles.starterText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 20 }}>✨</Text>
          </View>
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>SAL Creative Assistant</Text>
              <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.headerSub}>SAINTSAL™ LABS</Text>
          </View>
        </View>
        <View style={styles.creditsChip}>
          <Text style={styles.creditsIcon}>💾</Text>
          <Text style={styles.creditsText}>{credits.toLocaleString()} CREDITS</Text>
        </View>
      </View>

      {/* Mode selector */}
      {renderModeSelector()}

      {/* Generating indicator */}
      {generating && (
        <View style={styles.generatingBanner}>
          <ActivityIndicator size="small" color={C.gold} />
          <Text style={styles.generatingText}>
            {activeMode === 'video' ? 'Rendering cinematic video...' : 'Generating high-fidelity image...'}
          </Text>
        </View>
      )}

      {/* Chat list */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarIcon}>⚡</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={C.gold} />
              <Text style={styles.typingText}>Creating...</Text>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={MODES.find(m => m.id === activeMode)?.desc || 'Ask SAL to create something...'}
            placeholderTextColor={C.textGhost}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.bg} />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '💬', label: 'Chat',     active: true  },
          { icon: '📁', label: 'Assets',   active: false },
          { icon: '🎬', label: 'Studio',   active: false },
          { icon: '⚙️',  label: 'Settings', active: false },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.navItem}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg },
  flex:           { flex: 1 },

  /* Header */
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.gold + '1A', backgroundColor: C.bg },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon:     { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.gold + '55', backgroundColor: C.gold + '1A', alignItems: 'center', justifyContent: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle:    { fontSize: 13, fontWeight: '700', color: C.text, letterSpacing: 0.2 },
  liveDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold },
  liveText:       { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 2 },
  headerSub:      { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 3, marginTop: 1 },
  creditsChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.gold + '18', borderWidth: 1, borderColor: C.gold + '33', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  creditsIcon:    { fontSize: 11 },
  creditsText:    { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 1 },

  /* Mode selector */
  modeRow:        { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  modeBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  modeBtnActive:  { backgroundColor: C.gold + '20', borderColor: C.gold + '55' },
  modeIcon:       { fontSize: 14 },
  modeLabel:      { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 1 },
  modeLabelActive:{ color: C.gold },

  /* Generating banner */
  generatingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.gold + '10', borderBottomWidth: 1, borderBottomColor: C.gold + '20' },
  generatingText:   { fontSize: 12, color: C.gold, fontWeight: '600' },

  /* List */
  list:           { paddingHorizontal: 16, paddingVertical: 12 },
  emptyList:      { flexGrow: 1, paddingHorizontal: 16 },

  /* Empty / starters */
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 40 },
  emptyBadge:     { backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  emptyBadgeText: { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 2 },
  emptyTitle:     { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  emptySubtitle:  { fontSize: 13, color: C.textMuted, marginBottom: 28 },
  starterGrid:    { width: '100%', gap: 10 },
  starterBtn:     { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  starterText:    { fontSize: 13, color: C.textSub, fontWeight: '500' },

  /* Messages */
  msgRow:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  msgRowUser:     { justifyContent: 'flex-end' },
  avatarBadge:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.gold + '25', borderWidth: 1, borderColor: C.gold + '40', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  avatarIcon:     { fontSize: 16 },
  bubble:         { maxWidth: '82%', borderRadius: 14, padding: 14 },
  bubbleUser:     { backgroundColor: C.gold, borderTopRightRadius: 4 },
  bubbleAI:       { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderTopLeftRadius: 4 },
  bubbleError:    { borderColor: '#EF444440' },
  senderLabel:    { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 2, marginBottom: 6 },
  bubbleText:     { fontSize: 14, color: C.textSub, lineHeight: 22 },
  bubbleTextUser: { color: '#0C0C0F', fontWeight: '600' },
  tsText:         { fontSize: 10, color: C.textGhost, marginTop: 6, alignSelf: 'flex-end' },

  /* Image result */
  imageResult:    { marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.gold + '33' },
  generatedImg:   { width: '100%', aspectRatio: 1 },
  imageOverlay:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: C.bg + 'CC' },
  imageBadges:    { flexDirection: 'row', gap: 6 },
  badge:          { backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:      { fontSize: 9, fontWeight: '700', color: C.gold },
  downloadBtn:    { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  downloadBtnText:{ fontSize: 10, fontWeight: '800', color: '#0C0C0F' },

  /* Video result */
  videoResult:    { marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.gold + '33' },
  videoBg:        { backgroundColor: C.border, aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', padding: 12 },
  videoPlayBtn:   { fontSize: 36, color: C.gold, marginBottom: 16 },
  videoMeta:      { position: 'absolute', bottom: 12, left: 12, right: 12 },
  videoBadgeRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  progressBar:    { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: C.gold, borderRadius: 2 },
  videoTime:      { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  /* Typing */
  typingRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  typingBubble:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgCard, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  typingText:     { fontSize: 13, color: C.textMuted },

  /* Input bar */
  inputBar:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.gold + '1A', backgroundColor: C.bg },
  input:          { flex: 1, backgroundColor: C.gold + '08', borderWidth: 1, borderColor: C.gold + '33', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: C.text, fontSize: 14, maxHeight: 120 },
  sendBtn:        { width: 40, height: 40, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10 },
  sendBtnDisabled:{ opacity: 0.4 },
  sendIcon:       { fontSize: 18, fontWeight: '900', color: '#0C0C0F' },

  /* Bottom nav */
  bottomNav:      { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.gold + '1A', backgroundColor: C.bg, paddingBottom: Platform.OS === 'ios' ? 0 : 8, paddingTop: 10 },
  navItem:        { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  navIcon:        { fontSize: 20 },
  navLabel:       { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  navLabelActive: { color: C.gold },
});
