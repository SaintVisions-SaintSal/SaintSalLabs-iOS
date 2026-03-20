/* ═══════════════════════════════════════════════════
   KINETIC LABS — FILE EXPLORER
   Code editor + syntax highlighting + build log + deploy
   Matches: files.jpg / files1.html
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

/* ── File Tree Data ────────────────────────── */
const FILE_TREE = [
  { type: 'folder', name: 'src', open: true, status: 'SAVED', statusColor: C.green, children: [
    { type: 'file', name: 'App.tsx', icon: '⚛️', lang: 'tsx' },
    { type: 'file', name: 'styles.css', icon: '🎨', lang: 'css', active: true },
    { type: 'file', name: 'main.tsx', icon: '📦', lang: 'tsx' },
  ]},
  { type: 'folder', name: 'assets', open: false },
  { type: 'folder', name: 'api', open: false, pulse: true },
];

/* ── Code Sample (CSS) ─────────────────────── */
const CODE_LINES = [
  { num: 1, code: ':root {', color: '#855300' },
  { num: 2, code: '  --primary: #F59E0B;', color: C.textSub, highlight: '#F59E0B' },
  { num: 3, code: '  --bg: #0F0F0F;', color: C.textSub, highlight: '#0F0F0F', active: true },
  { num: 4, code: '}', color: '#855300' },
  { num: 5, code: '', color: C.textDim },
  { num: 6, code: '.card {', color: '#855300' },
  { num: 7, code: '  background: rgba(19, 19, 19, 0.6);', color: C.textSub, highlight: 'rgba(19, 19, 19, 0.6)' },
  { num: 8, code: '  backdrop-filter: blur(20px);', color: C.textSub, highlight: 'blur(20px)' },
  { num: 9, code: '}', color: C.textSub },
];

/* ── Build Log ─────────────────────────────── */
const BUILD_LOG = [
  { type: 'ok', text: 'Compiling SaintSal_Labs_Builder...' },
  { type: 'ok', text: 'CSS Modules initialized.' },
  { type: 'active', text: '> Pushing to production cluster 01...' },
];

