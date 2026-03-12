/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER DEPLOY SCREEN
   Deployment flow with platform selection, env config,
   build logs, and domain management
   Converted from builder_deployment.html
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { C } from '../../config/theme';
import { SALMark } from '../../components';

/* ── Deploy Targets ───────────────────────────────── */
const TARGETS = [
  { id: 'vercel', label: 'Vercel (Primary)', icon: '⚡', desc: 'Edge functions & static assets' },
  { id: 'render', label: 'Render (WS/Paid)', icon: '🖥', desc: 'WebSockets & background jobs' },
  { id: 'cloudflare', label: 'Cloudflare', icon: '☁️', desc: 'Workers & D1 database' },
];

/* ── Status Cards ─────────────────────────────────── */
const STATUS_CARDS = [
  { label: 'Current Status', value: 'Healthy', detail: 'Last sync: 2 mins ago', icon: '●', iconColor: C.green },
  { label: 'Active Environment', value: 'Production', detail: 'vercel-sausal-main-34', icon: '✓', iconColor: C.amber },
  { label: 'API Latency', value: '42ms', detail: 'Optimized via Edge', icon: '⚡', iconColor: C.amber },
];

/* ── API Stitching Config ─────────────────────────── */
const API_KEYS = [
  { id: 'claude', label: 'Claude (Anthropic)', placeholder: 'sk-ant-api03-xxxx', masked: true },
  { id: 'grok', label: 'Grok (xAI)', placeholder: 'Enter xAI API Key', masked: false },
  { id: 'eleven', label: 'ElevenLabs (Voice)', placeholder: 'xi-apiKey-xxxx', masked: true },
  { id: 'google', label: 'Google Stitch (Search)', placeholder: 'G-Cloud Project ID', masked: false },
];

/* ── Demo Build Log ───────────────────────────────── */
const BUILD_LOG = [
  { time: '12:41:02', msg: 'Build started...', type: 'info' },
  { time: '12:41:03', msg: 'Installing dependencies (npm ci)', type: 'info' },
  { time: '12:41:08', msg: 'Dependencies installed (1,247 packages)', type: 'success' },
  { time: '12:41:09', msg: 'Building production bundle...', type: 'info' },
  { time: '12:41:14', msg: '✓ Compiled successfully in 4.8s', type: 'success' },
  { time: '12:41:15', msg: 'Deploying to Vercel Edge Network...', type: 'info' },
  { time: '12:41:19', msg: '✓ Deployment live at app.saintsal.build', type: 'success' },
];

