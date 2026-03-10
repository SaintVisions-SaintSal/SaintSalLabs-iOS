/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER SCREEN
   Code · Social Studio · Image Prompts · Video · Deploy
   Full feature parity with saintsallabs_builder.jsx
   Social Studio v2 — Direct LinkedIn posting
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  Clipboard, ActivityIndicator, Linking, Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { C, SYS } from '../config/theme';
import {
  streamBuilder, generateSocial,
  getLinkedInAuthUrl, exchangeLinkedInCode,
  postToLinkedIn,
} from '../lib/api';
import { ChatBubble, InputBar, CodeBlock, ModeBar } from '../components';

/* ── Platforms ────────────────────────────────────── */
const PLATFORMS = [
  { id: 'twitter',   label: 'X / Twitter', icon: '𝕏', color: '#A0A0A0', chars: 280,  connected: false },
  { id: 'linkedin',  label: 'LinkedIn',    icon: 'in', color: '#F59E0B', chars: 1300, connected: true  },
  { id: 'instagram', label: 'Instagram',   icon: '◎', color: '#E1306C', chars: null,  connected: false },
  { id: 'tiktok',    label: 'TikTok',      icon: '♪', color: '#69C9D0', chars: null,  connected: false },
  { id: 'facebook',  label: 'Facebook',    icon: 'f',  color: '#8B8B8B', chars: null,  connected: false },
];

const MODES = [
  { id: 'code',   label: 'Code',   color: '#818CF8' },
  { id: 'social', label: 'Social', color: '#F59E0B' },
  { id: 'images', label: 'Images', color: '#F59E0B' },
  { id: 'video',  label: 'Video',  color: '#22C55E' },
  { id: 'deploy', label: 'Deploy', color: '#818CF8' },
];

const IMG_STYLES = ['photorealistic', 'cinematic', '3D render', 'illustration', 'dark dramatic', 'minimalist'];

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'bold',         label: 'Bold & Punchy', icon: '🔥' },
  { id: 'storytelling', label: 'Storytelling',  icon: '📖' },
  { id: 'casual',       label: 'Casual',        icon: '✌️' },
];

