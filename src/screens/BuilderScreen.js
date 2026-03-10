/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER SCREEN
   Code · Social Studio · Image Prompts · Video · Deploy
   Full feature parity with saintsallabs_builder.jsx
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  Clipboard, ActivityIndicator, Linking,
} from 'react-native';
import { C, SYS } from '../config/theme';
import { streamBuilder, generateSocial } from '../lib/api';
import { ChatBubble, InputBar, CodeBlock, ModeBar } from '../components';

/* ── Platforms ────────────────────────────────────── */
const PLATFORMS = [
  { id: 'twitter',   label: 'X / Twitter', color: '#1DA1F2', chars: 280 },
  { id: 'linkedin',  label: 'LinkedIn',    color: '#0A66C2', chars: 1300 },
  { id: 'instagram', label: 'Instagram',   color: '#E1306C', chars: null },
  { id: 'tiktok',    label: 'TikTok',      color: '#69C9D0', chars: null },
  { id: 'facebook',  label: 'Facebook',    color: '#1877F2', chars: null },
];

const MODES = [
  { id: 'code',   label: 'Code',   color: '#818CF8' },
  { id: 'social', label: 'Social', color: '#EC4899' },
  { id: 'images', label: 'Images', color: '#F59E0B' },
  { id: 'video',  label: 'Video',  color: '#22C55E' },
  { id: 'deploy', label: 'Deploy', color: '#818CF8' },
];

const IMG_STYLES = ['photorealistic', 'cinematic', '3D render', 'illustration', 'dark dramatic', 'minimalist'];

