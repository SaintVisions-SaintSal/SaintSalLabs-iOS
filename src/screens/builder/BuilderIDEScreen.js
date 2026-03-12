/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER IDE SCREEN
   Chat + Code split view with Run/Deploy actions
   Converted from saintsal_builder_ide.html
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated, ActivityIndicator,
} from 'react-native';
import { C, SYS } from '../../config/theme';
import { SALMark, ChatBubble, InputBar } from '../../components';
import { streamBuilder } from '../../lib/api';

/* ── Mode Tabs ────────────────────────────────────── */
const MODES = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'code', label: 'Code', icon: '⟨⟩' },
  { id: 'preview', label: 'Preview', icon: '👁' },
];

/* ── Connectivity Bar Items ───────────────────────── */
const CONNECTIONS = [
  { label: 'Claude', status: 'Online', color: C.amber },
  { label: 'Grok', status: 'Ready', color: C.textMuted },
  { label: 'Eleven', status: 'Standby', color: C.textDim },
];

/* ── Demo File Tree ───────────────────────────────── */
const FILE_TREE = [
  { name: 'App.tsx', icon: '⚛', active: true },
  { name: 'components/', icon: '📁', children: [
    { name: 'Hero.tsx', icon: '⚛' },
    { name: 'Layout.tsx', icon: '⚛' },
  ]},
  { name: 'styles/', icon: '📁', children: [
    { name: 'global.css', icon: '🎨' },
  ]},
  { name: 'utils/', icon: '📁', children: [
    { name: 'neural.ts', icon: '📄' },
  ]},
  { name: 'package.json', icon: '📦' },
];

/* ── Demo Code Content ────────────────────────────── */
const DEMO_CODE = `import React from 'react';
import { motion } from 'framer-motion';

export default function App() {
  return (
    <div className="bg-black min-h-screen">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-neon-gold"
      >
        SaintSal Labs Active
      </motion.h1>
      <p>Building the future...</p>
    </div>
  );
}`;

const INITIAL_MESSAGES = [
  {
    id: '1', role: 'assistant',
    content: "I've initialized the **SaintSal Labs** dashboard structure using the HACP protocol. Ready to build — describe what you want to create.",
    streaming: false,
  },
];

