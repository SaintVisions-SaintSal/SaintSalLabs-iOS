/* ═══════════════════════════════════════════════════
   SCREENS 8-11 — SAL CHAT SUITE (All 4 Modes)
   sal_chat_creative_mastermind → creative
   sal_chat_strategic_analysis  → finance
   sal_chat_real_estate_executive → realestate
   sal_chat_global_intelligence → global
   Wired: /api/sal/chat · model routing · compute gate
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { streamSalChat } from '../../lib/api';
import { deductCompute } from '../../lib/supabase';

/* ── Mode Configuration ── */
const MODES = {
  creative: {
    icon: '🎨',
    label: 'SAL Creative Assistant',
    subLabel: 'SAINTSAL™ LABS',
    accent: '#F59E0B',
    tabs: null,
    placeholder: 'Ask SAL to create something...',
    starters: [
      '🎬 Generate a cinematic video concept',
      '🖼 Create a high-fidelity image prompt',
      '✍️ Write premium brand copy',
      '🎵 Compose a campaign concept',
    ],
    system: "You are SAL Creative Mastermind for SaintSal™ Labs — elite creative AI. Generate cinematic video concepts, high-fidelity image prompts, premium brand copy, campaigns. Think like a world-class creative director at a luxury agency. Be visionary, bold, and specific.",
  },
  finance: {
    icon: '📈',
    label: 'Finance & Analysis',
    subLabel: 'SAL EXECUTIVE INTELLIGENCE',
    accent: '#22C55E',
    tabs: null,
    placeholder: 'Ask SAL Finance anything...',
    starters: [
      '📊 Analyze NVDA — technicals + fundamentals',
      '📉 Q3 volatility report',
      '💰 Build a $50K diversified portfolio',
      '🔮 Bitcoin price targets Q2 2026',
    ],
    system: "You are SAL Finance — institutional-grade financial intelligence for SaintSal™ Labs. Market analysis, earnings breakdowns, macro context, crypto, options, portfolio strategy. Use specific numbers. Think like a Goldman Sachs portfolio manager. Provide structured, data-driven analysis.",
  },
  realestate: {
    icon: '🏠',
    label: 'SaintSal™ Labs',
    subLabel: 'EXECUTIVE MODE',
    accent: '#D4AF37',
    tabs: null,
    placeholder: 'Analyze a deal, find comps, underwrite...',
    starters: [
      '🏡 Analyze: $450K SFR, $2800 rent, 20% down',
      '🔨 Fix & flip strategy Downtown Heights',
      '📋 BRRRR analysis for $120K duplex',
      '📍 Best STR markets 2026 under $50K',
    ],
    system: "You are SAL Real Estate Executive — CookinCapital deal analysis methodology for SaintSal™ Labs. Handle: property valuation, rental analysis, deal underwriting, NOD/foreclosure, comps, creative financing, BRRRR/STR analysis, ARV calculation, renovation budgets. Think like a 20-year veteran investor with Goldman execution.",
  },
  global: {
    icon: '🌐',
    label: 'Global Intelligence',
    subLabel: 'SAL-1 QUANTUM AGENT ACTIVE',
    accent: '#F59E0B',
    tabs: ['ALL INTEL', 'GEOPOLITICAL', 'ECONOMIC', 'MILITARY'],
    placeholder: 'Analyze global intel, geopolitics, threats...',
    starters: [
      '🌍 Analyze rare earth mining shifts impact on EU defense',
      '⚔️ Current geopolitical hotspots risk assessment',
      '📡 Global economic outlook Q2 2026',
      '🛡 NATO expansion implications analysis',
    ],
    system: "You are SAL Global Intelligence — world-class geopolitical and strategic intelligence analyst for SaintSal™ Labs. Analyze: geopolitics, economic trends, military strategy, supply chain risks, rare earth dependencies, global macro. Think like a senior CIA analyst + Goldman macro strategist. Be specific, structured, and authoritative. Cite key data points.",
  },
};

