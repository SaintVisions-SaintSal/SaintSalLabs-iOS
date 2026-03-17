/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — BUILDER VIEWPORT SIMULATOR V2
   builder_viewport_simulator — WebView live preview
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VIEWPORTS = [
  { id: 'mobile', label: 'Mobile', icon: '📱', width: 390, height: 844 },
  { id: 'tablet', label: 'Tablet', icon: '📲', width: 768, height: 1024 },
  { id: 'desktop', label: 'Desktop', icon: '🖥️', width: 1440, height: 900 },
];

const PRESET_URLS = [
  { label: 'SaintSal Labs', url: 'https://saintsallabs.com' },
  { label: 'SaintSal Web App', url: 'https://saintsallabs-web.vercel.app' },
  { label: 'SaintSal API', url: 'https://saintsallabs-api.onrender.com/health' },
  { label: 'Google', url: 'https://google.com' },
];

export default function BuilderViewport() {
  const router = useRouter();
  const webViewRef = useRef(null);
  const [url, setUrl] = useState('https://saintsallabs.com');
  const [inputUrl, setInputUrl] = useState('https://saintsallabs.com');
  const [activeViewport, setActiveViewport] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const viewport = VIEWPORTS.find(v => v.id === activeViewport) || VIEWPORTS[0];
  const scale = activeViewport === 'mobile' ? 1 : activeViewport === 'tablet' ? 0.7 : 0.45;

  const navigate = () => {
    let targetUrl = inputUrl.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    setUrl(targetUrl);
  };

  const refresh = () => webViewRef.current?.reload();
  const goBack = () => canGoBack && webViewRef.current?.goBack();
  const goForward = () => canGoForward && webViewRef.current?.goForward();

  const share = () => {
    Alert.alert('Share Preview', `Share this URL: ${url}`);
  };

  const deploy = () => {
    Alert.alert(
      'Deploy',
      'Deploy the current preview to production?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deploy to Vercel', onPress: () => Alert.alert('Deploying', 'Deployment initiated!') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Builder Viewport</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={share}>
            <Text style={styles.headerActionIcon}>⬆</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerActionBtn, styles.deployBtn]} onPress={deploy}>
            <Text style={styles.deployBtnText}>DEPLOY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Viewport switcher */}
      <View style={styles.viewportRow}>
        {VIEWPORTS.map((vp) => (
          <TouchableOpacity
            key={vp.id}
            style={[styles.viewportBtn, activeViewport === vp.id && styles.viewportBtnActive]}
            onPress={() => setActiveViewport(vp.id)}
          >
            <Text style={styles.viewportIcon}>{vp.icon}</Text>
            <Text style={[styles.viewportLabel, activeViewport === vp.id && styles.viewportLabelActive]}>
              {vp.label}
            </Text>
            <Text style={styles.viewportDims}>{vp.width}×{vp.height}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* URL bar */}
      <View style={styles.urlBar}>
        <TouchableOpacity onPress={goBack} disabled={!canGoBack}>
          <Text style={[styles.navIcon, !canGoBack && styles.navIconDisabled]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goForward} disabled={!canGoForward}>
          <Text style={[styles.navIcon, !canGoForward && styles.navIconDisabled]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={refresh}>
          <Text style={styles.navIcon}>{loading ? '⏳' : '↻'}</Text>
        </TouchableOpacity>
        <View style={styles.urlInputWrapper}>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={navigate}
            returnKeyType="go"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity onPress={navigate} style={styles.goBtn}>
          <Text style={styles.goBtnText}>GO</Text>
        </TouchableOpacity>
      </View>

      {/* Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        <View style={styles.presetsRow}>
          {PRESET_URLS.map((p) => (
            <TouchableOpacity
              key={p.url}
              style={[styles.presetBtn, url === p.url && styles.presetBtnActive]}
              onPress={() => { setInputUrl(p.url); setUrl(p.url); }}
            >
              <Text style={[styles.presetBtnText, url === p.url && styles.presetBtnTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* WebView */}
      <View style={[styles.webViewContainer, isZoomed && styles.webViewContainerZoomed]}>
        <View style={styles.viewportFrame}>
          <View style={styles.viewportHeader}>
            <View style={styles.windowDots}>
              <View style={[styles.dot, { backgroundColor: '#f87171' }]} />
              <View style={[styles.dot, { backgroundColor: GOLD }]} />
              <View style={[styles.dot, { backgroundColor: '#4ade80' }]} />
            </View>
            <Text style={styles.frameUrl} numberOfLines={1}>{url}</Text>
            <TouchableOpacity onPress={() => setIsZoomed(!isZoomed)}>
              <Text style={styles.zoomIcon}>{isZoomed ? '⊡' : '⊞'}</Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={(state) => {
              setCanGoBack(state.canGoBack);
              setCanGoForward(state.canGoForward);
              setCurrentTitle(state.title);
              setInputUrl(state.url);
            }}
            allowsBackForwardNavigationGestures
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            userAgent={activeViewport === 'mobile'
              ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
              : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
          />
        </View>
      </View>

      {/* Bottom info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText} numberOfLines={1}>{currentTitle || 'Loading...'}</Text>
        <View style={styles.infoRight}>
          <View style={[styles.infoStatusDot, { backgroundColor: loading ? GOLD : '#4ade80' }]} />
          <Text style={styles.infoStatus}>{loading ? 'LOADING' : 'READY'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerActionBtn: { padding: 8 },
  headerActionIcon: { color: MUTED, fontSize: 18 },
  deployBtn: { backgroundColor: GOLD, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  deployBtnText: { color: BLACK, fontWeight: '800', fontSize: 11, fontFamily: 'PublicSans-ExtraBold' },
  viewportRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  viewportBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE, gap: 2,
  },
  viewportBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  viewportIcon: { fontSize: 18 },
  viewportLabel: { color: MUTED, fontSize: 11, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  viewportLabelActive: { color: GOLD },
  viewportDims: { color: 'rgba(100,116,139,1)', fontSize: 9, fontFamily: 'PublicSans-Regular' },
  urlBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  navIcon: { color: GOLD, fontSize: 18, padding: 4 },
  navIconDisabled: { opacity: 0.3 },
  urlInputWrapper: {
    flex: 1, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  urlInput: { color: '#fff', fontSize: 12, fontFamily: 'PublicSans-Regular' },
  goBtn: { backgroundColor: GOLD_DIM, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: `${GOLD}33` },
  goBtnText: { color: GOLD, fontWeight: '700', fontSize: 11, fontFamily: 'PublicSans-Bold' },
  presetScroll: { paddingLeft: 12, paddingVertical: 8, maxHeight: 44 },
  presetsRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  presetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  presetBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  presetBtnText: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  presetBtnTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  webViewContainer: { flex: 1, margin: 12 },
  webViewContainerZoomed: { margin: 0 },
  viewportFrame: { flex: 1, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  viewportHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  windowDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  frameUrl: { flex: 1, color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  zoomIcon: { color: GOLD, fontSize: 18 },
  webView: { flex: 1 },
  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: '#0A0A0A',
  },
  infoText: { flex: 1, color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  infoRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoStatusDot: { width: 6, height: 6, borderRadius: 3 },
  infoStatus: { color: MUTED, fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
});