export default function BuilderIDEScreen() {
  const [activeMode, setActiveMode] = useState('chat');
  const [showFiles, setShowFiles] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState('App.tsx');
  const scrollRef = useRef(null);
  const xhrRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = (text) => {
    if (!text?.trim() || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { id: Date.now() + 'u', role: 'user', content: text };
    const asstMsg = { id: Date.now() + 'a', role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, userMsg, asstMsg]);

    xhrRef.current = streamBuilder({
      prompt: text,
      system: SYS.builder,
      onChunk: (chunk) => {
        setMessages(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, content: last.content + chunk };
          return h;
        });
      },
      onDone: () => {
        setMessages(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, streaming: false };
          return h;
        });
        setLoading(false);
      },
      onError: (err) => {
        setMessages(prev => {
          const h = [...prev];
          const last = h[h.length - 1];
          if (last?.role === 'assistant') h[h.length - 1] = { ...last, content: `⚠ ${err}`, streaming: false };
          return h;
        });
        setLoading(false);
      },
    });
  };

  /* ── Render: File Tree Sidebar ─────────────────── */
  const renderFileTree = () => (
    <View style={s.sidebar}>
      <View style={s.sidebarHeader}>
        <Text style={s.sidebarTitle}>FILES</Text>
        <TouchableOpacity onPress={() => setShowFiles(false)}>
          <Text style={{ color: C.textDim, fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>
      {FILE_TREE.map((f) => (
        <View key={f.name}>
          <TouchableOpacity
            style={[s.fileRow, activeFile === f.name && s.fileRowActive]}
            onPress={() => { if (!f.children) setActiveFile(f.name); }}
          >
            <Text style={s.fileIcon}>{f.icon}</Text>
            <Text style={[s.fileName, activeFile === f.name && { color: C.amber }]}>{f.name}</Text>
          </TouchableOpacity>
          {f.children?.map((child) => (
            <TouchableOpacity
              key={child.name}
              style={[s.fileRow, { paddingLeft: 28 }, activeFile === child.name && s.fileRowActive]}
              onPress={() => setActiveFile(child.name)}
            >
              <Text style={s.fileIcon}>{child.icon}</Text>
              <Text style={[s.fileName, activeFile === child.name && { color: C.amber }]}>{child.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  /* ── Render: Code View ─────────────────────────── */
  const renderCodeView = () => {
    const lines = DEMO_CODE.split('\n');
    return (
      <ScrollView style={s.codeArea} showsVerticalScrollIndicator={false}>
        <View style={s.codeWrap}>
          <View style={s.lineNumbers}>
            {lines.map((_, i) => (
              <Text key={i} style={s.lineNum}>{i + 1}</Text>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={s.codeText} selectable>{DEMO_CODE}</Text>
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  /* ── Render: Preview View ──────────────────────── */
  const renderPreview = () => (
    <View style={s.previewWrap}>
      <View style={s.previewBar}>
        <View style={s.previewDots}>
          <View style={[s.dot, { backgroundColor: C.red }]} />
          <View style={[s.dot, { backgroundColor: C.amber }]} />
          <View style={[s.dot, { backgroundColor: C.green }]} />
        </View>
        <Text style={s.previewUrl}>localhost:3000</Text>
      </View>
      <View style={s.previewBody}>
        <Text style={s.previewTitle}>SaintSal Labs Active</Text>
        <Text style={s.previewSubtitle}>Building the future...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={32} />
          <View>
            <Text style={s.headerTitle}>SaintSal Labs</Text>
            <View style={s.statusRow}>
              <Animated.View style={[s.statusDot, { opacity: pulseAnim }]} />
              <Text style={s.statusText}>HACP v2.1 Active</Text>
            </View>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={() => setShowFiles(!showFiles)}>
            <Text style={{ fontSize: 16 }}>📁</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connectivity Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.connBar} contentContainerStyle={s.connContent}>
        {CONNECTIONS.map((c) => (
          <View key={c.label} style={s.connItem}>
            <Text style={{ fontSize: 10 }}>☁️</Text>
            <Text style={s.connLabel}>{c.label}: </Text>
            <Text style={[s.connStatus, { color: c.color }]}>{c.status}</Text>
          </View>
        ))}
        <View style={s.connDivider} />
        <View style={s.connItem}>
          <Text style={{ fontSize: 10 }}>🔑</Text>
          <Text style={s.connLabel}>Env: </Text>
          <Text style={[s.connStatus, { color: C.amberDim, fontStyle: 'italic' }]}>TEXT_2</Text>
        </View>
      </ScrollView>

      {/* Mode Tabs */}
      <View style={s.tabBar}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[s.tab, activeMode === m.id && s.tabActive]}
            onPress={() => setActiveMode(m.id)}
          >
            <Text style={s.tabIcon}>{m.icon}</Text>
            <Text style={[s.tabLabel, activeMode === m.id && s.tabLabelActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <View style={s.main}>
        {showFiles && renderFileTree()}

        <View style={{ flex: 1 }}>
          {activeMode === 'chat' && (
            <ScrollView
              ref={scrollRef}
              style={s.chatScroll}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} accent={C.amber} />
              ))}
            </ScrollView>
          )}
          {activeMode === 'code' && renderCodeView()}
          {activeMode === 'preview' && renderPreview()}
        </View>
      </View>

      {/* Terminal Strip */}
      <View style={s.terminal}>
        <View style={s.termLeft}>
          <Text style={{ fontSize: 12 }}>▸</Text>
          <Text style={s.termText}>saintsal-labs@mobile:~/project$ npm run dev</Text>
        </View>
        <Text style={{ color: C.textDim, fontSize: 12 }}>▴</Text>
      </View>

      {/* Floating Action Buttons */}
      <View style={s.fabRow}>
        <TouchableOpacity style={s.runBtn} activeOpacity={0.8}>
          <Text style={s.runIcon}>▶</Text>
          <Text style={s.runLabel}>Run</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deployBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 14 }}>🚀</Text>
          <Text style={s.deployLabel}>Deploy</Text>
        </TouchableOpacity>
      </View>

      {/* Input Bar (Chat mode) */}
      {activeMode === 'chat' && (
        <InputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Describe what you want to build..."
          loading={loading}
          accent={C.amber}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, color: C.textDim, textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Connectivity */
  connBar: { maxHeight: 36, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bgCard },
  connContent: { paddingHorizontal: 16, alignItems: 'center', gap: 16 },
  connItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  connLabel: { fontSize: 10, fontWeight: '600', color: C.textDim, textTransform: 'uppercase' },
  connStatus: { fontSize: 10, fontWeight: '600' },
  connDivider: { width: 1, height: 16, backgroundColor: C.border },

  /* Tabs */
  tabBar: {
    flexDirection: 'row', backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.amber },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: '700', color: C.textDim },
  tabLabelActive: { color: C.text },

  /* Main */
  main: { flex: 1, flexDirection: 'row' },
  chatScroll: { flex: 1 },

  /* Sidebar */
  sidebar: {
    width: 180, backgroundColor: C.sidebar, borderRightWidth: 1, borderRightColor: C.border,
    paddingTop: 8,
  },
  sidebarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 10,
  },
  sidebarTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: C.textDim },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 7, paddingHorizontal: 12,
  },
  fileRowActive: { backgroundColor: C.amberGhost },
  fileIcon: { fontSize: 12 },
  fileName: { fontSize: 12, color: C.textMuted },

  /* Code View */
  codeArea: { flex: 1, backgroundColor: C.bg, padding: 16 },
  codeWrap: { flexDirection: 'row' },
  lineNumbers: { marginRight: 16, alignItems: 'flex-end' },
  lineNum: { fontSize: 13, lineHeight: 22, color: C.amberDim + '44', fontFamily: 'monospace' },
  codeText: { fontSize: 13, lineHeight: 22, color: '#C8D3F5', fontFamily: 'monospace' },

  /* Preview */
  previewWrap: { flex: 1, margin: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  previewBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.bgElevated,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  previewDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  previewUrl: { fontSize: 11, color: C.textDim, fontFamily: 'monospace' },
  previewBody: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center', alignItems: 'center' },
  previewTitle: { fontSize: 22, fontWeight: '800', color: C.neonGold, marginBottom: 8 },
  previewSubtitle: { fontSize: 14, color: C.textMuted },

  /* Terminal */
  terminal: {
    height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, backgroundColor: '#050508',
    borderTopWidth: 1, borderTopColor: C.border,
  },
  termLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  termText: { fontSize: 10, color: C.textDim, fontFamily: 'monospace', letterSpacing: -0.3 },

  /* FABs */
  fabRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 8,
    justifyContent: 'center',
  },
  runBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999,
    backgroundColor: C.amber,
    shadowColor: C.amber, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  runIcon: { fontSize: 12, color: '#000' },
  runLabel: { fontSize: 14, fontWeight: '800', color: '#000' },
  deployBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
  },
  deployLabel: { fontSize: 14, fontWeight: '700', color: C.text },
});
