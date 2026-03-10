/* ═══════════════════════════════════════════════════
   SAINTSALLABS — CHAT SCREEN
   All 12 verticals · SSE streaming · Landing prompts
   Mirrors saintsallabs.com v5 exactly
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { C, V, STARTERS, SYS } from '../config/theme';
import { streamChat } from '../lib/api';
import { ChatBubble, InputBar, StarterBtn } from '../components';

/* ── Verticals nav ────────────────────────────────── */
const VERTICALS = [
  { id: 'search',     group: 'INTELLIGENCE' },
  { id: 'sports',     group: 'INTELLIGENCE' },
  { id: 'news',       group: 'INTELLIGENCE' },
  { id: 'tech',       group: 'INTELLIGENCE' },
  { id: 'finance',    group: 'INTELLIGENCE' },
  { id: 'realestate', group: 'INTELLIGENCE' },
  { id: 'medical',    group: 'INTELLIGENCE' },
  { id: 'career',     group: 'PRO', pro: true },
  { id: 'bizplan',    group: 'BUILD' },
  { id: 'bizcenter',  group: 'BUILD' },
  { id: 'domains',    group: 'BUILD' },
];

export default function ChatScreen() {
  const [vertical, setVertical] = useState('search');
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [interacted, setInteracted] = useState({});
  const scrollRef = useRef(null);
  const xhrRef = useRef(null);

  const cfg = V[vertical] || V.search;
  const msgs = messages[vertical] || [];
  const hasInteracted = interacted[vertical];
  const starters = STARTERS[vertical] || [];
  const sys = SYS[vertical] || SYS.search;

  useEffect(() => {
    // Auto-scroll to bottom when messages update
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, vertical]);

  // Cancel in-flight request when switching verticals
  useEffect(() => {
    return () => { xhrRef.current?.abort(); };
  }, [vertical]);

  const send = useCallback(async (text) => {
    if (!text?.trim() || streaming) return;
    const trimmed = text.trim();
    setInput('');
    setStreaming(true);
    setInteracted(p => ({ ...p, [vertical]: true }));

    const userMsg = { id: Date.now() + 'u', role: 'user', content: trimmed };
    const asstMsg = { id: Date.now() + 'a', role: 'assistant', content: '', streaming: true };

    setMessages(p => ({
      ...p,
      [vertical]: [...(p[vertical] || []), userMsg, asstMsg],
    }));

    const history = [...(messages[vertical] || []), userMsg];

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      system: sys,
      messages: history.map(m => ({ role: m.role, content: m.content })),
      onChunk: (chunk) => {
        setMessages(p => {
          const v = [...(p[vertical] || [])];
          const last = v[v.length - 1];
          if (last?.role === 'assistant') {
            v[v.length - 1] = { ...last, content: last.content + chunk };
          }
          return { ...p, [vertical]: v };
        });
      },
      onDone: () => {
        setMessages(p => {
          const v = [...(p[vertical] || [])];
          const last = v[v.length - 1];
          if (last?.role === 'assistant') {
            v[v.length - 1] = { ...last, streaming: false };
          }
          return { ...p, [vertical]: v };
        });
        setStreaming(false);
      },
      onError: (err) => {
        setMessages(p => {
          const v = [...(p[vertical] || [])];
          const last = v[v.length - 1];
          if (last?.role === 'assistant') {
            v[v.length - 1] = { ...last, content: `⚠ ${err}`, streaming: false };
          }
          return { ...p, [vertical]: v };
        });
        setStreaming(false);
      },
    });
  }, [vertical, messages, streaming, sys]);

  const clearChat = () => {
    xhrRef.current?.abort();
    setStreaming(false);
    setMessages(p => ({ ...p, [vertical]: [] }));
    setInteracted(p => ({ ...p, [vertical]: false }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: cfg.accent }]}>{cfg.label}</Text>
          <Text style={styles.headerSub}>{cfg.tagline}</Text>
        </View>
        {hasInteracted && (
          <TouchableOpacity onPress={clearChat} style={styles.newBtn}>
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Vertical Selector (horizontal scroll) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.vertNav}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' }}
      >
        {VERTICALS.map(v => (
          <TouchableOpacity
            key={v.id}
            onPress={() => { setVertical(v.id); setInput(''); }}
            style={[
              styles.vertTab,
              {
                backgroundColor: vertical === v.id ? V[v.id].accent + '18' : '#111116',
                borderColor: vertical === v.id ? V[v.id].accent + '55' : '#1C1C24',
              },
            ]}
          >
            <Text style={[
              styles.vertTabText,
              { color: vertical === v.id ? V[v.id].accent : '#555', fontWeight: vertical === v.id ? '700' : '400' },
            ]}>
              {V[v.id].label}
            </Text>
            {v.pro && (
              <View style={styles.miniPro}>
                <Text style={styles.miniProText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Main Content ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Landing state — shown before first message */}
          {!hasInteracted && (
            <View style={{ marginBottom: 16 }}>
              {/* Brand header */}
              <View style={styles.landingHeader}>
                <Text style={[styles.landingAccent, { color: cfg.accent }]}>
                  SAL {(V[vertical]?.label || 'SEARCH').toUpperCase()} INTELLIGENCE
                </Text>
                <Text style={styles.landingTagline}>{cfg.tagline}</Text>
                <Text style={styles.landingPatent}>
                  SaintSal™ Labs · HACP Protocol · Patent #10,290,222
                </Text>
              </View>

              {/* Starter prompts */}
              <Text style={styles.sectionLabel}>JUMP IN</Text>
              {starters.map((s, i) => (
                <StarterBtn key={i} text={s} accent={cfg.accent} onPress={() => send(s)} />
              ))}
            </View>
          )}

          {/* Messages */}
          {msgs.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} accent={cfg.accent} />
          ))}
        </ScrollView>

        {/* ── Input Bar ── */}
        <InputBar
          value={input}
          onChange={setInput}
          onSend={send}
          placeholder={`Ask SAL ${cfg.label.toLowerCase()}...`}
          loading={streaming}
          accent={cfg.accent}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>SaintSal™ · Responsible Intelligence · HACP Protocol</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.borderSm, backgroundColor: C.sidebar,
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, color: C.textGhost, marginTop: 1 },
  newBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.amber + '18', borderWidth: 1, borderColor: C.amber + '33',
  },
  newBtnText: { fontSize: 12, fontWeight: '700', color: C.amber },
  vertNav: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: C.borderSm },
  vertTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1,
  },
  vertTabText: { fontSize: 12 },
  miniPro: {
    backgroundColor: '#F59E0B18', borderWidth: 1, borderColor: '#F59E0B28',
    borderRadius: 3, paddingHorizontal: 3,
  },
  miniProText: { fontSize: 7, fontWeight: '800', color: '#F59E0B' },
  scroll: { flex: 1, backgroundColor: C.bg },
  landingHeader: { marginBottom: 20 },
  landingAccent: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  landingTagline: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 5, lineHeight: 28 },
  landingPatent: { fontSize: 12, color: '#2A2A3A' },
  sectionLabel: { fontSize: 9, color: '#2A2A3A', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  footer: { paddingBottom: 4, alignItems: 'center' },
  footerText: { fontSize: 9, color: '#1A1A24' },
});
