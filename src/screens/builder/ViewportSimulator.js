/* ═══════════════════════════════════════════════════
   STITCH SCREEN — VIEWPORT SIMULATOR
   Source: stitch_ai_chat_suite/builder_viewport_simulator
   Mobile/Tablet/Desktop viewport preview, live deploy mode
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const VIEWPORTS = [
  { id: 'mobile', label: 'Mobile', icon: '📱', width: 375, height: 667, scale: 0.7 },
  { id: 'tablet', label: 'Tablet', icon: '📋', width: 768, height: 1024, scale: 0.45 },
  { id: 'desktop', label: 'Desktop', icon: '🖥', width: 1440, height: 900, scale: 0.25 },
];

const PREVIEW_URL_DEFAULT = 'https://saintsallabs.com';

export default function ViewportSimulator() {
  const router = useRouter();
  const [activeViewport, setActiveViewport] = useState('mobile');
  const [previewUrl, setPreviewUrl] = useState(PREVIEW_URL_DEFAULT);
  const [inputUrl, setInputUrl] = useState(PREVIEW_URL_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState('idle'); // idle | deploying | live

  const vp = VIEWPORTS.find(v => v.id === activeViewport);
  const frameW = Math.min(SCREEN_W - 32, vp.width * vp.scale);
  const frameH = vp.height * vp.scale;

  const triggerDeploy = () => {
    setDeployStatus('deploying');
    setTimeout(() => setDeployStatus('live'), 3000);
  };

  const loadUrl = () => {
    let url = inputUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setPreviewUrl(url);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SAINTSAL™ LABS</Text>
          <Text style={s.headerSub}>ELITE BUILDER — SIMULATOR</Text>
        </View>
        <View style={[s.deployDot, {
          backgroundColor: deployStatus === 'live' ? '#22C55E' : deployStatus === 'deploying' ? '#F59E0B' : '#444455'
        }]} />
      </View>

      {/* Viewport Selector */}
      <View style={s.vpRow}>
        {VIEWPORTS.map(vp => (
          <TouchableOpacity
            key={vp.id}
            style={[s.vpBtn, activeViewport === vp.id && s.vpBtnActive]}
            onPress={() => setActiveViewport(vp.id)}
          >
            <Text style={s.vpIcon}>{vp.icon}</Text>
            <Text style={[s.vpLabel, activeViewport === vp.id && s.vpLabelActive]}>{vp.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* URL Bar */}
      <View style={s.urlRow}>
        <View style={s.urlBar}>
          <Text style={s.urlIcon}>🌐</Text>
          <Text
            style={s.urlInput}
            numberOfLines={1}
            onPress={() => Alert.prompt('Enter URL', 'Enter preview URL', (url) => {
              setInputUrl(url);
              let clean = url.trim();
              if (!clean.startsWith('http')) clean = 'https://' + clean;
              setPreviewUrl(clean);
            }, 'plain-text', inputUrl)}
          >
            {previewUrl}
          </Text>
        </View>
        <TouchableOpacity style={s.goBtn} onPress={loadUrl}>
          <Text style={s.goBtnTxt}>GO</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Viewport Label */}
        <Text style={s.previewLabel}>LIVE PREVIEW</Text>

        {/* Device Frame */}
        <View style={s.deviceOuter}>
          {/* Phone Chrome */}
          <View style={[s.deviceFrame, { width: frameW + 12, height: frameH + 60 }]}>
            {/* Notch */}
            <View style={s.notch} />
            {/* Screen */}
            <View style={[s.screen, { width: frameW, height: frameH }]}>
              <WebView
                source={{ uri: previewUrl }}
                style={{ width: frameW, height: frameH, borderRadius: 8 }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                scalesPageToFit={true}
              />
              {loading && (
                <View style={s.loadingOverlay}>
                  <ActivityIndicator size="large" color={C.gold} />
                </View>
              )}
            </View>
          </View>

          {/* Spec Tags */}
          <View style={s.specRow}>
            <Text style={s.specTxt}>{VIEWPORTS.find(v => v.id === activeViewport).width}px</Text>
            <Text style={s.specSep}>×</Text>
            <Text style={s.specTxt}>{VIEWPORTS.find(v => v.id === activeViewport).height}px</Text>
          </View>
        </View>

        {/* Deploy Button */}
        <View style={s.deploySection}>
          <Text style={s.sectionLabel}>DEPLOY</Text>
          <TouchableOpacity
            style={[s.deployBtn, deployStatus === 'live' && s.deployBtnLive]}
            onPress={triggerDeploy}
            disabled={deployStatus === 'deploying'}
            activeOpacity={0.85}
          >
            {deployStatus === 'deploying' ? (
              <ActivityIndicator size="small" color={C.gold} />
            ) : (
              <Text style={s.deployBtnTxt}>
                {deployStatus === 'live' ? '✓ LIVE DEPLOYED' : '⬆ DEPLOY TO RENDER'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={s.deployHint}>saintsallabs-api.onrender.com · Auto-deploy from GitHub</Text>
        </View>

        {/* Status */}
        <View style={s.statusCard}>
          <View style={s.statusRow}>
            <Text style={s.statusKey}>BACKEND</Text>
            <Text style={s.statusVal}>saintsallabs-api.onrender.com</Text>
          </View>
          <View style={s.statusRow}>
            <Text style={s.statusKey}>FRONTEND</Text>
            <Text style={s.statusVal}>saintsallabs.com · Vercel Edge</Text>
          </View>
          <View style={s.statusRow}>
            <Text style={s.statusKey}>PATENT</Text>
            <Text style={s.statusVal}>#10,290,222 — HACP Protocol™</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 3 },
  headerSub: { fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginTop: 2 },
  deployDot: { width: 10, height: 10, borderRadius: 5 },
  vpRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  vpBtn: {
    flex: 1, alignItems: 'center', gap: 4, padding: 10,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.bgCard,
  },
  vpBtnActive: { borderColor: C.gold, backgroundColor: C.gold + '18' },
  vpIcon: { fontSize: 18 },
  vpLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 1 },
  vpLabelActive: { color: C.gold },
  urlRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  urlBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  urlIcon: { fontSize: 14 },
  urlInput: { flex: 1, fontSize: 12, color: C.textSub },
  goBtn: {
    backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  goBtnTxt: { fontSize: 11, fontWeight: '800', color: C.bg, letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2.5, alignSelf: 'flex-start', marginBottom: 12 },
  deviceOuter: { alignItems: 'center', marginBottom: 20 },
  deviceFrame: {
    backgroundColor: '#1A1A1A', borderRadius: 24,
    borderWidth: 2, borderColor: '#333344',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingTop: 30,
  },
  notch: {
    position: 'absolute', top: 0, left: '50%', marginLeft: -40,
    width: 80, height: 18, backgroundColor: '#111', borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  screen: { borderRadius: 8, overflow: 'hidden', backgroundColor: '#0A0A0A' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.bg + 'CC', alignItems: 'center', justifyContent: 'center',
  },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  specTxt: { fontSize: 11, fontWeight: '700', color: C.textDim, fontFamily: 'monospace' },
  specSep: { fontSize: 11, color: C.textGhost },
  deploySection: { width: '100%', marginBottom: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2.5, marginBottom: 10 },
  deployBtn: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.gold + '60',
    borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center',
  },
  deployBtnLive: { borderColor: '#22C55E', backgroundColor: '#22C55E20' },
  deployBtnTxt: { fontSize: 12, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  deployHint: { fontSize: 10, color: C.textGhost, marginTop: 8, textAlign: 'center' },
  statusCard: {
    width: '100%', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 16, gap: 10,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusKey: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1.5 },
  statusVal: { fontSize: 11, color: C.text, textAlign: 'right', flex: 1, marginLeft: 8 },
});
