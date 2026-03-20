/* ═══════════════════════════════════════════════════
   SEARCH / CHAT HOMEPAGE — Tab 1 (Build #68)
   This is THE homepage. No auth wall. 25 free msgs.
   XHR streaming via saintsallabs-api.
   Vertical chips · ticker · markdown rendering
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView,
  Platform, Animated, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MarkdownText from '../../components/MarkdownText';
import { streamSalChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD_BG = '#141416';

const VERTICALS = [
  { id: 'all',         label: 'All',          icon: '✨', route: null },
  { id: 'sports',      label: 'Sports',       icon: '🏀', route: '/(stack)/elite-intelligence' },
  { id: 'news',        label: 'News',         icon: '📰', route: '/(stack)/full-spectrum-intel' },
  { id: 'tech',        label: 'Tech',         icon: '💻', route: '/(stack)/elite-intel-hub' },
  { id: 'finance',     label: 'Finance',      icon: '📈', route: '/(stack)/finance-chat' },
  { id: 'realestate',  label: 'Real Estate',  icon: '🏠', route: '/(stack)/elite-real-estate' },
  { id: 'medical',     label: 'Medical',      icon: '🏥', route: '/(stack)/full-spectrum-v2' },
  { id: 'cookin',      label: 'CookinCards',  icon: '🃏', route: '/(stack)/portfolio' },
];

const TIERS = [
  { id: 'mini', label: 'Mini', desc: 'Fast' },
  { id: 'pro',  label: 'Pro',  desc: 'Balanced' },
  { id: 'max',  label: 'Max',  desc: 'Most capable' },
];

const SYSTEM_PROMPTS = {
  all: "You are SAL — the world's most elite AI intelligence platform from SaintSal™ Labs. Expert across all domains. Be precise, insightful, and actionable.",
  sports: "You are SAL Sports Intelligence — elite sports analysis AI. Live scores, standings, player stats, game predictions, injury reports. Think like a top ESPN analyst combined with a quant.",
  news: "You are SAL News Intelligence — breaking news analysis AI. Global events, politics, economics, tech trends. Provide context, implications, and multiple perspectives.",
  tech: "You are SAL Tech Intelligence — cutting-edge technology analysis AI. Software, hardware, AI, crypto, startups, enterprise. Deep technical knowledge with business context.",
  finance: "You are SAL Finance — institutional-grade financial intelligence. Market analysis, earnings, macro context, crypto, options, portfolio strategy. Think like a Goldman Sachs PM. Use specific numbers.",
  realestate: "You are SAL Real Estate — CookinCapital deal analysis methodology. Property valuation, rental analysis, deal underwriting, comps, creative financing, BRRRR/STR analysis.",
  medical: "You are SAL Medical Intelligence — healthcare and biotech analysis AI. Drug pipelines, clinical trials, medical research, FDA approvals, health tech. Accurate and evidence-based.",
  cookin: "You are SAL CookinCards — collectibles and trading card intelligence. Market prices, grading, portfolio tracking, investment analysis, upcoming releases, PSA/BGS data.",
};

const FREE_MSG_LIMIT = 25;
const MSG_COUNT_KEY = '@sal_free_msg_count';

export default function SearchChatHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const xhrRef = useRef(null);

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [activeVertical, setActiveVertical] = useState('all');
  const [activeTier, setActiveTier] = useState('pro');
  const [msgCount, setMsgCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showTierPicker, setShowTierPicker] = useState(false);

  // Load free message count
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(MSG_COUNT_KEY);
        if (stored) setMsgCount(parseInt(stored, 10));
      } catch {}
    })();
  }, []);

  const incrementMsgCount = useCallback(async () => {
    const next = msgCount + 1;
    setMsgCount(next);
    try { await AsyncStorage.setItem(MSG_COUNT_KEY, String(next)); } catch {}
    if (next >= FREE_MSG_LIMIT) {
      setShowSignupPrompt(true);
    }
  }, [msgCount]);

  const handleSend = useCallback(() => {
    const text = query.trim();
    if (!text || streaming) return;

    // Free tier gate (soft)
    if (msgCount >= FREE_MSG_LIMIT) {
      setShowSignupPrompt(true);
      return;
    }

    Keyboard.dismiss();
    const userMsg = { role: 'user', content: text };
    const assistantMsg = { role: 'assistant', content: '', streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setQuery('');
    setStreaming(true);
    incrementMsgCount();

    const systemPrompt = SYSTEM_PROMPTS[activeVertical] || SYSTEM_PROMPTS.all;
    const chatMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    xhrRef.current = streamSalChat({
      mode: activeVertical === 'all' ? 'creative' : activeVertical === 'finance' ? 'finance' : activeVertical === 'realestate' ? 'realestate' : 'creative',
      system: systemPrompt,
      messages: chatMessages,
      onChunk: (token) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + token };
          }
          return updated;
        });
      },
      onDone: () => {
        setStreaming(false);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last) updated[updated.length - 1] = { ...last, streaming: false };
          return updated;
        });
      },
      onError: (err) => {
        setStreaming(false);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last) updated[updated.length - 1] = { ...last, content: 'Connection error. Please try again.', streaming: false };
          return updated;
        });
      },
    });

    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [query, streaming, messages, activeVertical, msgCount]);

  const handleChip = useCallback((topic) => {
    setQuery(topic);
  }, []);

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Top Bar ── */}
        <View style={s.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.logoText}>SaintSal™</Text>
            <Text style={s.logoSub}> Labs</Text>
          </View>
          <View style={s.tierPill}>
            <Text style={s.tierText}>SAL {activeTier.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Vertical Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {VERTICALS.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[s.chip, activeVertical === v.id && s.chipActive]}
              onPress={() => {
                if (v.route) {
                  router.push(v.route);
                } else {
                  setActiveVertical(v.id);
                }
              }}
            >
              <Text style={s.chipIcon}>{v.icon}</Text>
              <Text style={[s.chipText, activeVertical === v.id && s.chipTextActive]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Messages / Welcome ── */}
        <ScrollView
          ref={scrollRef}
          style={s.chatArea}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={s.welcomeArea}>
              {/* Featured cards */}
              <View style={s.featRow}>
                <View style={s.featCard}>
                  <Text style={s.featIcon}>📊</Text>
                  <Text style={s.featTitle}>Markets</Text>
                  <Text style={s.featSub}>S&P 500 · NASDAQ · BTC</Text>
                </View>
                <View style={s.featCard}>
                  <Text style={s.featIcon}>🏀</Text>
                  <Text style={s.featTitle}>Scores</Text>
                  <Text style={s.featSub}>Live games & standings</Text>
                </View>
                <View style={s.featCard}>
                  <Text style={s.featIcon}>📰</Text>
                  <Text style={s.featTitle}>News</Text>
                  <Text style={s.featSub}>Breaking stories today</Text>
                </View>
              </View>

              {/* Suggested prompts */}
              <Text style={s.suggestLabel}>Try asking</Text>
              {[
                'What are today\'s top market movers?',
                'Analyze NVDA earnings and price target',
                'Latest NBA scores and standings',
                'Top AI companies to watch in 2026',
              ].map((prompt, i) => (
                <TouchableOpacity key={i} style={s.suggestChip} onPress={() => handleChip(prompt)}>
                  <Text style={s.suggestText}>{prompt}</Text>
                  <Text style={s.suggestArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            messages.map((msg, i) => (
              <View key={i} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
                {msg.role === 'assistant' && (
                  <View style={s.salAvatar}>
                    <Text style={{ fontSize: 16 }}>🤖</Text>
                  </View>
                )}
                <View style={[s.msgBubble, msg.role === 'user' ? s.msgUser : s.msgAssistant]}>
                  {msg.role === 'assistant' ? (
                    <MarkdownText content={msg.content || '...'} streaming={msg.streaming} />
                  ) : (
                    <Text style={s.msgTextUser}>{msg.content}</Text>
                  )}
                  {msg.streaming && !msg.content && (
                    <View style={s.typingDots}>
                      <ActivityIndicator size="small" color={GOLD} />
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* ── Tier Selector ── */}
        {showTierPicker && (
          <View style={s.tierRow}>
            {TIERS.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.tierBtn, activeTier === t.id && s.tierBtnActive]}
                onPress={() => { setActiveTier(t.id); setShowTierPicker(false); }}
              >
                <Text style={[s.tierBtnText, activeTier === t.id && { color: BG }]}>{t.label}</Text>
                <Text style={[s.tierBtnDesc, activeTier === t.id && { color: 'rgba(0,0,0,0.5)' }]}>{t.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input Bar ── */}
        <View style={s.inputBar}>
          <TouchableOpacity style={s.micBtn}>
            <Text style={{ fontSize: 18 }}>🎤</Text>
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder="Ask SAL anything..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={s.tierToggle}
            onPress={() => setShowTierPicker(!showTierPicker)}
          >
            <Text style={s.tierToggleText}>{activeTier.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.sendBtn, (query.trim() && !streaming) && s.sendBtnActive]}
            onPress={handleSend}
            disabled={!query.trim() || streaming}
          >
            <Text style={{ fontSize: 18, color: (query.trim() && !streaming) ? BG : 'rgba(255,255,255,0.3)' }}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* ── Free tier remaining ── */}
        {msgCount > 0 && msgCount < FREE_MSG_LIMIT && (
          <View style={s.freeCounter}>
            <Text style={s.freeText}>{FREE_MSG_LIMIT - msgCount} free messages remaining</Text>
          </View>
        )}

        {/* ── Signup Prompt Overlay ── */}
        {showSignupPrompt && (
          <View style={s.signupOverlay}>
            <View style={s.signupCard}>
              <Text style={s.signupTitle}>You've used your free messages</Text>
              <Text style={s.signupSub}>Sign up free to continue chatting with SAL</Text>
              <TouchableOpacity
                style={s.signupBtn}
                onPress={() => {
                  setShowSignupPrompt(false);
                  router.push('/(auth)/elite-auth');
                }}
              >
                <Text style={s.signupBtnText}>Sign Up Free</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSignupPrompt(false)}>
                <Text style={s.signupDismiss}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  logoText: { fontSize: 18, fontWeight: '900', color: GOLD, letterSpacing: 0.5 },
  logoSub:  { fontSize: 18, fontWeight: '300', color: '#fff' },
  tierPill: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
  },
  tierText: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1 },

  chipRow: { maxHeight: 44, marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: GOLD,
  },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  chipTextActive: { color: GOLD },

  chatArea: { flex: 1 },

  welcomeArea: { padding: 16, paddingTop: 20 },
  featRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  featCard: {
    flex: 1, backgroundColor: CARD_BG, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  featIcon: { fontSize: 24, marginBottom: 8 },
  featTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  featSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  suggestLabel: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  suggestChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  suggestText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', flex: 1 },
  suggestArrow: { fontSize: 16, color: GOLD, marginLeft: 8 },

  msgRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  msgRowUser: { justifyContent: 'flex-end' },
  salAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4,
  },
  msgBubble: { maxWidth: '80%', borderRadius: 16, padding: 14 },
  msgUser: { backgroundColor: GOLD, borderBottomRightRadius: 4 },
  msgAssistant: { backgroundColor: CARD_BG, borderBottomLeftRadius: 4, flex: 1 },
  msgTextUser: { fontSize: 15, color: BG, lineHeight: 22 },
  msgText: { fontSize: 15, color: '#fff', lineHeight: 22 },
  typingDots: { marginTop: 4 },

  tierRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#111',
  },
  tierBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tierBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  tierBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  tierBtnDesc: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#111',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  micBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 15, maxHeight: 100,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tierToggle: {
    marginLeft: 6, paddingHorizontal: 8, paddingVertical: 10,
  },
  tierToggleText: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 4,
  },
  sendBtnActive: { backgroundColor: GOLD },

  freeCounter: { alignItems: 'center', paddingVertical: 4, backgroundColor: '#111' },
  freeText: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },

  signupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  signupCard: {
    backgroundColor: '#1A1A1A', borderRadius: 20, padding: 32,
    width: '85%', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  signupTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  signupSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 24 },
  signupBtn: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40,
    marginBottom: 16, width: '100%', alignItems: 'center',
  },
  signupBtnText: { fontSize: 16, fontWeight: '800', color: BG },
  signupDismiss: { fontSize: 13, color: 'rgba(255,255,255,0.35)' },
});