export default function BuilderScreen() {
  const [mode, setMode] = useState('code');

  // Code mode
  const [codeHistory, setCodeHistory] = useState([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Social mode
  const [selPlatforms, setSelPlatforms] = useState(['linkedin']);
  const [socialPrompt, setSocialPrompt] = useState('');
  const [socialResults, setSocialResults] = useState({});
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialTone, setSocialTone] = useState('professional');
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [editText, setEditText] = useState('');

  // LinkedIn OAuth
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [linkedInName, setLinkedInName] = useState('');
  const [linkedInToken, setLinkedInToken] = useState('');

  // Posting state per platform
  const [postingState, setPostingState] = useState({}); // { linkedin: 'idle'|'posting'|'posted'|'failed' }

  // Post history
  const [postHistory, setPostHistory] = useState([]);

  // Image mode
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgStyle, setImgStyle] = useState('photorealistic');
  const [imgResult, setImgResult] = useState('');
  const [imgLoading, setImgLoading] = useState(false);

  // Video mode
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);

  const scrollRef = useRef(null);
  const xhrRef = useRef(null);
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Glow animation for neon text
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [codeHistory, imgResult, videoResult, socialResults]);

  // Load LinkedIn credentials on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('linkedin_token');
        const name = await SecureStore.getItemAsync('linkedin_name');
        if (token) {
          setLinkedInConnected(true);
          setLinkedInToken(token);
          setLinkedInName(name || 'Connected');
        }
      } catch {}
    })();
  }, []);

  // LinkedIn OAuth deep link callback
  useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (url?.includes('social/linkedin/callback')) {
        try {
          const params = new URL(url);
          const code = params.searchParams.get('code');
          const state = params.searchParams.get('state');
          if (code) {
            const result = await exchangeLinkedInCode(code, state);
            if (result.access_token) {
              await SecureStore.setItemAsync('linkedin_token', result.access_token);
              await SecureStore.setItemAsync('linkedin_name', result.name || '');
              setLinkedInConnected(true);
              setLinkedInToken(result.access_token);
              setLinkedInName(result.name || 'Connected');
            }
          }
        } catch (e) {
          console.error('LinkedIn OAuth error:', e);
        }
      }
    };
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  /* ── CODE ─────────────────────────────────────── */
  const runCode = (override) => {
    const text = override || codeInput;
    if (!text?.trim() || codeLoading) return;
    setCodeInput('');
    setCodeLoading(true);

    const userMsg = { id: Date.now() + 'u', role: 'user', content: text };
    const asstMsg = { id: Date.now() + 'a', role: 'assistant', content: '', streaming: true };
    const history = [...codeHistory, userMsg];

    setCodeHistory([...history, asstMsg]);

    xhrRef.current = streamBuilder({
      prompt: text,
      system: SYS.builder,
      onChunk: (chunk) => {
        setCodeHistory(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, content: last.content + chunk };
          return h;
        });
      },
      onDone: () => {
        setCodeHistory(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, streaming: false };
          return h;
        });
        setCodeLoading(false);
      },
      onError: (err) => {
        setCodeHistory(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, content: `⚠ ${err}`, streaming: false };
          return h;
        });
        setCodeLoading(false);
      },
    });
  };

  /* ── SOCIAL ───────────────────────────────────── */
  const runSocial = async () => {
    if (!socialPrompt.trim() || socialLoading || !selPlatforms.length) return;
    setSocialLoading(true);
    setSocialResults({});
    setPostingState({});
    try {
      const results = await generateSocial({ prompt: socialPrompt, platforms: selPlatforms });
      setSocialResults(results);
    } catch (e) {
      setSocialResults({ _error: 'Generation failed. Try again.' });
    }
    setSocialLoading(false);
  };

  /* ── POST TO LINKEDIN ─────────────────────────── */
  const handlePostToLinkedIn = async (content) => {
    if (!linkedInToken || !content) return;
    setPostingState(prev => ({ ...prev, linkedin: 'posting' }));
    try {
      const result = await postToLinkedIn({ access_token: linkedInToken, content });
      if (result.error) throw new Error(result.error);
      setPostingState(prev => ({ ...prev, linkedin: 'posted' }));
      setPostHistory(prev => [
        { platform: 'LinkedIn', timestamp: Date.now(), content: content.slice(0, 80) + '...' },
        ...prev,
      ]);
    } catch {
      setPostingState(prev => ({ ...prev, linkedin: 'failed' }));
    }
  };

  /* ── CONNECT LINKEDIN ─────────────────────────── */
  const handleConnectLinkedIn = async () => {
    try {
      const result = await getLinkedInAuthUrl();
      if (result.authorization_url) {
        await Linking.openURL(result.authorization_url);
      }
    } catch (e) {
      console.error('LinkedIn connect error:', e);
    }
  };

  /* ── DISCONNECT LINKEDIN ──────────────────────── */
  const handleDisconnectLinkedIn = async () => {
    await SecureStore.deleteItemAsync('linkedin_token');
    await SecureStore.deleteItemAsync('linkedin_name');
    setLinkedInConnected(false);
    setLinkedInToken('');
    setLinkedInName('');
  };

  /* ── EDIT RESULT ──────────────────────────────── */
  const startEdit = (platformId, content) => {
    setEditingPlatform(platformId);
    setEditText(content);
  };

  const saveEdit = (platformId) => {
    setSocialResults(prev => ({ ...prev, [platformId]: editText }));
    setEditingPlatform(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingPlatform(null);
    setEditText('');
  };

  /* ── IMAGES ───────────────────────────────────── */
  const runImg = () => {
    if (!imgPrompt.trim() || imgLoading) return;
    setImgLoading(true);
    setImgResult('');
    streamBuilder({
      prompt: `Generate professional AI image prompts for: "${imgPrompt}"\nStyle: ${imgStyle}\n\n**DALL-E 3 Prompt** (under 900 chars, highly descriptive):\n\n**Midjourney Prompt** (with --ar 16:9 --style raw --q 2):\n\n**Stable Diffusion** (positive + negative):\n\n**Director Notes** (lighting, mood, color palette, composition):`,
      system: SYS.builder,
      onChunk: (c) => setImgResult(p => p + c),
      onDone: () => setImgLoading(false),
      onError: () => setImgLoading(false),
    });
  };

  /* ── VIDEO ────────────────────────────────────── */
  const runVideo = () => {
    if (!videoPrompt.trim() || videoLoading) return;
    setVideoLoading(true);
    setVideoResult('');
    streamBuilder({
      prompt: `Complete video production package for: "${videoPrompt}"\n\n**HOOK** (first 3 seconds — stop the scroll):\n\n**FULL SCRIPT** (with [TIMESTAMP], [SPEAKER], [ACTION]):\n\n**SHOT LIST** (angles, b-roll, transitions):\n\n**RUNWAY GEN-3 PROMPTS** (3-5 AI video scene prompts):\n\n**CAPTIONS** (key subtitle lines, 6 words max):\n\n**MUSIC DIRECTION** (mood, genre, BPM):\n\n**CTA** (end card + call to action):`,
      system: SYS.builder,
      onChunk: (c) => setVideoResult(p => p + c),
      onDone: () => setVideoLoading(false),
      onError: () => setVideoLoading(false),
    });
  };

  const clearCode = () => {
    xhrRef.current?.abort();
    setCodeLoading(false);
    setCodeHistory([]);
  };

  /* ── Time ago helper ──────────────────────────── */
  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>SAL Builder</Text>
          <Text style={s.headerSub}>Code · Social · Images · Video · Deploy</Text>
        </View>
        {codeHistory.length > 0 && mode === 'code' && (
          <TouchableOpacity onPress={clearCode} style={s.newBtn}>
            <Text style={s.newBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mode tabs */}
          <ModeBar modes={MODES} active={mode} onSelect={setMode} />

          {/* ══════════ CODE ══════════ */}
          {mode === 'code' && (
            <View>
              {codeHistory.length === 0 && (
                <View style={s.landingSection}>
                  <Text style={s.modeTitle}>Code & Apps</Text>
                  <Text style={s.modeSub}>Describe what you need → complete deployable code, instantly.</Text>
                  {[
                    'Build a full-stack Next.js 15 SaaS landing page — dark amber theme, 3-tier pricing, Stripe integration, scroll animations',
                    'Create a Cloudflare Worker that captures leads, validates email, stores in D1 database, sends webhook to GoHighLevel CRM',
                    'Build a React dashboard with Recharts line chart, animated stat cards, dark amber theme, and CSV export',
                    'Write a Node.js script: pulls leads from Apollo → enriches with Clay → pushes to GoHighLevel with full error handling',
                  ].map((t, i) => (
                    <TouchableOpacity key={i} onPress={() => runCode(t)} style={s.starterCode}>
                      <Text style={s.starterCodeText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {codeHistory.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} accent="#818CF8" />
              ))}
              <InputBar
                value={codeInput}
                onChange={setCodeInput}
                onSend={runCode}
                placeholder="Describe what you want to build..."
                loading={codeLoading}
                accent="#818CF8"
              />
            </View>
          )}

          {/* ══════════════════════════════════════════════
              SOCIAL STUDIO v2 — Direct Posting
          ══════════════════════════════════════════════ */}
          {mode === 'social' && (
            <View>
              {/* ─── Header with neon glow ─── */}
              <View style={s.socialHeader}>
                <Text style={s.socialTitle}>Social Studio</Text>
                <Animated.Text style={[s.socialNeonLabel, { opacity: glowAnim }]}>
                  DIRECT POSTING
                </Animated.Text>
              </View>
              <Text style={s.socialSubtitle}>
                Generate platform-native posts and publish directly.
              </Text>

              {/* ─── A) Connected Accounts ─── */}
              <Text style={s.socialSectionLabel}>CONNECTED ACCOUNTS</Text>
              <View style={s.accountsContainer}>
                {/* LinkedIn — connectable */}
                <View style={[s.accountCard, linkedInConnected && s.accountCardConnected]}>
                  <View style={s.accountLeft}>
                    <View style={[s.accountIcon, { backgroundColor: linkedInConnected ? '#F59E0B20' : '#1A1A22' }]}>
                      <Text style={[s.accountIconText, { color: linkedInConnected ? '#F59E0B' : '#555' }]}>in</Text>
                    </View>
                    <View style={s.accountInfo}>
                      <View style={s.accountNameRow}>
                        <Text style={[s.accountName, linkedInConnected && { color: '#F59E0B' }]}>LinkedIn</Text>
                        {linkedInConnected && <View style={s.greenDot} />}
                      </View>
                      <Text style={s.accountStatus}>
                        {linkedInConnected ? linkedInName || 'Connected' : 'Not connected'}
                      </Text>
                    </View>
                  </View>
                  {linkedInConnected ? (
                    <TouchableOpacity onPress={handleDisconnectLinkedIn} style={s.disconnectBtn}>
                      <Text style={s.disconnectBtnText}>Disconnect</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleConnectLinkedIn} style={s.connectBtn}>
                      <Text style={s.connectBtnText}>Connect</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Twitter — coming soon */}
                <View style={s.accountCard}>
                  <View style={s.accountLeft}>
                    <View style={[s.accountIcon, { backgroundColor: '#1A1A22' }]}>
                      <Text style={[s.accountIconText, { color: '#444' }]}>𝕏</Text>
                    </View>
                    <View style={s.accountInfo}>
                      <Text style={s.accountName}>X / Twitter</Text>
                      <Text style={s.accountStatus}>Not connected</Text>
                    </View>
                  </View>
                  <View style={s.comingSoonBadge}>
                    <Text style={s.comingSoonText}>Soon</Text>
                  </View>
                </View>

                {/* Instagram — coming soon */}
                <View style={s.accountCard}>
                  <View style={s.accountLeft}>
                    <View style={[s.accountIcon, { backgroundColor: '#1A1A22' }]}>
                      <Text style={[s.accountIconText, { color: '#444' }]}>◎</Text>
                    </View>
                    <View style={s.accountInfo}>
                      <Text style={s.accountName}>Instagram</Text>
                      <Text style={s.accountStatus}>Not connected</Text>
                    </View>
                  </View>
                  <View style={s.comingSoonBadge}>
                    <Text style={s.comingSoonText}>Soon</Text>
                  </View>
                </View>
              </View>

              {/* ─── B) Content Generation ─── */}
              <Text style={s.socialSectionLabel}>PLATFORMS</Text>
              <View style={s.platformRow}>
                {PLATFORMS.map(p => {
                  const sel = selPlatforms.includes(p.id);
                  const isLinkedIn = p.id === 'linkedin';
                  const accentColor = isLinkedIn && linkedInConnected ? '#F59E0B' : p.color;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelPlatforms(prev => sel ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      style={[
                        s.platBtn,
                        {
                          borderColor: sel ? accentColor + '55' : '#1E1E28',
                          backgroundColor: sel ? accentColor + '12' : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[s.platBtnIcon, { color: sel ? accentColor : '#444' }]}>{p.icon}</Text>
                      <Text style={[s.platBtnText, { color: sel ? accentColor : '#555', fontWeight: sel ? '700' : '400' }]}>
                        {p.label}
                      </Text>
                      {isLinkedIn && linkedInConnected && sel && <View style={s.tinyGreenDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tone selector */}
              <Text style={s.socialSectionLabel}>TONE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {TONE_OPTIONS.map(t => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setSocialTone(t.id)}
                      style={[
                        s.toneBtn,
                        {
                          borderColor: socialTone === t.id ? '#F59E0B55' : '#1E1E28',
                          backgroundColor: socialTone === t.id ? '#F59E0B12' : 'transparent',
                        },
                      ]}
                    >
                      <Text style={s.toneBtnIcon}>{t.icon}</Text>
                      <Text style={[s.toneBtnText, { color: socialTone === t.id ? '#F59E0B' : '#555' }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Prompt input */}
              <View style={s.socialInputWrap}>
                <TextInput
                  style={s.socialInput}
                  value={socialPrompt}
                  onChangeText={setSocialPrompt}
                  placeholder="What should this post be about?"
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runSocial}
                  disabled={socialLoading || !socialPrompt.trim() || !selPlatforms.length}
                  style={[s.socialSend, { backgroundColor: socialPrompt.trim() && !socialLoading ? '#F59E0B' : '#1A1A22' }]}
                >
                  {socialLoading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={{ color: socialPrompt.trim() ? '#000' : '#444', fontSize: 16, fontWeight: '800' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {/* Content ideas (show only when no results) */}
              {!Object.keys(socialResults).filter(k => k !== '_error').length && !socialLoading && (
                <View>
                  <Text style={s.socialSectionLabel}>CONTENT IDEAS</Text>
                  {[
                    'SaintSal Labs just launched — AI intelligence for medical, real estate, finance, and tech',
                    '3 lessons from building a multi-division AI company with US patent from scratch',
                    'Why we patented our AI protocol before the AI boom — HACP Protocol origin story',
                    'How SaintSal is replacing 6 different SaaS tools for our enterprise clients',
                  ].map((t, i) => (
                    <TouchableOpacity key={i} onPress={() => setSocialPrompt(t)} style={s.ideaBtn}>
                      <Text style={s.ideaBtnText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Error */}
              {socialResults._error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{socialResults._error}</Text>
                </View>
              )}

              {/* Loading */}
              {socialLoading && (
                <View style={s.loadingRow}>
                  <ActivityIndicator size="small" color="#F59E0B" />
                  <Text style={s.loadingText}>Generating platform-native posts...</Text>
                </View>
              )}

              {/* ─── C) Generated Results — THE SHOWSTOPPER ─── */}
              {PLATFORMS.filter(p => selPlatforms.includes(p.id) && socialResults[p.id]).map(p => {
                const content = socialResults[p.id];
                const charCount = content?.length || 0;
                const isLinkedIn = p.id === 'linkedin';
                const canPost = isLinkedIn && linkedInConnected;
                const pState = postingState[p.id] || 'idle';
                const isEditing = editingPlatform === p.id;
                const accentColor = isLinkedIn ? '#F59E0B' : p.color;

                return (
                  <View key={p.id} style={[s.resultCard, { borderColor: accentColor + '25' }]}>
                    {/* Card header */}
                    <View style={s.resultCardHeader}>
                      <View style={s.resultCardLeft}>
                        <View style={[s.resultPlatIcon, { backgroundColor: accentColor + '18' }]}>
                          <Text style={{ fontSize: 12, color: accentColor, fontWeight: '900' }}>{p.icon}</Text>
                        </View>
                        <Text style={[s.resultPlatLabel, { color: accentColor }]}>{p.label}</Text>
                      </View>
                      <View style={[s.charBadge, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
                        <Text style={[s.charBadgeText, { color: accentColor }]}>
                          {charCount}{p.chars ? `/${p.chars}` : ''} chars
                        </Text>
                      </View>
                    </View>

                    {/* Content — editable or read-only */}
                    {isEditing ? (
                      <View style={s.editContainer}>
                        <TextInput
                          style={s.editInput}
                          value={editText}
                          onChangeText={setEditText}
                          multiline
                          autoFocus
                        />
                        <View style={s.editActions}>
                          <TouchableOpacity onPress={cancelEdit} style={s.editCancelBtn}>
                            <Text style={s.editCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => saveEdit(p.id)} style={s.editSaveBtn}>
                            <Text style={s.editSaveText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={s.resultContent} selectable>{content}</Text>
                    )}

                    {/* Action buttons */}
                    {!isEditing && (
                      <View style={s.resultActions}>
                        {/* Edit */}
                        <TouchableOpacity onPress={() => startEdit(p.id, content)} style={s.resultActionBtn}>
                          <Text style={s.resultActionBtnText}>Edit</Text>
                        </TouchableOpacity>

                        {/* Copy */}
                        <CopyButton content={content} accentColor={accentColor} />

                        {/* Post to Platform — only for connected platforms */}
                        {canPost && pState === 'idle' && (
                          <TouchableOpacity
                            onPress={() => handlePostToLinkedIn(content)}
                            style={s.postBtn}
                          >
                            <Text style={s.postBtnText}>Post to LinkedIn →</Text>
                          </TouchableOpacity>
                        )}

                        {canPost && pState === 'posting' && (
                          <View style={s.postingIndicator}>
                            <ActivityIndicator size="small" color="#F59E0B" />
                            <Text style={s.postingText}>Posting...</Text>
                          </View>
                        )}

                        {canPost && pState === 'posted' && (
                          <View style={s.postedBadge}>
                            <Text style={s.postedText}>✓ Posted!</Text>
                          </View>
                        )}

                        {canPost && pState === 'failed' && (
                          <TouchableOpacity onPress={() => handlePostToLinkedIn(content)} style={s.failedBtn}>
                            <Text style={s.failedBtnText}>✗ Retry</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              {/* ─── D) Post History ─── */}
              {postHistory.length > 0 && (
                <View style={s.historySection}>
                  <Text style={s.socialSectionLabel}>RECENT POSTS</Text>
                  {postHistory.map((entry, i) => (
                    <View key={i} style={s.historyItem}>
                      <View style={s.historyDot} />
                      <Text style={s.historyText}>
                        Posted to {entry.platform} · {timeAgo(entry.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ══════════ IMAGES ══════════ */}
          {mode === 'images' && (
            <View>
              <Text style={s.modeTitle}>AI Image Prompt Generator</Text>
              <Text style={s.modeSub}>Your concept → optimized prompts for DALL-E 3, Midjourney, Stable Diffusion.</Text>

              <Text style={[s.sectionLabel, { marginTop: 12 }]}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {IMG_STYLES.map(st => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setImgStyle(st)}
                      style={[
                        s.styleBtn,
                        { borderColor: imgStyle === st ? '#F59E0B' : '#1E1E28', backgroundColor: imgStyle === st ? '#F59E0B18' : 'transparent' },
                      ]}
                    >
                      <Text style={[s.styleBtnText, { color: imgStyle === st ? '#F59E0B' : '#555' }]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={s.socialInputWrap}>
                <TextInput
                  style={s.socialInput}
                  value={imgPrompt}
                  onChangeText={setImgPrompt}
                  placeholder="Describe your image concept..."
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runImg}
                  disabled={imgLoading || !imgPrompt.trim()}
                  style={[s.socialSend, { backgroundColor: imgPrompt.trim() && !imgLoading ? '#F59E0B' : '#1A1A22' }]}
                >
                  {imgLoading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={{ color: imgPrompt.trim() ? '#000' : '#444', fontSize: 16, fontWeight: '700' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {(imgLoading || imgResult) && (
                <View style={[s.resultBox, { borderColor: '#F59E0B22' }]}>
                  <Text style={s.resultBoxLabel}>SAL IMAGE PROMPTS</Text>
                  {imgLoading && !imgResult && <ActivityIndicator size="small" color="#F59E0B" />}
                  {imgResult ? (
                    <Text style={s.resultText} selectable>{imgResult}</Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* ══════════ VIDEO ══════════ */}
          {mode === 'video' && (
            <View>
              <Text style={[s.modeTitle, { color: '#22C55E' }]}>Video & Script Generator</Text>
              <Text style={s.modeSub}>Full production package: hook, script, shot list, Runway prompts, captions, music.</Text>

              <View style={s.socialInputWrap}>
                <TextInput
                  style={s.socialInput}
                  value={videoPrompt}
                  onChangeText={setVideoPrompt}
                  placeholder="e.g. '60-second TikTok ad for SaintSal Labs targeting business owners'"
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runVideo}
                  disabled={videoLoading || !videoPrompt.trim()}
                  style={[s.socialSend, { backgroundColor: videoPrompt.trim() && !videoLoading ? '#22C55E' : '#1A1A22' }]}
                >
                  {videoLoading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={{ color: videoPrompt.trim() ? '#000' : '#444', fontSize: 16, fontWeight: '700' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {(videoLoading || videoResult) && (
                <View style={[s.resultBox, { borderColor: '#22C55E22' }]}>
                  <Text style={[s.resultBoxLabel, { color: '#22C55E' }]}>SAL VIDEO PACKAGE</Text>
                  {videoLoading && !videoResult && <ActivityIndicator size="small" color="#22C55E" />}
                  {videoResult ? (
                    <Text style={s.resultText} selectable>{videoResult}</Text>
                  ) : null}
                </View>
              )}

              {/* Video starters */}
              {!videoResult && !videoLoading && (
                <View style={{ marginTop: 8 }}>
                  <Text style={s.sectionLabel}>IDEAS</Text>
                  {[
                    '60-second TikTok ad for SaintSal Labs — target business owners, show ROI',
                    'YouTube short: How we built an AI platform with US patent from a Goldman Sachs background',
                    'Instagram Reel: CookinCapital real estate deal analysis — before and after',
                    'LinkedIn video: 3 ways AI is replacing entire SaaS stacks for SMBs',
                  ].map((t, i) => (
                    <TouchableOpacity key={i} onPress={() => setVideoPrompt(t)} style={s.ideaBtn}>
                      <Text style={s.ideaBtnText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ══════════ DEPLOY ══════════ */}
          {mode === 'deploy' && (
            <View>
              <Text style={[s.modeTitle, { color: '#818CF8' }]}>Deploy & Go Live</Text>
              <Text style={s.modeSub}>Push to Vercel, Cloudflare, GitHub, or Render — one click.</Text>

              <View style={s.deployGrid}>
                {[
                  { label: 'Vercel', desc: 'Next.js, React, static — zero config. Primary deploy.', color: '#fff', url: 'https://vercel.com' },
                  { label: 'Cloudflare', desc: 'Workers, D1 database, R2 storage, AI bindings.', color: '#F59E0B', url: 'https://dash.cloudflare.com' },
                  { label: 'GitHub', desc: 'Push code, create repos, set up CI/CD with Actions.', color: '#818CF8', url: 'https://github.com/SaintVisions-SaintSal' },
                  { label: 'Render', desc: 'Node.js, Python, Docker with auto-scaling and WebSockets.', color: '#22C55E', url: 'https://render.com' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => Linking.openURL(item.url)}
                    style={[s.deployCard, { borderColor: item.color + '22' }]}
                  >
                    <Text style={[s.deployLabel, { color: item.color }]}>{item.label}</Text>
                    <Text style={s.deployDesc}>{item.desc}</Text>
                    <Text style={[s.deployOpen, { color: item.color }]}>Open {item.label} →</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.deployTip}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.amber, marginBottom: 5 }}>
                  Need deployment help?
                </Text>
                <Text style={{ fontSize: 12.5, color: '#555', lineHeight: 18 }}>
                  Switch to Code mode and ask SAL: "Write a Vercel deployment config for my Next.js app" or "Create GitHub Actions CI/CD pipeline for Node.js"
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Copy Button (self-contained) ─────────────────── */
const CopyButton = ({ content, accentColor }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    Clipboard.setString(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TouchableOpacity
      onPress={copy}
      style={[s.resultActionBtn, copied && { borderColor: accentColor + '44', backgroundColor: accentColor + '12' }]}
    >
      <Text style={[s.resultActionBtnText, copied && { color: accentColor }]}>
        {copied ? '✓ Copied' : 'Copy'}
      </Text>
    </TouchableOpacity>
  );
};

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.borderSm, backgroundColor: C.sidebar,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.amber },
  headerSub: { fontSize: 11, color: C.textGhost, marginTop: 1 },
  newBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: C.amber + '18', borderWidth: 1, borderColor: C.amber + '33' },
  newBtnText: { fontSize: 12, fontWeight: '700', color: C.amber },
  landingSection: { marginBottom: 20 },
  modeTitle: { fontSize: 18, fontWeight: '800', color: '#818CF8', marginBottom: 4 },
  modeSub: { fontSize: 13, color: C.textGhost, marginBottom: 16 },
  starterCode: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#818CF820', backgroundColor: '#818CF808', marginBottom: 8 },
  starterCodeText: { fontSize: 13, color: '#818CF8AA' },
  sectionLabel: { fontSize: 9, color: '#333', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  // ─── Social Studio v2 ───
  socialHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  socialTitle: {
    fontSize: 20, fontWeight: '900', color: '#F59E0B',
  },
  socialNeonLabel: {
    fontSize: 9, fontWeight: '900', color: '#F59E0B', letterSpacing: 1.5,
    textShadowColor: '#F59E0B', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  socialSubtitle: {
    fontSize: 13, color: C.textGhost, marginBottom: 20,
  },
  socialSectionLabel: {
    fontSize: 9, color: '#F59E0B88', fontWeight: '800', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },

  // Connected accounts
  accountsContainer: { gap: 8, marginBottom: 20 },
  accountCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0D0D12', borderRadius: 14, borderWidth: 1, borderColor: '#1C1C24',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  accountCardConnected: {
    borderColor: '#F59E0B25',
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 12,
  },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  accountIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  accountIconText: { fontSize: 14, fontWeight: '900' },
  accountInfo: { flex: 1 },
  accountNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accountName: { fontSize: 14, fontWeight: '700', color: '#888' },
  accountStatus: { fontSize: 11, color: '#444', marginTop: 1 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  connectBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#F59E0B55', backgroundColor: '#F59E0B10',
  },
  connectBtnText: { fontSize: 12, fontWeight: '800', color: '#F59E0B' },
  disconnectBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#1A1A22',
  },
  disconnectBtnText: { fontSize: 11, fontWeight: '600', color: '#555' },
  comingSoonBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: '#1A1A22',
  },
  comingSoonText: { fontSize: 10, fontWeight: '700', color: '#333', letterSpacing: 0.5 },

  // Platform pills
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  platBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1.5,
  },
  platBtnIcon: { fontSize: 13, fontWeight: '900' },
  platBtnText: { fontSize: 13 },
  tinyGreenDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },

  // Tone selector
  toneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  toneBtnIcon: { fontSize: 14 },
  toneBtnText: { fontSize: 12, fontWeight: '600' },

  // Input
  socialInputWrap: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#111118', borderRadius: 14, borderWidth: 1, borderColor: '#1E1E2A',
    padding: 6, gap: 6, marginBottom: 16,
  },
  socialInput: { flex: 1, color: '#E8E6E1', fontSize: 14, paddingHorizontal: 8, paddingVertical: 8, maxHeight: 120 },
  socialSend: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Ideas
  ideaBtn: { padding: 13, borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B15', backgroundColor: '#F59E0B06', marginBottom: 6 },
  ideaBtnText: { fontSize: 13, color: '#666', lineHeight: 19 },

  // Error / loading
  errorBox: { padding: 12, borderRadius: 9, backgroundColor: '#EF44440A', borderWidth: 1, borderColor: '#EF444422', marginBottom: 12 },
  errorText: { color: '#EF4444', fontSize: 13 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { fontSize: 13, color: '#555' },

  // ─── Result cards (showstopper) ───
  resultCard: {
    backgroundColor: '#0D0D14', borderWidth: 1, borderRadius: 16,
    padding: 18, marginBottom: 14,
  },
  resultCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  resultCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultPlatIcon: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  resultPlatLabel: { fontSize: 14, fontWeight: '800' },
  charBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  charBadgeText: { fontSize: 10, fontWeight: '700' },
  resultContent: {
    fontSize: 14, color: '#D4D1CB', lineHeight: 23, marginBottom: 14,
  },

  // Edit mode
  editContainer: { marginBottom: 14 },
  editInput: {
    backgroundColor: '#111118', borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B33',
    color: '#E8E6E1', fontSize: 14, lineHeight: 22,
    padding: 14, minHeight: 100,
  },
  editActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8,
  },
  editCancelBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#1A1A22',
  },
  editCancelText: { fontSize: 12, fontWeight: '600', color: '#555' },
  editSaveBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#F59E0B',
  },
  editSaveText: { fontSize: 12, fontWeight: '800', color: '#000' },

  // Action buttons row
  resultActions: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  resultActionBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9,
    borderWidth: 1, borderColor: '#1E1E28', backgroundColor: '#111118',
  },
  resultActionBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },

  // Post to LinkedIn
  postBtn: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 4,
  },
  postBtnText: { fontSize: 12.5, fontWeight: '800', color: '#000' },

  // Posting indicator
  postingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  postingText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },

  // Posted
  postedBadge: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9,
    backgroundColor: '#22C55E18', borderWidth: 1, borderColor: '#22C55E33',
  },
  postedText: { fontSize: 12, fontWeight: '700', color: '#22C55E' },

  // Failed
  failedBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9,
    backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444433',
  },
  failedBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Post history
  historySection: { marginTop: 10 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111118',
  },
  historyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  historyText: { fontSize: 12, color: '#555' },

  // ─── Images / Video / Deploy (unchanged) ───
  styleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  styleBtnText: { fontSize: 11.5 },
  resultBox: { backgroundColor: '#0A0A0D', borderWidth: 1, borderRadius: 10, padding: 16, marginTop: 4 },
  resultBoxLabel: { fontSize: 9, color: '#F59E0B', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  resultText: { fontSize: 13.5, color: '#C8C5BE', lineHeight: 22 },
  deployGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 14 },
  deployCard: { width: '47%', backgroundColor: '#111116', borderWidth: 1, borderRadius: 11, padding: 16 },
  deployLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  deployDesc: { fontSize: 12, color: '#555', lineHeight: 18, marginBottom: 12 },
  deployOpen: { fontSize: 11.5, fontWeight: '600' },
  deployTip: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#F59E0B18', borderRadius: 10, padding: 16 },
});
