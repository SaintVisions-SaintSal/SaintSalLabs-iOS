/* ═══════════════════════════════════════════════════
   SAINTSALLABS — MOBILE IDE SCREEN
   Pure mobile code editor with gold branding
   Converted from saintsal_builder_mobile_ide_2.html
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { C } from '../../config/theme';

/* ── File Tabs ────────────────────────────────────── */
const FILES = [
  { id: 'app', name: 'App.tsx', icon: '⚛' },
  { id: 'css', name: 'global.css', icon: '🎨' },
  { id: 'log', name: 'output.log', icon: '▸' },
];

/* ── Code Content Per File ────────────────────────── */
const FILE_CONTENTS = {
  app: `import React from 'react';
import { motion } from 'framer-motion';

export const App = () => {
  return (
    <div className="bg-black min-h-screen">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-neon-gold"
      >
        SaintSal Elite Builder
      </motion.h1>
      <p>Building the future...</p>
    </div>
  );
};`,
  css: `:root {
  --gold: #F59E0B;
  --bg: #0C0C0F;
  --card: #111116;
}

body {
  background: var(--bg);
  color: #E8E6E1;
  font-family: 'Space Grotesk', sans-serif;
}

.text-neon-gold {
  color: var(--gold);
  text-shadow: 0 0 20px rgba(245,158,11,0.5);
}`,
  log: `[12:41:02] Compiling...
[12:41:03] ✓ Compiled successfully in 1.2s
[12:41:03] Server running at http://localhost:3000
[12:41:05] GET / 200 in 12ms
[12:41:06] HMR connected
[12:41:08] GET /api/health 200 in 4ms`,
};

/* ── Quick Keys ───────────────────────────────────── */
const QUICK_KEYS = ['<', '>', '/', '{', '}', '[', ']', ';', '=', '"'];

/* ── Bottom Nav Items ─────────────────────────────── */
const NAV_ITEMS = [
  { id: 'build', icon: '⟨⟩', label: 'Build', active: true },
  { id: 'files', icon: '📁', label: 'Files', active: false },
  { id: 'analytics', icon: '📊', label: 'Analytics', active: false },
  { id: 'account', icon: '👤', label: 'Account', active: false },
];

