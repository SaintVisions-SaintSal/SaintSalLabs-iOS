/* ═══════════════════════════════════════════════════
   SAINTSALLABS — VOICE AI (ElevenLabs Conversational Agent)
   White-Label SaintSal™ Voice · 17 Languages
   WebSocket via ElevenLabs ConvAI · BAA Compliant
   Agent: agent_5401k855rq5afqprn6vd3mh6sn7z
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { MCP_BASE, MCP_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const AGENT_ID = 'agent_5401k855rq5afqprn6vd3mh6sn7z';

/* ── Build the HTML page that hosts the ElevenLabs ConvAI widget ── */
function buildVoiceHTML(signedUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SaintSal Voice AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0A0A0A;
      color: #E8E6E1;
      font-family: -apple-system, 'SF Pro Display', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .status {
      text-align: center;
      padding: 20px;
    }
    .status h2 {
      font-size: 18px;
      font-weight: 800;
      color: #D4AF37;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .status p {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
    }
    .pulse-ring {
      width: 120px;
      height: 120px;
      border-radius: 60px;
      border: 2px solid rgba(212,175,55,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 30px auto;
      animation: pulse 2s ease-in-out infinite;
    }
    .pulse-ring-inner {
      width: 80px;
      height: 80px;
      border-radius: 40px;
      background: rgba(212,175,55,0.1);
      border: 1px solid rgba(212,175,55,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.7; }
    }
    /* Hide the default ElevenLabs widget launcher button */
    elevenlabs-convai {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      z-index: 9999 !important;
    }
  </style>
</head>
<body>
  <div class="status">
    <div class="pulse-ring">
      <div class="pulse-ring-inner">🎤</div>
    </div>
    <h2>SAL™ VOICE AI</h2>
    <p>Tap the microphone below to start<br>a voice conversation with SAL</p>
    <p style="margin-top: 12px; font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 1px;">
      17 LANGUAGES · ELEVENLABS · HACP™ PROTOCOL
    </p>
  </div>

  <elevenlabs-convai agent-id="${AGENT_ID}"></elevenlabs-convai>
  <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
</body>
</html>`;
}

export default function VoiceAIScreen() {
  const router = useRouter();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerBrand}>
            <Image
              source={require('../../../assets/logo-80.png')}
              style={{ width: 24, height: 24, borderRadius: 12 }}
              resizeMode="contain"
            />
            <Text style={s.headerTitle}>Voice AI</Text>
          </View>
          <Text style={s.headerSub}>ELEVENLABS · 17 LANGUAGES · LIVE</Text>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      {/* WebView with ElevenLabs ConvAI widget */}
      <View style={s.webviewWrap}>
        {loading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator color={GOLD} size="large" />
            <Text style={s.loadingText}>Connecting to Voice AI...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: buildVoiceHTML() }}
          style={{ flex: 1, backgroundColor: BG }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          onLoadEnd={() => setLoading(false)}
          onError={(e) => console.warn('[VoiceAI] WebView error:', e.nativeEvent)}
        />
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>
          SaintSal™ LABS · Responsible Intelligence · Patent #10,290,222
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 4, marginRight: 8 },
  backTxt: { fontSize: 24, color: '#E8E6E1', fontWeight: '300' },
  headerCenter: { flex: 1 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#E8E6E1', letterSpacing: -0.3 },
  headerSub: {
    fontSize: 8, fontWeight: '700', letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.3)', marginTop: 2, marginLeft: 32,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },

  webviewWrap: { flex: 1, position: 'relative' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG, alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 12 },

  footer: {
    paddingVertical: 8, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  footerText: { fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 },
});