export default function FileExplorerScreen() {
  const router = useRouter();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [deploying, setDeploying] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
          {/* ═══ FILE EXPLORER PANEL ═══ */}
          <View style={s.explorerPanel}>
            <View style={s.explorerHeader}>
              <Text style={s.explorerTitle}>EXPLORER</Text>
              <Text style={{ fontSize: 12, color: C.textDim }}>⇅</Text>
            </View>

            {/* File tree */}
            {FILE_TREE.map((node, i) => (
              <View key={i}>
                <TouchableOpacity style={s.folderRow} activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, color: node.open ? C.amber : C.textDim }}>
                    {node.open ? '📂' : '📁'}
                  </Text>
                  <Text style={s.folderName}>{node.name}</Text>
                  {node.status && (
                    <Text style={[s.folderStatus, { color: node.statusColor }]}>{node.status}</Text>
                  )}
                  {node.pulse && (
                    <Animated.View style={[s.pulseDot, { opacity: pulseAnim }]} />
                  )}
                </TouchableOpacity>

                {/* Children */}
                {node.children && node.open && (
                  <View style={s.childrenWrap}>
                    {node.children.map((child, j) => (
                      <TouchableOpacity
                        key={j}
                        style={[s.fileRow, child.active && s.fileRowActive]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 12 }}>{child.icon}</Text>
                        <Text style={[s.fileName, child.active && { color: C.text }]}>{child.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* New resource button */}
            <View style={s.newResourceWrap}>
              <TouchableOpacity style={s.newResourceBtn}>
                <Text style={s.newResourceIcon}>+</Text>
                <Text style={s.newResourceText}>NEW RESOURCE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═══ NODE STATUS ═══ */}
          <View style={s.nodeStatusCard}>
            <View style={s.nodeHeader}>
              <View>
                <Text style={s.nodeLabel}>NODE STATUS</Text>
                <Text style={s.nodeValue}>98.4%</Text>
              </View>
              <Text style={{ fontSize: 22, color: C.green }}>🗄</Text>
            </View>
            <View style={s.nodeBar}>
              <View style={s.nodeBarFill} />
            </View>
          </View>

          {/* ═══ CODE EDITOR ═══ */}
          <View style={s.editorPanel}>
            {/* Tab bar */}
            <View style={s.editorTabBar}>
              <View style={s.editorTab}>
                <Text style={{ fontSize: 10 }}>🎨</Text>
                <Text style={s.editorTabName}>STYLES.CSS</Text>
                <TouchableOpacity>
                  <Text style={s.editorTabClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={s.editorTabMeta}>
                <Text style={s.metaEncoding}>UTF-8</Text>
                <View style={s.deployingRow}>
                  <Text style={s.deployingText}>DEPLOYING</Text>
                  <Animated.Text style={[s.deployingSpin, { transform: [{ rotate: spin }] }]}>⟳</Animated.Text>
                </View>
              </View>
            </View>

            {/* Code area */}
            <View style={s.codeArea}>
              {CODE_LINES.map((line, i) => (
                <View
                  key={i}
                  style={[s.codeLine, line.active && s.codeLineActive]}
                >
                  <Text style={[s.lineNum, line.active && s.lineNumActive]}>
                    {line.num}
                  </Text>
                  <Text style={[s.lineCode, { color: line.color }]}>
                    {line.code}
                    {line.highlight && (
                      <Text style={{ color: C.amber }}> {/* highlight token */}</Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>

            {/* Build log */}
            <View style={s.buildLog}>
              <View style={s.buildLogHeader}>
                <View style={s.buildLogTitleRow}>
                  <Text style={{ fontSize: 12, color: C.green, marginRight: 6 }}>💻</Text>
                  <Text style={s.buildLogTitle}>BUILD LOG</Text>
                </View>
                <Text style={s.buildLogTime}>14:23:01</Text>
              </View>
              {BUILD_LOG.map((entry, i) => (
                <Text key={i} style={s.logLine}>
                  {entry.type === 'ok' && <Text style={s.logOk}>[OK] </Text>}
                  <Text style={entry.type === 'active' ? s.logActive : s.logText}>
                    {entry.text}
                  </Text>
                </Text>
              ))}
            </View>
          </View>

          {/* ═══ FOOTER STATUS BAR ═══ */}
          <View style={s.footerBar}>
            <View style={s.footerLeft}>
              <View style={s.footerItem}>
                <Text style={{ fontSize: 10, color: C.green }}>✓</Text>
                <Text style={s.footerText}>SYNCED</Text>
              </View>
              <View style={s.footerItem}>
                <Text style={{ fontSize: 10, color: C.amber }}>🕐</Text>
                <Text style={s.footerText}>V1.2.4-STABLE</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={[C.goldBright, C.amber]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.commitBtn}
              >
                <Text style={s.commitBtnText}>COMMIT CHANGES</Text>
              </LinearGradient>
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

  /* Explorer */
  explorerPanel: {
    backgroundColor: C.surfaceLow, borderRadius: 14, padding: 18, marginBottom: 12,
  },
  explorerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  explorerTitle: { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: 0.5 },

  folderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 8,
    borderRadius: 8,
  },
  folderName: { fontSize: 13, fontWeight: '500', color: C.text, flex: 1 },
  folderStatus: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },

  childrenWrap: {
    marginLeft: 28, borderLeftWidth: 1, borderLeftColor: C.outlineVariant + '25', paddingLeft: 12,
  },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8,
  },
  fileRowActive: { backgroundColor: C.surfaceHighest + '80' },
  fileName: { fontSize: 12, color: C.textSub },

  newResourceWrap: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.outlineVariant + '20' },
  newResourceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.surfaceHighest, borderRadius: 8, paddingVertical: 12,
  },
  newResourceIcon: { fontSize: 14, fontWeight: '800', color: C.text },
  newResourceText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: C.text },

  /* Node status */
  nodeStatusCard: {
    backgroundColor: C.surfaceLow, borderRadius: 14, padding: 18, marginBottom: 12,
    borderLeftWidth: 2, borderLeftColor: C.amber,
  },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  nodeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textDim, marginBottom: 4 },
  nodeValue: { fontSize: 20, fontWeight: '900', color: C.amber },
  nodeBar: { height: 3, backgroundColor: C.surfaceHighest, borderRadius: 2, overflow: 'hidden' },
  nodeBarFill: { height: 3, width: '98.4%', backgroundColor: C.green, borderRadius: 2 },

  /* Editor */
  editorPanel: {
    backgroundColor: C.bgInput, borderRadius: 14, overflow: 'hidden', marginBottom: 12,
  },
  editorTabBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.surfaceLow, paddingHorizontal: 16, height: 40,
  },
  editorTab: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editorTabName: { fontSize: 10, fontWeight: '700', color: C.text, letterSpacing: 0.5 },
  editorTabClose: { fontSize: 10, color: C.textGhost, marginLeft: 8 },
  editorTabMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaEncoding: { fontSize: 9, color: C.textGhost, letterSpacing: 0.5 },
  deployingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deployingText: { fontSize: 9, fontWeight: '700', color: C.green, letterSpacing: 1 },
  deployingSpin: { fontSize: 14, color: C.green },

  /* Code */
  codeArea: { padding: 16 },
  codeLine: {
    flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 4, marginBottom: 1,
  },
  codeLineActive: { backgroundColor: C.surfaceHigh + '50' },
  lineNum: { width: 24, fontSize: 12, color: C.textGhost + '44', fontFamily: 'monospace', textAlign: 'right', marginRight: 16 },
  lineNumActive: { color: C.amber },
  lineCode: { fontSize: 12, fontFamily: 'monospace', flex: 1 },

  /* Build log */
  buildLog: {
    backgroundColor: C.surfaceLow + 'CC', margin: 16, borderRadius: 10, padding: 14,
    borderLeftWidth: 1, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  buildLogHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  buildLogTitleRow: { flexDirection: 'row', alignItems: 'center' },
  buildLogTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: C.textMuted },
  buildLogTime: { fontSize: 8, color: C.textGhost },
  logLine: { marginBottom: 4 },
  logOk: { fontSize: 11, fontFamily: 'monospace', color: C.green },
  logText: { fontSize: 11, fontFamily: 'monospace', color: C.textSub },
  logActive: { fontSize: 11, fontFamily: 'monospace', color: C.amber },

  /* Footer */
  footerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.surfaceLow, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  footerLeft: { flexDirection: 'row', gap: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 8, fontWeight: '700', color: C.textMuted, letterSpacing: 0.5 },
  commitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 },
  commitBtnText: { fontSize: 9, fontWeight: '900', color: '#000', letterSpacing: 1 },
});