export default function MobileIDEScreen() {
  const [activeFile, setActiveFile] = useState('app');
  const [activeNav, setActiveNav] = useState('build');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const code = FILE_CONTENTS[activeFile] || '';
  const lines = code.split('\n');

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoBadge}>
            <Text style={s.logoText}>⚡</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>HACP V2.1 <Text style={{ color: C.green }}>Active</Text></Text>
            <Text style={s.headerSubtitle}>NEURAL ENGINE: <Text style={{ color: C.amber }}>OPTIMIZED</Text></Text>
          </View>
        </View>
        <View style={s.latencyBadge}>
          <Animated.View style={[s.latencyDot, { opacity: pulseAnim }]} />
          <Text style={s.latencyText}>LATENCY: 12ms</Text>
        </View>
      </View>

      {/* File Selector + Meta */}
      <View style={s.fileMeta}>
        <View style={s.fileSelector}>
          {FILES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[s.fileChip, activeFile === f.id && s.fileChipActive]}
              onPress={() => setActiveFile(f.id)}
            >
              <Text style={s.fileChipIcon}>{f.icon}</Text>
              <Text style={[s.fileChipName, activeFile === f.id && { color: C.amber }]}>
                {f.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.metaRow}>
          <TouchableOpacity style={s.metaBtn}>
            <Text style={{ color: C.amberDim, fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.metaBtn}>
            <Text style={{ color: C.amberDim, fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* File Tabs Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabBar}
        contentContainerStyle={s.tabContent}
      >
        {FILES.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[s.tab, activeFile === f.id && s.tabActive]}
            onPress={() => setActiveFile(f.id)}
          >
            <Text style={s.tabIcon}>{f.icon}</Text>
            <Text style={[s.tabLabel, activeFile === f.id && s.tabLabelActive]}>
              {f.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Code Editor */}
      <ScrollView style={s.codeScroll} showsVerticalScrollIndicator={false}>
        <View style={s.codeWrap}>
          {/* Line Numbers */}
          <View style={s.lineCol}>
            {lines.map((_, i) => (
              <Text key={i} style={s.lineNum}>{i + 1}</Text>
            ))}
          </View>
          {/* Code Content */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={s.codeText} selectable>{code}</Text>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Quick Keys Accessory Bar */}
      <View style={s.quickBar}>
        <View style={s.quickKeys}>
          {QUICK_KEYS.map((k) => (
            <TouchableOpacity key={k} style={s.quickKey} activeOpacity={0.6}>
              <Text style={s.quickKeyText}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.undoBtn}>
          <Text style={{ color: C.amber, fontSize: 14 }}>↩</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Buttons */}
      <View style={s.fabRow}>
        <TouchableOpacity style={s.runBtn} activeOpacity={0.85}>
          <Text style={s.runIcon}>▶</Text>
          <Text style={s.runLabel}>RUN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pushBtn} activeOpacity={0.85}>
          <Text style={{ fontSize: 14 }}>🚀</Text>
          <Text style={s.pushLabel}>PUSH LIVE</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={s.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={s.navItem}
            onPress={() => setActiveNav(item.id)}
          >
            <Text style={[s.navIcon, activeNav === item.id && { color: C.amber }]}>
              {item.icon}
            </Text>
            <Text style={[s.navLabel, activeNav === item.id && { color: C.amber }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.amberGhost,
    backgroundColor: C.bg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amberDim + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 16 },
  headerTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: C.amber, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 9, fontWeight: '600', color: C.amberDim + '88', textTransform: 'uppercase' },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  latencyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  latencyText: { fontSize: 9, fontWeight: '700', color: C.amberDim, letterSpacing: -0.3 },

  /* File Selector */
  fileMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.amberGhost,
  },
  fileSelector: { flexDirection: 'row', gap: 6, flex: 1 },
  fileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.amberGhost,
  },
  fileChipActive: { backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amberDim + '44' },
  fileChipIcon: { fontSize: 10 },
  fileChipName: { fontSize: 11, fontWeight: '600', color: C.textDim },
  metaRow: { flexDirection: 'row', gap: 10, marginLeft: 8 },
  metaBtn: { padding: 4 },

  /* Tab Bar */
  tabBar: {
    maxHeight: 40, borderBottomWidth: 1, borderBottomColor: C.amberGhost,
    backgroundColor: C.bg,
  },
  tabContent: { paddingHorizontal: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.amber },
  tabIcon: { fontSize: 12 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: C.amberDim + '66' },
  tabLabelActive: { color: C.amber, fontWeight: '700' },

  /* Code Editor */
  codeScroll: { flex: 1, backgroundColor: C.bg, padding: 16 },
  codeWrap: { flexDirection: 'row' },
  lineCol: { marginRight: 16, alignItems: 'flex-end' },
  lineNum: {
    fontSize: 13, lineHeight: 22, fontFamily: 'monospace',
    color: C.amberDim + '33',
  },
  codeText: {
    fontSize: 13, lineHeight: 22, fontFamily: 'monospace',
    color: '#C8D3F5',
  },

  /* Quick Keys */
  quickBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 6, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: C.amberDim + '33',
    borderBottomWidth: 1, borderBottomColor: C.amberDim + '33',
    backgroundColor: '#1A1A1A',
  },
  quickKeys: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', gap: 4 },
  quickKey: {
    flex: 1, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, backgroundColor: C.amberGhost,
  },
  quickKeyText: { fontSize: 14, fontWeight: '700', color: C.amber },
  undoBtn: {
    width: 40, height: 36, borderRadius: 6,
    backgroundColor: C.amberDim + '33', marginLeft: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  /* FABs */
  fabRow: {
    flexDirection: 'row', gap: 16, justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  runBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 999,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.amberDim + '55',
  },
  runIcon: { fontSize: 14, color: C.amber },
  runLabel: { fontSize: 14, fontWeight: '800', color: C.amber },
  pushBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 999,
    backgroundColor: C.amber,
    shadowColor: C.amber, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14,
  },
  pushLabel: { fontSize: 14, fontWeight: '800', color: '#000' },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 10, paddingBottom: 6,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 18, color: C.amberDim + '66' },
  navLabel: {
    fontSize: 9, fontWeight: '800', letterSpacing: 1.2,
    color: C.amberDim + '66', textTransform: 'uppercase',
  },
});