export default function BuilderScreen() {
  const [mode, setMode] = useState('code');

  // Code mode
  const [codeHistory, setCodeHistory] = useState([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Social mode
  const [selPlatforms, setSelPlatforms] = useState(['twitter', 'linkedin']);
  const [socialPrompt, setSocialPrompt] = useState('');
  const [socialResults, setSocialResults] = useState({});
  const [socialLoading, setSocialLoading] = useState(false);

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

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [codeHistory, imgResult, videoResult]);

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
    try {
      const results = await generateSocial({ prompt: socialPrompt, platforms: selPlatforms });
      setSocialResults(results);
    } catch (e) {
      setSocialResults({ _error: 'Generation failed. Try again.' });
    }
    setSocialLoading(false);
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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SAL Builder</Text>
          <Text style={styles.headerSub}>Code · Social · Images · Video · Deploy</Text>
        </View>
        {codeHistory.length > 0 && mode === 'code' && (
          <TouchableOpacity onPress={clearCode} style={styles.newBtn}>
            <Text style={styles.newBtnText}>New</Text>
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
                <View style={styles.landingSection}>
                  <Text style={styles.modeTitle}>Code & Apps</Text>
                  <Text style={styles.modeSub}>Describe what you need → complete deployable code, instantly.</Text>
                  {[
                    'Build a full-stack Next.js 15 SaaS landing page — dark amber theme, 3-tier pricing, Stripe integration, scroll animations',
                    'Create a Cloudflare Worker that captures leads, validates email, stores in D1 database, sends webhook to GoHighLevel CRM',
                    'Build a React dashboard with Recharts line chart, animated stat cards, dark amber theme, and CSV export',
                    'Write a Node.js script: pulls leads from Apollo → enriches with Clay → pushes to GoHighLevel with full error handling',
                  ].map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => runCode(s)} style={styles.starterCode}>
                      <Text style={styles.starterCodeText}>{s}</Text>
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

          {/* ══════════ SOCIAL ══════════ */}
          {mode === 'social' && (
            <View>
              <Text style={styles.modeTitle}>Social Content Studio</Text>
              <Text style={styles.modeSub}>One brief → platform-native posts for every channel.</Text>

              <Text style={styles.sectionLabel}>SELECT PLATFORMS</Text>
              <View style={styles.platformRow}>
                {PLATFORMS.map(p => {
                  const sel = selPlatforms.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelPlatforms(prev => sel ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      style={[
                        styles.platBtn,
                        { borderColor: sel ? p.color : '#1E1E28', backgroundColor: sel ? p.color + '15' : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.platBtnText, { color: sel ? p.color : '#555', fontWeight: sel ? '700' : '400' }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.socialInputWrap}>
                <TextInput
                  style={styles.socialInput}
                  value={socialPrompt}
                  onChangeText={setSocialPrompt}
                  placeholder="What is the post about? e.g. 'SaintSal Labs launched medical AI suite with live NPI registry'"
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runSocial}
                  disabled={socialLoading || !socialPrompt.trim() || !selPlatforms.length}
                  style={[styles.socialSend, { backgroundColor: socialPrompt.trim() && !socialLoading ? '#EC4899' : '#1A1A22' }]}
                >
                  {socialLoading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={{ color: socialPrompt.trim() ? '#fff' : '#444', fontSize: 16, fontWeight: '700' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {/* Content ideas */}
              {!Object.keys(socialResults).filter(k => k !== '_error').length && !socialLoading && (
                <View>
                  <Text style={styles.sectionLabel}>CONTENT IDEAS</Text>
                  {[
                    'SaintSal Labs just launched — AI intelligence for medical, real estate, finance, and tech',
                    '3 lessons from building a multi-division AI company with US patent from scratch',
                    'Why we patented our AI protocol before the AI boom — HACP Protocol origin story',
                    'How SaintSal is replacing 6 different SaaS tools for our enterprise clients',
                  ].map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => setSocialPrompt(s)} style={styles.ideaBtn}>
                      <Text style={styles.ideaBtnText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Results */}
              {socialResults._error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{socialResults._error}</Text>
                </View>
              )}

              {socialLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#EC4899" />
                  <Text style={styles.loadingText}>Generating platform-native posts...</Text>
                </View>
              )}

              {PLATFORMS.filter(p => selPlatforms.includes(p.id) && socialResults[p.id]).map(p => (
                <SocialResult key={p.id} platform={p} content={socialResults[p.id]} />
              ))}
            </View>
          )}

          {/* ══════════ IMAGES ══════════ */}
          {mode === 'images' && (
            <View>
              <Text style={styles.modeTitle}>AI Image Prompt Generator</Text>
              <Text style={styles.modeSub}>Your concept → optimized prompts for DALL-E 3, Midjourney, Stable Diffusion.</Text>

              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>STYLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {IMG_STYLES.map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setImgStyle(s)}
                      style={[
                        styles.styleBtn,
                        { borderColor: imgStyle === s ? '#F59E0B' : '#1E1E28', backgroundColor: imgStyle === s ? '#F59E0B18' : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.styleBtnText, { color: imgStyle === s ? '#F59E0B' : '#555' }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.socialInputWrap}>
                <TextInput
                  style={styles.socialInput}
                  value={imgPrompt}
                  onChangeText={setImgPrompt}
                  placeholder="Describe your image concept..."
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runImg}
                  disabled={imgLoading || !imgPrompt.trim()}
                  style={[styles.socialSend, { backgroundColor: imgPrompt.trim() && !imgLoading ? '#F59E0B' : '#1A1A22' }]}
                >
                  {imgLoading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={{ color: imgPrompt.trim() ? '#000' : '#444', fontSize: 16, fontWeight: '700' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {(imgLoading || imgResult) && (
                <View style={[styles.resultBox, { borderColor: '#F59E0B22' }]}>
                  <Text style={styles.resultBoxLabel}>SAL IMAGE PROMPTS</Text>
                  {imgLoading && !imgResult && <ActivityIndicator size="small" color="#F59E0B" />}
                  {imgResult ? (
                    <Text style={styles.resultText} selectable>{imgResult}</Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* ══════════ VIDEO ══════════ */}
          {mode === 'video' && (
            <View>
              <Text style={[styles.modeTitle, { color: '#22C55E' }]}>Video & Script Generator</Text>
              <Text style={styles.modeSub}>Full production package: hook, script, shot list, Runway prompts, captions, music.</Text>

              <View style={styles.socialInputWrap}>
                <TextInput
                  style={styles.socialInput}
                  value={videoPrompt}
                  onChangeText={setVideoPrompt}
                  placeholder="e.g. '60-second TikTok ad for SaintSal Labs targeting business owners'"
                  placeholderTextColor="#444"
                  multiline
                />
                <TouchableOpacity
                  onPress={runVideo}
                  disabled={videoLoading || !videoPrompt.trim()}
                  style={[styles.socialSend, { backgroundColor: videoPrompt.trim() && !videoLoading ? '#22C55E' : '#1A1A22' }]}
                >
                  {videoLoading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={{ color: videoPrompt.trim() ? '#000' : '#444', fontSize: 16, fontWeight: '700' }}>↑</Text>
                  }
                </TouchableOpacity>
              </View>

              {(videoLoading || videoResult) && (
                <View style={[styles.resultBox, { borderColor: '#22C55E22' }]}>
                  <Text style={[styles.resultBoxLabel, { color: '#22C55E' }]}>SAL VIDEO PACKAGE</Text>
                  {videoLoading && !videoResult && <ActivityIndicator size="small" color="#22C55E" />}
                  {videoResult ? (
                    <Text style={styles.resultText} selectable>{videoResult}</Text>
                  ) : null}
                </View>
              )}

              {/* Video starters */}
              {!videoResult && !videoLoading && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionLabel}>IDEAS</Text>
                  {[
                    '60-second TikTok ad for SaintSal Labs — target business owners, show ROI',
                    'YouTube short: How we built an AI platform with US patent from a Goldman Sachs background',
                    'Instagram Reel: CookinCapital real estate deal analysis — before and after',
                    'LinkedIn video: 3 ways AI is replacing entire SaaS stacks for SMBs',
                  ].map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => setVideoPrompt(s)} style={styles.ideaBtn}>
                      <Text style={styles.ideaBtnText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ══════════ DEPLOY ══════════ */}
          {mode === 'deploy' && (
            <View>
              <Text style={[styles.modeTitle, { color: '#818CF8' }]}>Deploy & Go Live</Text>
              <Text style={styles.modeSub}>Push to Vercel, Cloudflare, GitHub, or Render — one click.</Text>

              <View style={styles.deployGrid}>
                {[
                  { label: 'Vercel', desc: 'Next.js, React, static — zero config. Primary deploy.', color: '#fff', url: 'https://vercel.com' },
                  { label: 'Cloudflare', desc: 'Workers, D1 database, R2 storage, AI bindings.', color: '#F59E0B', url: 'https://dash.cloudflare.com' },
                  { label: 'GitHub', desc: 'Push code, create repos, set up CI/CD with Actions.', color: '#818CF8', url: 'https://github.com/SaintVisions-SaintSal' },
                  { label: 'Render', desc: 'Node.js, Python, Docker with auto-scaling and WebSockets.', color: '#22C55E', url: 'https://render.com' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => Linking.openURL(item.url)}
                    style={[styles.deployCard, { borderColor: item.color + '22' }]}
                  >
                    <Text style={[styles.deployLabel, { color: item.color }]}>{item.label}</Text>
                    <Text style={styles.deployDesc}>{item.desc}</Text>
                    <Text style={[styles.deployOpen, { color: item.color }]}>Open {item.label} →</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.deployTip}>
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

/* ─── Social Result Card ──────────────────────────── */
const SocialResult = ({ platform: p, content }) => {
  const [copied, setCopied] = useState(false);
  const charCount = content?.length || 0;

  const copy = () => {
    Clipboard.setString(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={[styles.socialCard, { borderColor: p.color + '22' }]}>
      <View style={styles.socialCardHeader}>
        <View style={styles.socialCardLeft}>
          <View style={[styles.socialIcon, { backgroundColor: p.color + '20' }]}>
            <Text style={{ fontSize: 10, color: p.color, fontWeight: '800' }}>{p.label.charAt(0)}</Text>
          </View>
          <Text style={[styles.socialPlatLabel, { color: p.color }]}>{p.label}</Text>
          <Text style={styles.socialChars}>{charCount} chars</Text>
        </View>
        <TouchableOpacity onPress={copy} style={[styles.copyBtn, { borderColor: p.color + '33', backgroundColor: p.color + '10' }]}>
          <Text style={[styles.copyBtnText, { color: p.color }]}>{copied ? '✓ Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.socialContent} selectable>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  platBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 2 },
  platBtnText: { fontSize: 12 },
  socialInputWrap: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#111118', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E2A', padding: 6, gap: 6, marginBottom: 16 },
  socialInput: { flex: 1, color: '#E8E6E1', fontSize: 14, paddingHorizontal: 6, paddingVertical: 6, maxHeight: 120 },
  socialSend: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ideaBtn: { padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#1A1A22', marginBottom: 6 },
  ideaBtnText: { fontSize: 12.5, color: '#666' },
  errorBox: { padding: 12, borderRadius: 9, backgroundColor: '#EF44440A', borderWidth: 1, borderColor: '#EF444422', marginBottom: 12 },
  errorText: { color: '#EF4444', fontSize: 13 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { fontSize: 12.5, color: '#555' },
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
  socialCard: { backgroundColor: '#0D0D12', borderWidth: 1, borderRadius: 11, padding: 16, marginBottom: 12 },
  socialCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  socialCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  socialIcon: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  socialPlatLabel: { fontSize: 13, fontWeight: '700' },
  socialChars: { fontSize: 10.5, color: '#333' },
  copyBtn: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 7, borderWidth: 1 },
  copyBtnText: { fontSize: 11.5, fontWeight: '600' },
  socialContent: { fontSize: 13.5, color: '#C8C5BE', lineHeight: 22 },
});
