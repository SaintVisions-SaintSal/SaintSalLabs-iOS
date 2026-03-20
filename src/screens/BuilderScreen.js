/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER SCREEN  v3
   Revenue engine: code · image · video · voice · social
   SSE streaming · tier metering · auto-save · quota gate
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  Animated, Alert, Image, Linking, ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

/* ── Design Tokens ───────────────────────────────── */
const GOLD        = '#D4AF37';
const BLACK       = '#0F0F0F';
const SURFACE     = 'rgba(255,255,255,0.04)';
const BORDER      = 'rgba(255,255,255,0.08)';
const GOLD_BORDER = 'rgba(212,175,55,0.22)';
const GOLD_DIM    = 'rgba(212,175,55,0.1)';
const MUTED       = 'rgba(255,255,255,0.5)';
const DIM         = 'rgba(255,255,255,0.2)';

const LABS_API = 'https://saintsallabs-api.onrender.com';

/* ── Mode config ─────────────────────────────────── */
const MODES = [
  { id: 'code',   label: 'CODE',   icon: '⌨️' },
  { id: 'image',  label: 'IMAGE',  icon: '🖼' },
  { id: 'video',  label: 'VIDEO',  icon: '🎬' },
  { id: 'voice',  label: 'VOICE',  icon: '🎙' },
  { id: 'social', label: 'SOCIAL', icon: '📣' },
];