export default function SalChatScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams();
  const mode    = (params.mode || 'creative');
  const cfg     = MODES[mode] || MODES.creative;

  const { canUseAI, computeLeft, tier, refreshUserProfile } = useAuth();

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const scrollRef   = useRef(null);
  const xhrRef      = useRef(null);
  const startTime   = useRef(null);
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const inputRef    = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Welcome message
    setMessages([{
      role: 'assistant',
      content: getWelcome(mode, cfg),
    }]);
  }, [mode]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const handleSend = useCallback((text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    if (!canUseAI) {
      Alert.alert(
        'Compute Limit Reached',
        `Your ${tier} plan has used all compute minutes. Upgrade to continue.`,
        [
          { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const userMsg = { role: 'user', content: trimmed };
    const assistantMsg = { role: 'assistant', content: '', streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    startTime.current = Date.now();

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Filter global by tab if needed
    const systemAddendum = cfg.tabs && activeTab > 0
      ? ` Focus specifically on ${cfg.tabs[activeTab]} topics.`
      : '';

    xhrRef.current = streamSalChat({
      mode,
      messages: apiMessages,
      system: cfg.system + systemAddendum,
      onChunk: (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
        scrollToEnd();
      },
      onDone: async () => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, streaming: false };
          return updated;
        });
        setLoading(false);
        // Deduct compute
        const elapsed = Math.round((Date.now() - startTime.current) / 1000);
        await deductCompute(elapsed);
        refreshUserProfile();
      },
      onError: (err) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: `⚠️ ${err || 'Connection error. Please try again.'}`,
            streaming: false,
          };
          return updated;
        });
        setLoading(false);
      },
    });
  }, [input, loading, messages, canUseAI, mode, activeTab]);

  const handleStop = () => {
    xhrRef.current?.abort();
    setLoading(false);
    setMessages(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.streaming) {
        updated[updated.length - 1] = { ...last, streaming: false };
      }
      return updated;
    });
  };

  const GOLD  = cfg.accent;
  const BG    = '#0F0F0F';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: BG }]}>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: GOLD + '20' }]}>
        <View style={s.headerLeft}>
          <View style={[s.headerIconBox, { borderColor: GOLD + '44', backgroundColor: GOLD + '15' }]}>
            <Text style={s.headerIconTxt}>{cfg.icon}</Text>
          </View>
          <View>
            <View style={s.headerTitleRow}>
              <Text style={[s.headerTitle, { color: '#E8E6E1' }]}>{cfg.label}</Text>
              <Animated.View style={[s.liveDot, { opacity: pulseAnim, backgroundColor: '#22C55E' }]} />
              <Text style={s.liveTxt}>LIVE</Text>
            </View>
            <Text style={[s.headerSub, { color: GOLD + 'BB' }]}>{cfg.subLabel}</Text>
          </View>
        </View>
        <View style={[s.credBadge, { backgroundColor: GOLD + '18', borderColor: GOLD + '30' }]}>
          <Text style={s.credIcon}>🗄</Text>
          <Text style={[s.credTxt, { color: GOLD }]}>{computeLeft} MIN</Text>
        </View>
      </View>

      {/* ── Global Intel Tabs ── */}
      {cfg.tabs && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[s.tabsWrap, { borderBottomColor: GOLD + '18' }]}
          contentContainerStyle={s.tabsContent}
        >
          {cfg.tabs.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === i && { borderBottomColor: GOLD }]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[s.tabTxt, { color: activeTab === i ? GOLD : '#6B7280' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Chat Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} accent={GOLD} />
        ))}
        {loading && (
          <View style={s.typingRow}>
            <View style={[s.typingDot, { backgroundColor: GOLD }]} />
            <View style={[s.typingDot, { backgroundColor: GOLD, marginLeft: 4 }]} />
            <View style={[s.typingDot, { backgroundColor: GOLD, marginLeft: 4 }]} />
          </View>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Quick Starters (show only if no messages sent) ── */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.startersRow}
          style={s.startersWrap}
        >
          {cfg.starters.map(s2 => (
            <TouchableOpacity
              key={s2}
              style={[s.starterChip, { borderColor: GOLD + '44', backgroundColor: GOLD + '0F' }]}
              onPress={() => handleSend(s2)}
              activeOpacity={0.75}
            >
              <Text style={[s.starterTxt, { color: GOLD }]}>{s2}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Input Bar ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.inputWrap, { borderTopColor: GOLD + '18' }]}>
          <View style={[s.inputRow, { borderColor: GOLD + '30', backgroundColor: GOLD + '08' }]}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder={cfg.placeholder}
              placeholderTextColor="#444455"
              multiline
              maxLength={4000}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            {loading ? (
              <TouchableOpacity style={[s.sendBtn, { backgroundColor: '#EF4444' }]} onPress={handleStop}>
                <Text style={s.sendIcon}>⏹</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.sendBtn, { backgroundColor: GOLD }]}
                onPress={() => handleSend()}
                disabled={!input.trim()}
                activeOpacity={0.85}
              >
                <Text style={s.sendIcon}>↑</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ msg, accent }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[b.wrap, isUser ? b.userWrap : b.assistantWrap]}>
      {!isUser && (
        <View style={[b.avatar, { borderColor: accent + '44', backgroundColor: accent + '18' }]}>
          <Text style={b.avatarTxt}>S</Text>
        </View>
      )}
      <View style={[b.bubble, isUser
        ? { backgroundColor: accent, borderTopRightRadius: 4, maxWidth: '85%' }
        : { backgroundColor: '#FFFFFF08', borderTopLeftRadius: 4, flex: 1, borderWidth: 1, borderColor: '#FFFFFF0A' }
      ]}>
        {!isUser && (
          <Text style={[b.label, { color: accent }]}>SAL Assistant</Text>
        )}
        <Text style={[b.text, { color: isUser ? '#0F0F0F' : '#E8E6E1' }]} selectable>
          {msg.content}
          {msg.streaming && <Text style={{ color: accent }}>▊</Text>}
        </Text>
      </View>
    </View>
  );
}

