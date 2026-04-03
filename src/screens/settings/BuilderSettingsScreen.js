/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER SETTINGS
   Source control, Intelligence mesh, Env vars, Deploy
   Matches: settings.jpg / settings1.html
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const { width: SW } = Dimensions.get('window');

/* ── Intelligence Mesh Models ──────────────── */
const AI_MODELS = [
  { name: 'Claude 3.5 Sonnet', connected: true },
  { name: 'Grok-1 Beta', connected: true },
  { name: 'ElevenLabs Voice', connected: true },
];

/* ── Env Variables ─────────────────────────── */
const ENV_VARS = [
  { key: 'DATABASE_URL', value: 'postgresql://user:••••••••••••' },
  { key: 'NEXT_PUBLIC_API', value: 'https://saintsallabs.com/api/v1' },
  { key: 'CLAUDE_SECRET', value: 'sk-ant-••••••••••••••••••••••' },
  { key: 'WS_ENDPOINT', value: 'wss://sockets.render.com/v2/li' },
];

export default function BuilderSettingsScreen() {
  const router = useRouter();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeIn }]}>
        {/* ═══ Header ═══ */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>📂</Text>
            <Text style={s.headerBrand}>SAINTSAL LABS</Text>
          </View>
          <View style={s.headerRight}>
            <View style={s.liveBadge}>
              <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
              <Text style={s.liveText}>LIVE</Text>
            </View>
            <Text style={{ fontSize: 16, color: C.textDim, marginLeft: 12 }}>📡</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* ═══ Page Title ═══ */}
          <View style={s.titleBlock}>
            <Text style={s.pageTitle}>BUILDER{'\n'}SETTINGS</Text>
            <Text style={s.pageSubtitle}>
              Configuration dashboard for core laboratory environments and deployment nodes.
            </Text>
          </View>

          {/* ═══ SOURCE CONTROL ═══ */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.cardHeaderLeft}>
                <View style={s.ghIcon}>
                  <Text style={{ fontSize: 22 }}>🐙</Text>
                </View>
                <View>
                  <Text style={s.cardTitle}>Source Control</Text>
                  <Text style={s.cardMeta}>Git Integration Active</Text>
                </View>
              </View>
              <View style={s.connectedBadge}>
                <Text style={s.connectedText}>CONNECTED</Text>
              </View>
            </View>

            {/* Repo info */}
            <View style={s.repoBox}>
              <Text style={s.repoName}>saintsal/app-core</Text>
              <Text style={s.repoBranch}>MAIN BRANCH</Text>
            </View>
            <View style={s.repoBars}>
              <View style={[s.repoBarFill, { flex: 3 }]} />
              <View style={[s.repoBarEmpty, { flex: 1 }]} />
            </View>

            {/* Buttons */}
            <View style={s.btnRow}>
              <TouchableOpacity activeOpacity={0.8}>
                <LinearGradient
                  colors={[C.goldBright, C.amber]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.goldBtn}
                >
                  <Text style={s.goldBtnText}>SYNC REPO</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.secondaryBtn}
                onPress={() => router.push('/(stack)/github-console-v3')}
              >
                <Text style={s.secondaryBtnText}>SETTINGS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═══ INTELLIGENCE MESH ═══ */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>INTELLIGENCE MESH</Text>
            <View style={s.modelList}>
              {AI_MODELS.map((model, i) => (
                <View key={i} style={s.modelRow}>
                  <Text style={s.modelName}>{model.name}</Text>
                  <Text style={{ fontSize: 14, color: model.connected ? C.green : C.textGhost }}>
                    {model.connected ? '✅' : '⭕'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ═══ LATENCY + CREDITS ═══ */}
          <View style={s.bentoRow}>
            <View style={[s.bentoCard, { backgroundColor: C.green + '12', borderColor: C.green + '33' }]}>
              <Text style={{ fontSize: 18, color: C.green }}>⚡</Text>
              <Text style={s.bentoLabel}>LATENCY</Text>
              <Text style={[s.bentoValue, { color: C.green }]}>42ms</Text>
            </View>
            <View style={[s.bentoCard, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant + '20' }]}>
              <Text style={{ fontSize: 18, color: C.amber }}>🪙</Text>
              <Text style={s.bentoLabel}>CREDITS</Text>
              <Text style={s.bentoValue}>$12.4k</Text>
            </View>
          </View>

          {/* ═══ ENVIRONMENT RUNTIME ═══ */}
          <View style={s.card}>
            <View style={s.envHeader}>
              <View style={s.envTitleRow}>
                <Text style={{ fontSize: 14, color: C.textDim, marginRight: 6 }}>🔑</Text>
                <Text style={s.envTitle}>ENVIRONMENT RUNTIME</Text>
              </View>
              <Text style={s.envFile}>.env.production</Text>
            </View>

            <View style={s.envList}>
              {ENV_VARS.map((env, i) => (
                <View key={i} style={s.envRow}>
                  <Text style={s.envKey}>{env.key}</Text>
                  <Text style={s.envVal} numberOfLines={1}>{env.value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.editVarsBtn}>
              <Text style={s.editVarsText}>EDIT VARIABLES</Text>
            </TouchableOpacity>
          </View>

          {/* ═══ DEPLOY TARGETS ═══ */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>EDGE DEPLOY</Text>
            <View style={s.deployInfo}>
              <Text style={s.deployName}>Render</Text>
              <Text style={s.deployStatus}>PROD-ACTIVE: v4.12.0</Text>
            </View>
            <TouchableOpacity style={s.deployBtn}>
              <Text style={s.deployBtnText}>LOGS</Text>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>COMPUTE NODE</Text>
            <View style={s.deployInfo}>
              <Text style={s.deployName}>Render</Text>
              <Text style={[s.deployStatus, { color: C.green }]}>WEBSOCKETS: UP (99.9%)</Text>
            </View>
            <TouchableOpacity style={s.deployBtn}>
              <Text style={s.deployBtnText}>RESTART SERVICE</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ═══ STYLES ═══ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 52,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerBrand: { fontSize: 13, fontWeight: '800', color: C.amber, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.surfaceHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: { fontSize: 9, fontWeight: '800', color: C.text, letterSpacing: 1 },

  scroll: { paddingHorizontal: 16 },

  /* Title */
  titleBlock: { marginBottom: 24, marginTop: 8 },
  pageTitle: { fontSize: 34, fontWeight: '900', color: C.text, letterSpacing: -1, lineHeight: 38 },
  pageSubtitle: { fontSize: 13, color: C.textSub + '99', marginTop: 8, lineHeight: 20 },

  /* Card */
  card: {
    backgroundColor: C.surfaceLow, borderRadius: 14, padding: 20, marginBottom: 12,
  },

  /* Source Control */
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ghIcon: {
    width: 44, height: 44, borderRadius: 8, backgroundColor: C.text,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.text },
  cardMeta: { fontSize: 11, color: C.textSub, marginTop: 2 },
  connectedBadge: {
    backgroundColor: C.green + '15', borderWidth: 1, borderColor: C.green + '33',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
  },
  connectedText: { fontSize: 9, fontWeight: '700', color: C.green, letterSpacing: 0.5 },

  repoBox: {
    backgroundColor: C.bgInput, borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: C.outlineVariant + '15',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  repoName: { fontSize: 13, fontFamily: 'monospace', color: C.text },
  repoBranch: { fontSize: 9, fontFamily: 'monospace', color: C.textGhost, letterSpacing: 1 },
  repoBars: { flexDirection: 'row', gap: 4, marginBottom: 20 },
  repoBarFill: { height: 3, backgroundColor: C.green, borderRadius: 2 },
  repoBarEmpty: { height: 3, backgroundColor: C.surfaceHigh, borderRadius: 2 },

  btnRow: { flexDirection: 'row', gap: 10 },
  goldBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  goldBtnText: { fontSize: 10, fontWeight: '900', color: '#000', letterSpacing: 1 },
  secondaryBtn: {
    backgroundColor: C.surfaceHigh, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8,
  },
  secondaryBtnText: { fontSize: 10, fontWeight: '800', color: C.text, letterSpacing: 1 },

  /* Section labels */
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted,
    marginBottom: 16, textTransform: 'uppercase',
  },

  /* Models */
  modelList: { gap: 14 },
  modelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modelName: { fontSize: 14, fontWeight: '500', color: C.text },

  /* Bento */
  bentoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  bentoCard: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, justifyContent: 'center',
  },
  bentoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 8, color: C.textMuted },
  bentoValue: { fontSize: 18, fontWeight: '900', color: C.text, marginTop: 4 },

  /* Env vars */
  envHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.outlineVariant + '15',
  },
  envTitleRow: { flexDirection: 'row', alignItems: 'center' },
  envTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: C.text },
  envFile: { fontSize: 9, fontFamily: 'monospace', color: C.textGhost },
  envList: { backgroundColor: C.bgInput, borderRadius: 8, padding: 14 },
  envRow: {
    flexDirection: 'row', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant + '08',
  },
  envKey: { fontSize: 11, fontFamily: 'monospace', color: C.amber, width: SW * 0.35 },
  envVal: { fontSize: 11, fontFamily: 'monospace', color: C.textGhost, flex: 1 },
  editVarsBtn: { alignItems: 'flex-end', paddingTop: 12 },
  editVarsText: { fontSize: 9, fontWeight: '700', color: C.amber, letterSpacing: 1 },

  /* Deploy */
  deployInfo: { marginBottom: 12 },
  deployName: { fontSize: 17, fontWeight: '700', color: C.text },
  deployStatus: { fontSize: 9, fontFamily: 'monospace', color: C.green, marginTop: 4 },
  deployBtn: {
    backgroundColor: C.surfaceHigh, borderRadius: 6, paddingVertical: 10, alignItems: 'center',
  },
  deployBtnText: { fontSize: 9, fontWeight: '800', color: C.text, letterSpacing: 1.5 },
});