/* ── Compute bar ─────────────────────────────────── */
function QuotaBar({ minutesLeft, limit, pulsing }) {
  const pct   = limit > 0 ? Math.max(0, Math.min(1, minutesLeft / limit)) : 0;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulsing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0,  duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.setValue(1);
    }
  }, [pulsing]);

  return (
    <Animated.View style={[styles.quotaWrap, { transform: [{ scale: pulse }] }]}>
      <Text style={styles.quotaTxt}>⚡ {Math.round(minutesLeft)} min left</Text>
      <View style={styles.quotaTrack}>
        <View style={[styles.quotaFill, { width: `${pct * 100}%` }]} />
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════ */
export default function BuilderScreen() {
  const router = useRouter();

  const [mode, setMode]                     = useState('code');
  const [prompt, setPrompt]                 = useState('');
  const [output, setOutput]                 = useState('');
  const [loading, setLoading]               = useState(false);
  const [elapsed, setElapsed]               = useState(0);
  const [quota, setQuota]                   = useState({ minutesLeft: 100, limit: 100, tier: 'free' });
  const [savedBuilds, setSavedBuilds]       = useState([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [videoTaskId, setVideoTaskId]       = useState(null);
  const [videoStatus, setVideoStatus]       = useState(null);
  const [voiceReady, setVoiceReady]         = useState(false);
  const [sessionData, setSessionData]       = useState(null);

  const timerRef   = useRef(null);
  const pollRef    = useRef(null);
  const outputRef  = useRef('');

  /* ── Mount: load session + quota + builds ──────── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setSessionData(session);

      try {
        const qRes = await fetch(`${LABS_API}/api/builder/compute-quota`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (qRes.ok) {
          const q = await qRes.json();
          setQuota({
            minutesLeft: q.minutesLeft ?? 100,
            limit:       q.limit       ?? 100,
            tier:        q.tier        || 'free',
          });
        }
      } catch {}

      try {
        const bRes = await fetch(
          `${LABS_API}/api/builder/builds/${session.user.id}`,
          { headers: { 'x-sal-key': 'sal-live-2026' } }
        );
        if (bRes.ok) {
          const { builds } = await bRes.json();
          setSavedBuilds(builds || []);
        }
      } catch {}
    })();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  /* ── Tier gate ─────────────────────────────────── */
  const checkQuota = useCallback(() => {
    if (quota.minutesLeft <= 0) {
      Alert.alert(
        'Compute Limit Reached',
        `You've used all your ${quota.tier} compute minutes.`,
        [
          { text: 'Upgrade Plan', onPress: () => router.push('/(stack)/pricing') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return false;
    }
    return true;
  }, [quota]);

  /* ── Reset output state ────────────────────────── */
  const resetState = () => {
    setOutput('');
    outputRef.current = '';
    setGeneratedImageUrl(null);
    setVideoTaskId(null);
    setVideoStatus(null);
    setVoiceReady(false);
    setElapsed(0);
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
  };

  /* ── Post-generate: deduct + save ──────────────── */
  const finalizeGeneration = useCallback(async (seconds, content, sess) => {
    clearInterval(timerRef.current);
    setLoading(false);

    if (!sess) return;

    // Deduct compute
    try {
      await fetch(`${LABS_API}/api/metering/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sess.access_token}`,
        },
        body: JSON.stringify({ seconds, user_id: sess.user.id }),
      });
      setQuota(prev => ({
        ...prev,
        minutesLeft: Math.max(0, prev.minutesLeft - seconds / 60),
      }));
    } catch {}

    // Auto-save
    if (content) {
      try {
        await fetch(`${LABS_API}/api/builder/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sess.access_token}`,
          },
          body: JSON.stringify({
            user_id:  sess.user.id,
            name:     prompt.slice(0, 50),
            content,
            type:     mode,
            vertical: 'general',
          }),
        });
        await AsyncStorage.setItem('sal_last_build', prompt.slice(0, 50));
        // Reload builds list
        const bRes = await fetch(
          `${LABS_API}/api/builder/builds/${sess.user.id}`,
          { headers: { 'x-sal-key': 'sal-live-2026' } }
        );
        if (bRes.ok) {
          const { builds } = await bRes.json();
          setSavedBuilds(builds || []);
        }
      } catch {}
    }
  }, [prompt, mode]);

  /* ── CODE / TEXT: SSE streaming ────────────────── */
  const generateCode = useCallback(() => {
    if (!checkQuota()) return;
    resetState();
    setLoading(true);

    const sess      = sessionData;
    const tier      = quota.tier || 'free';
    const startTime = Date.now();

    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );

    const xhr      = new XMLHttpRequest();
    let processed  = 0;

    xhr.open('POST', `${LABS_API}/api/builder/generate`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-sal-key', 'sal-live-2026');

    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(processed);
      processed     = xhr.responseText.length;
      const lines   = newText.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') break;
        try {
          const d = JSON.parse(raw);
          if (d.type === 'content_block_delta' && d.delta?.text) {
            outputRef.current += d.delta.text;
            setOutput(outputRef.current);
          }
        } catch {}
      }
    };

    xhr.onload = async () => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      await finalizeGeneration(seconds, outputRef.current, sess);
    };

    xhr.onerror = () => {
      clearInterval(timerRef.current);
      setLoading(false);
      Alert.alert('Generation failed', 'Network error. Please try again.');
    };

    xhr.send(JSON.stringify({ prompt, tier, type: mode }));
  }, [prompt, mode, quota, sessionData, checkQuota, finalizeGeneration]);

  /* ── IMAGE generation ──────────────────────────── */
  const generateImage = useCallback(async () => {
    if (!checkQuota()) return;
    resetState();
    setLoading(true);
    const startTime = Date.now();
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    try {
      const res = await fetch(`${LABS_API}/api/builder/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': 'sal-live-2026' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      });
      const { url } = await res.json();
      setGeneratedImageUrl(url);
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      await finalizeGeneration(seconds, url, sessionData);
    } catch (err) {
      Alert.alert('Image generation failed', err.message);
      clearInterval(timerRef.current);
      setLoading(false);
    }
  }, [prompt, quota, sessionData, checkQuota, finalizeGeneration]);

  /* ── VIDEO generation (Runway polling) ─────────── */
  const generateVideo = useCallback(async () => {
    if (!checkQuota()) return;
    resetState();
    setLoading(true);
    setVideoStatus('QUEUED');
    const startTime = Date.now();
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    try {
      const res = await fetch(`${LABS_API}/api/builder/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': 'sal-live-2026' },
        body: JSON.stringify({ prompt }),
      });
      const { task_id } = await res.json();
      setVideoTaskId(task_id);

      pollRef.current = setInterval(async () => {
        try {
          const sRes = await fetch(
            `${LABS_API}/api/builder/video/${task_id}`,
            { headers: { 'x-sal-key': 'sal-live-2026' } }
          );
          const { status, output: videoOutput } = await sRes.json();
          setVideoStatus(status);
          if (status === 'SUCCEEDED' || status === 'FAILED') {
            clearInterval(pollRef.current);
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            await finalizeGeneration(seconds, videoOutput || task_id, sessionData);
          }
        } catch {}
      }, 3000);
    } catch (err) {
      Alert.alert('Video generation failed', err.message);
      clearInterval(timerRef.current);
      setLoading(false);
    }
  }, [prompt, quota, sessionData, checkQuota, finalizeGeneration]);

  /* ── VOICE generation ──────────────────────────── */
  const generateVoice = useCallback(async () => {
    if (!checkQuota()) return;
    resetState();
    setLoading(true);
    const startTime = Date.now();
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    try {
      const res = await fetch(`${LABS_API}/api/builder/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': 'sal-live-2026' },
        body: JSON.stringify({ text: prompt }),
      });
      if (res.ok) {
        setVoiceReady(true);
        const blob = await res.blob();
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        await finalizeGeneration(seconds, `voice:${prompt.slice(0, 40)}`, sessionData);
      }
    } catch (err) {
      Alert.alert('Voice generation failed', err.message);
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  }, [prompt, quota, sessionData, checkQuota, finalizeGeneration]);

  /* ── SOCIAL generation (code stream) ───────────── */
  const generateSocial = generateCode;

  /* ── Main dispatch ─────────────────────────────── */
  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Empty prompt', 'Describe what you want to build.');
      return;
    }
    switch (mode) {
      case 'code':
      case 'social': return generateCode();
      case 'image':  return generateImage();
      case 'video':  return generateVideo();
      case 'voice':  return generateVoice();
    }
  };

  /* ── Copy ──────────────────────────────────────── */
  const handleCopy = () => {
    Clipboard.setStringAsync(output || generatedImageUrl || '');
    Alert.alert('Copied!', 'Content copied to clipboard.');
  };

  /* ── Preview ───────────────────────────────────── */
  const handlePreview = () => {
    router.push({
      pathname: '/(stack)/builder-viewport',
      params: { content: output },
    });
  };

  /* ── Render output area ────────────────────────── */
  const renderOutput = () => {
    if (mode === 'image' && generatedImageUrl) {
      return (
        <View style={styles.outputBox}>
          <Image source={{ uri: generatedImageUrl }} style={styles.genImage} resizeMode="contain" />
        </View>
      );
    }
    if (mode === 'video') {
      return (
        <View style={styles.videoCard}>
          {loading && <ActivityIndicator color={GOLD} size="large" />}
          <Text style={styles.videoStatus}>
            {videoStatus === 'SUCCEEDED' ? '✅ VIDEO READY' :
             videoStatus === 'FAILED'    ? '❌ GENERATION FAILED' :
             videoStatus               ? `⏳ ${videoStatus}...` : ''}
          </Text>
          {videoStatus === 'SUCCEEDED' && videoTaskId && (
            <TouchableOpacity
              style={styles.videoBtn}
              onPress={() => Linking.openURL(`${LABS_API}/api/builder/video/${videoTaskId}/download`)}
            >
              <Text style={styles.videoBtnTxt}>🎬 Open Video</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    if (mode === 'voice') {
      return (
        <View style={styles.voiceCard}>
          {loading
            ? <ActivityIndicator color={GOLD} />
            : voiceReady
              ? <Text style={styles.voiceReady}>🎵 Audio generated. Tap Play.</Text>
              : null}
          {voiceReady && (
            <TouchableOpacity style={styles.playBtn}>
              <Text style={styles.playBtnTxt}>▶ PLAY</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    // Code / social / default
    if (!output && !loading) return null;
    return (
      <ScrollView style={styles.outputBox} nestedScrollEnabled>
        {loading && !output && <ActivityIndicator color={GOLD} />}
        <Text style={styles.outputTxt}>{output}</Text>
      </ScrollView>
    );
  };

  /* ── Render ────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹ BUILDER</Text>
          </TouchableOpacity>
          <QuotaBar
            minutesLeft={quota.minutesLeft}
            limit={quota.limit}
            pulsing={loading}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Mode tabs ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeBar}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeChip, mode === m.id && styles.modeChipActive]}
                onPress={() => { setMode(m.id); resetState(); }}
              >
                <Text style={[styles.modeChipTxt, mode === m.id && styles.modeChipTxtActive]}>
                  {m.icon} {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Prompt area ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What do you want to build?</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Describe your idea..."
                placeholderTextColor={MUTED}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.generateBtn, loading && styles.generateBtnDim]}
                onPress={handleGenerate}
                disabled={loading}
              >
                <Text style={styles.generateBtnTxt}>
                  {loading ? `⏳ ${elapsed}s` : '⚡ GENERATE'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Output ── */}
          {(loading || output || generatedImageUrl || videoStatus || voiceReady) && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>OUTPUT</Text>
              {renderOutput()}

              {/* Action buttons */}
              {(output || generatedImageUrl) && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                    <Text style={styles.actionBtnTxt}>📋 COPY</Text>
                  </TouchableOpacity>
                  {mode === 'code' && output && (
                    <TouchableOpacity style={styles.actionBtn} onPress={handlePreview}>
                      <Text style={styles.actionBtnTxt}>👁 PREVIEW</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push('/(stack)/elite-deploy')}
                  >
                    <Text style={styles.actionBtnTxt}>🚀 DEPLOY</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ── Recent builds ── */}
          {savedBuilds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT BUILDS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedBuilds.slice(0, 6).map((b, i) => (
                  <TouchableOpacity
                    key={b.id || i}
                    style={styles.buildChip}
                    onPress={() => {
                      setPrompt(b.name || '');
                      setOutput(b.content || '');
                      outputRef.current = b.content || '';
                    }}
                  >
                    <Text style={styles.buildChipType}>{b.type || 'code'}</Text>
                    <Text style={styles.buildChipName} numberOfLines={1}>
                      {b.name || 'Untitled'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BLACK,
  },
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { paddingRight: 8 },
  backTxt: { fontSize: 14, fontWeight: '700', color: GOLD, letterSpacing: 1 },
  /* Quota bar */
  quotaWrap: { alignItems: 'flex-end' },
  quotaTxt:  { fontSize: 12, color: GOLD, fontWeight: '600', marginBottom: 4 },
  quotaTrack: { width: 100, height: 3, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' },
  quotaFill:  { height: '100%', backgroundColor: GOLD, borderRadius: 2 },
  /* Mode bar */
  modeBar: { paddingHorizontal: 16, paddingVertical: 12 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    marginRight: 8,
  },
  modeChipActive: {
    backgroundColor: GOLD_DIM,
    borderColor: GOLD_BORDER,
  },
  modeChipTxt:       { fontSize: 12, color: MUTED, fontWeight: '600', letterSpacing: 0.5 },
  modeChipTxtActive: { color: GOLD },
  /* Section */
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    color: DIM,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  /* Input */
  inputCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
  },
  input: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  generateBtn: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  generateBtnDim: { opacity: 0.6 },
  generateBtnTxt: { fontSize: 14, fontWeight: '800', color: BLACK, letterSpacing: 1 },
  /* Output */
  outputBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    maxHeight: 320,
  },
  outputTxt: {
    color: '#E2E8F0',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  genImage: {
    width: '100%',
    height: 280,
    borderRadius: 10,
  },
  /* Video card */
  videoCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  videoStatus: { color: GOLD, fontSize: 16, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  videoBtn: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  videoBtnTxt: { color: BLACK, fontWeight: '800', fontSize: 14 },
  /* Voice card */
  voiceCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  voiceReady: { color: GOLD, fontSize: 15, fontWeight: '600', marginBottom: 16 },
  playBtn: {
    backgroundColor: GOLD_DIM,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 30,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  playBtnTxt: { color: GOLD, fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  /* Action row */
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnTxt: { fontSize: 11, color: MUTED, fontWeight: '700', letterSpacing: 0.5 },
  /* Recent builds */
  buildChip: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 100,
    maxWidth: 150,
  },
  buildChipType: { fontSize: 10, color: GOLD, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  buildChipName: { fontSize: 12, color: MUTED },
});