function getWelcome(mode, cfg) {
  const welcomes = {
    creative: "Welcome to Creative Mastermind. I'm ready to generate cinematic video concepts, high-fidelity images, premium copy, and full campaign strategies. What are we creating today?",
    finance:  "Welcome back. I've analyzed current market conditions. NVIDIA and the AI sector are showing strong momentum. BTC consolidating above key support. Want a full portfolio analysis or a specific market deep-dive?",
    realestate: "Underwriting engine ready. I specialize in ARV calculations, BRRRR analysis, STR market identification, and deal underwriting. Give me a property address or deal details to start.",
    global:   "SAL-1 Global Intelligence active. I'm monitoring geopolitical developments, economic shifts, and strategic threats across all major theaters. What intelligence briefing do you need?",
  };
  return welcomes[mode] || welcomes.creative;
}

const b = StyleSheet.create({
  wrap: { marginBottom: 20 },
  userWrap: { flexDirection: 'row', justifyContent: 'flex-end' },
  assistantWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarTxt: { fontSize: 14, fontWeight: '800', color: '#D4AF37' },
  bubble: { borderRadius: 16, padding: 14 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  text: { fontSize: 14, lineHeight: 22 },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBox: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  headerIconTxt: { fontSize: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5, color: '#22C55E' },
  headerSub: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' },
  credBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  credIcon: { fontSize: 11 },
  credTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tabsWrap: { borderBottomWidth: 1, maxHeight: 46 },
  tabsContent: { paddingHorizontal: 16, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  typingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 46, marginTop: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.6 },
  startersWrap: { maxHeight: 52, borderTopWidth: 1, borderTopColor: '#FFFFFF08' },
  startersRow: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  starterChip: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    maxWidth: 280,
  },
  starterTxt: { fontSize: 12, fontWeight: '600' },
  inputWrap: {
    borderTopWidth: 1, paddingHorizontal: 14, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 6 : 10,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    borderWidth: 1, borderRadius: 14, paddingLeft: 14, paddingRight: 6, paddingVertical: 8,
  },
  input: {
    flex: 1, fontSize: 15, color: '#E8E6E1', maxHeight: 100,
    paddingVertical: 4, lineHeight: 22,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sendIcon: { fontSize: 18, fontWeight: '700', color: '#0F0F0F', lineHeight: 22 },
});