export default function BuilderDeployScreen({ navigation }) {
  const [activeTarget, setActiveTarget] = useState('vercel');
  const [showLogs, setShowLogs] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const handleDeploy = () => {
    setDeploying(true);
    setShowLogs(true);
    setTimeout(() => setDeploying(false), 3000);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={{ color: C.amber, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>SaintSal Builder</Text>
            <Text style={s.headerSubtitle}>DEPLOYMENT & API SETTINGS</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={s.logsBtn}
            onPress={() => setShowLogs(!showLogs)}
          >
            <Text style={{ fontSize: 12 }}>📋</Text>
            <Text style={s.logsBtnText}>Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pushLiveBtn} onPress={handleDeploy} activeOpacity={0.8}>
            <Text style={{ fontSize: 12 }}>🚀</Text>
            <Text style={s.pushLiveText}>Push Live</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Dashboard */}
        <View style={s.statusGrid}>
          {STATUS_CARDS.map((card) => (
            <View key={card.label} style={s.statusCard}>
              <Text style={s.statusLabel}>{card.label}</Text>
              <View style={s.statusValueRow}>
                <Animated.Text style={[s.statusIcon, { color: card.iconColor, opacity: card.iconColor === C.green ? pulseAnim : 1 }]}>
                  {card.icon}
                </Animated.Text>
                <Text style={s.statusValue}>{card.value}</Text>
              </View>
              <Text style={s.statusDetail}>{card.detail}</Text>
            </View>
          ))}
        </View>

        {/* Deploy Targets */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={{ fontSize: 14 }}>📦</Text>
            <Text style={s.sectionTitle}>Deploy Targets</Text>
          </View>

          <View style={s.targetBar}>
            {TARGETS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[s.targetBtn, activeTarget === t.id && s.targetBtnActive]}
                onPress={() => setActiveTarget(t.id)}
              >
                <Text style={s.targetIcon}>{t.icon}</Text>
                <Text style={[s.targetLabel, activeTarget === t.id && s.targetLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.targetDesc}>
            {TARGETS.find(t => t.id === activeTarget)?.desc}. WebSockets will failover to Render automatically if latency exceeds 200ms.
          </Text>
        </View>

        {/* GitHub Integration */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={{ fontSize: 14 }}>▸</Text>
            <Text style={s.sectionTitle}>GitHub Integration</Text>
            <View style={s.connectedBadge}>
              <Text style={s.connectedText}>Connected</Text>
            </View>
          </View>

          <View style={s.githubCard}>
            <View style={s.githubLogo}>
              <SALMark size={40} />
            </View>
            <View style={s.githubInfo}>
              <Text style={s.repoName}>saintsal-org/builder-core</Text>
              <Text style={s.repoBranch}>
                Branch: <Text style={{ color: C.amber, fontFamily: 'monospace' }}>main</Text> · Auto-deploy enabled
              </Text>
            </View>
          </View>
        </View>

        {/* API Stitching */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={{ fontSize: 14 }}>🔗</Text>
            <Text style={s.sectionTitle}>API Stitching</Text>
          </View>

          <View style={s.apiGrid}>
            {API_KEYS.map((api) => (
              <View key={api.id} style={s.apiField}>
                <Text style={s.apiLabel}>{api.label}</Text>
                <View style={s.apiInputWrap}>
                  <TextInput
                    style={s.apiInput}
                    placeholder={api.placeholder}
                    placeholderTextColor={C.textGhost}
                    secureTextEntry={api.masked}
                    editable={false}
                    value={api.masked ? '••••••••••••••' : ''}
                  />
                  <Text style={s.apiInputIcon}>{api.masked ? '👁' : '🔑'}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.saveBtn} activeOpacity={0.8}>
            <Text style={s.saveBtnText}>Save Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* Domain Management */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={{ fontSize: 14 }}>🌐</Text>
            <Text style={s.sectionTitle}>Domain Management</Text>
          </View>

          <View style={s.domainCard}>
            <View style={s.domainRow}>
              <View style={s.domainLeft}>
                <View style={s.domainIcon}>
                  <Text style={{ color: C.amber, fontSize: 12 }}>🔗</Text>
                </View>
                <Text style={s.domainName}>app.saintsal.build</Text>
              </View>
              <View style={s.domainRight}>
                <Text style={s.domainActive}>Active</Text>
                <Text style={{ color: C.textDim, fontSize: 14 }}>⚙️</Text>
              </View>
            </View>
            <View style={s.domainAdd}>
              <View style={s.domainAddLeft}>
                <View style={[s.domainIcon, { backgroundColor: C.bgElevated }]}>
                  <Text style={{ color: C.textDim, fontSize: 12 }}>+</Text>
                </View>
                <Text style={s.domainAddText}>Add custom domain...</Text>
              </View>
              <TouchableOpacity style={s.configureBtn}>
                <Text style={s.configureBtnText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Build Logs (Expandable) */}
        {showLogs && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={{ fontSize: 14 }}>📋</Text>
              <Text style={s.sectionTitle}>Build Logs</Text>
              {deploying && (
                <View style={s.buildingBadge}>
                  <Text style={s.buildingText}>Building...</Text>
                </View>
              )}
            </View>

            <View style={s.logCard}>
              {BUILD_LOG.map((entry, i) => (
                <View key={i} style={s.logRow}>
                  <Text style={s.logTime}>{entry.time}</Text>
                  <Text style={[
                    s.logMsg,
                    entry.type === 'success' && { color: C.green },
                    entry.type === 'error' && { color: C.red },
                  ]}>
                    {entry.msg}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>🏗</Text>
          <Text style={s.navLabel}>Builder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.navItem, s.navItemActive]}>
          <Text style={[s.navIcon, { color: C.amber }]}>🚀</Text>
          <Text style={[s.navLabel, { color: C.amber }]}>Deploy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>📂</Text>
          <Text style={s.navLabel}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>⚙️</Text>
          <Text style={s.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.amberDim + '33',
    backgroundColor: '#161616',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 9, fontWeight: '700', color: C.amber, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  logsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amberDim + '44',
  },
  logsBtnText: { fontSize: 12, fontWeight: '700', color: C.amber },
  pushLiveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.amber,
    shadowColor: C.amber, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  pushLiveText: { fontSize: 12, fontWeight: '800', color: '#000' },

  /* Scroll */
  scroll: { flex: 1 },

  /* Status Grid */
  statusGrid: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 16,
  },
  statusCard: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.gold + '22',
  },
  statusLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase' },
  statusValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusIcon: { fontSize: 12 },
  statusValue: { fontSize: 16, fontWeight: '800', color: C.text },
  statusDetail: { fontSize: 10, color: C.textDim, marginTop: 4 },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },

  /* Deploy Targets */
  targetBar: {
    flexDirection: 'column', gap: 8,
    padding: 6, borderRadius: 12,
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.border,
  },
  targetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
  },
  targetBtnActive: {
    backgroundColor: C.gold,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  targetIcon: { fontSize: 14 },
  targetLabel: { fontSize: 13, fontWeight: '700', color: C.textDim },
  targetLabelActive: { color: '#000' },
  targetDesc: { fontSize: 13, color: C.textDim, marginTop: 10, lineHeight: 20 },

  /* GitHub */
  githubCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 12,
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.border,
  },
  githubLogo: {
    width: 52, height: 52, borderRadius: 12,
    borderWidth: 1, borderColor: C.gold + '33',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  githubInfo: { flex: 1 },
  repoName: { fontSize: 15, fontWeight: '700', color: C.text },
  repoBranch: { fontSize: 12, color: C.textDim, marginTop: 3 },
  connectedBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
    backgroundColor: C.greenGhost, borderWidth: 1, borderColor: C.green + '33',
  },
  connectedText: { fontSize: 9, fontWeight: '800', color: C.green, textTransform: 'uppercase' },

  /* API Stitching */
  apiGrid: { gap: 14 },
  apiField: {},
  apiLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  apiInputWrap: { position: 'relative' },
  apiInput: {
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: C.amber, fontSize: 14,
  },
  apiInputIcon: { position: 'absolute', right: 14, top: 12, fontSize: 14 },
  saveBtn: {
    alignSelf: 'flex-end', marginTop: 14,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.amberDim + '44',
    shadowColor: C.amber, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: C.amber },

  /* Domains */
  domainCard: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#161616', borderWidth: 1, borderColor: C.border,
  },
  domainRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  domainLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  domainIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center',
  },
  domainName: { fontSize: 13, fontFamily: 'monospace', color: C.text },
  domainRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  domainActive: { fontSize: 11, fontWeight: '800', color: C.green, textTransform: 'uppercase' },
  domainAdd: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, backgroundColor: C.bgCard,
  },
  domainAddLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  domainAddText: { fontSize: 13, color: C.textDim, fontStyle: 'italic' },
  configureBtn: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: C.amberDim + '33',
  },
  configureBtnText: { fontSize: 11, fontWeight: '700', color: C.amber },

  /* Build Logs */
  logCard: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#0A0A0D', borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  logRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  logTime: { fontSize: 11, fontFamily: 'monospace', color: C.textDim },
  logMsg: { fontSize: 11, fontFamily: 'monospace', color: C.textSub, flex: 1 },
  buildingBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amberDim + '44',
  },
  buildingText: { fontSize: 9, fontWeight: '800', color: C.amber },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 10, paddingBottom: 6,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navItemActive: {},
  navIcon: { fontSize: 18, color: C.textDim },
  navLabel: {
    fontSize: 9, fontWeight: '800', letterSpacing: 0.8,
    color: C.textDim, textTransform: 'uppercase',
  },
});
