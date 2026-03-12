import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated, FlatList,
} from 'react-native';
import { C } from '../../config/theme';
import { ChatBubble, InputBar } from '../../components';
import { streamChat } from '../../lib/api';

const ACCENT = C.green;

const MARKET_TICKERS = [
  { symbol: 'NVDA', value: '$924.80', change: '+2.45%', up: true },
  { symbol: 'AAPL', value: '$189.32', change: '-0.52%', up: false },
  { symbol: 'BTC', value: '$68,432', change: '+1.14%', up: true },
  { symbol: 'SPX', value: '5,431', change: '+0.12%', up: true },
  { symbol: 'TSLA', value: '$248.50', change: '+1.84%', up: true },
  { symbol: 'ETH', value: '$3,421', change: '-1.12%', up: false },
  { symbol: 'MSFT', value: '$428.15', change: '+0.33%', up: true },
  { symbol: 'AMZN', value: '$192.60', change: '+0.78%', up: true },
];

const QUICK_PROMPTS = [
  { icon: '📈', label: 'Analyze NVDA stock' },
  { icon: '📊', label: 'Portfolio Allocation' },
  { icon: '⚠️', label: 'Risk Alerts' },
  { icon: '📅', label: 'Market History' },
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Welcome back. I\'ve analyzed your portfolio against today\'s market movements. NVIDIA (NVDA) is showing strong momentum following the recent data center outlook. Would you like a deep dive into your allocation strategy?',
  },
];

const SYSTEM_PROMPT =
  'You are SAL Finance — institutional-grade financial intelligence. Market analysis, earnings breakdowns, macro context, crypto, options. Use specific numbers. Think like a Goldman Sachs portfolio manager.';

export default function ChatSuiteScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const xhrRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const assistantMsg = { role: 'assistant', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      system: SYSTEM_PROMPT,
      messages: apiMessages,
      onChunk: (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
        scrollToEnd();
      },
      onDone: () => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, streaming: false };
          return updated;
        });
        setLoading(false);
      },
      onError: (err) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: 'Connection error. Please try again.',
            streaming: false,
          };
          return updated;
        });
        setLoading(false);
      },
    });
  };

  const handleQuickPrompt = (label) => {
    handleSend(label);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Text style={s.headerIconText}>📈</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>SAL Finance Intelligence</Text>
            <View style={s.liveRow}>
              <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
              <Text style={s.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Market Ticker */}
      <View style={s.tickerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tickerContent}
        >
          {MARKET_TICKERS.map((t) => (
            <View key={t.symbol} style={s.tickerItem}>
              <Text style={s.tickerSymbol}>{t.symbol}</Text>
              <Text style={s.tickerValue}>{t.value}</Text>
              <Text style={[s.tickerChange, { color: t.up ? C.green : C.red }]}>
                {t.change}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} accent={ACCENT} />
        ))}
      </ScrollView>

      {/* Quick Prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.promptsRow}
        style={s.promptsWrap}
      >
        {QUICK_PROMPTS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={s.promptChip}
            onPress={() => handleQuickPrompt(p.label)}
            activeOpacity={0.7}
          >
            <Text style={s.promptIcon}>{p.icon}</Text>
            <Text style={s.promptLabel}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Ask SAL Finance anything..."
        loading={loading}
        accent={C.amber}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.amberGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.green,
    textTransform: 'uppercase',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { padding: 6 },
  headerBtnIcon: { fontSize: 18, color: C.textDim },

  /* Ticker */
  tickerWrap: {
    backgroundColor: C.amberGhost,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 8,
  },
  tickerContent: { paddingHorizontal: 12, gap: 16 },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tickerSymbol: {
    fontSize: 11,
    fontWeight: '700',
    color: C.amber,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tickerValue: { fontSize: 11, fontWeight: '500', color: C.textSub },
  tickerChange: { fontSize: 10, fontWeight: '700' },

  /* Chat */
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8 },

  /* Quick Prompts */
  promptsWrap: { maxHeight: 48 },
  promptsRow: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 6 },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.amberGhost,
    backgroundColor: C.amberGhost,
  },
  promptIcon: { fontSize: 12 },
  promptLabel: { fontSize: 11, fontWeight: '600', color: C.amber },
});
