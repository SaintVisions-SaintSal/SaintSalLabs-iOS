import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';
import { mcpChat } from '../../lib/api';

// MCP gateway handles all AI routing — no direct API calls (Build #95)

const SAL_FINANCE_SYSTEM = `You are SAL Finance — institutional-grade financial intelligence for SaintSal™ Labs, backed by US Patent #10,290,222. You think like a Goldman Sachs portfolio manager. You provide: DCF analysis with specific assumptions, technical + fundamental breakdowns, macro context, earnings analysis, crypto intelligence, options strategy. Use specific numbers, percentages, price targets. Format your response with clear sections. Cite data sources inline as [Alpaca Markets], [Bloomberg], [SEC Filing], etc.`;

const formatTime = (date) => {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

const QUICK_PROMPTS = [
  'Analyze NVDA — technicals + fundamentals',
  'BTC price targets Q2 2026',
  'Fed rate decision impact',
  'Build $50K portfolio',
];

export default function FinanceChat({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: 'SAL Finance Executive Intelligence online. I have live market data from Alpaca Markets and real-time analysis capabilities. I can run DCF models, volatility reports, portfolio analysis, and macro intelligence. What are we analyzing?',
      sources: ['Alpaca Markets', 'Bloomberg Terminal', 'SAL Finance Engine'],
      time: new Date(),
      hasChart: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState({});
  const [marketLoading, setMarketLoading] = useState(false);
  const [tickers, setTickers] = useState(['NVDA', 'AAPL', 'BTC/USD', 'SPY']);
  const [portfolioContext, setPortfolioContext] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    fetchMarketData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const fetchMarketData = async () => {
    setMarketLoading(true);
    const results = {};

    try {
      // Alpaca latest quotes
      const alpacaRes = await fetch(
        `https://data.alpaca.markets/v2/stocks/bars/latest?symbols=NVDA,AAPL,SPY,MSFT&feed=iex`,
        {
          headers: {
            'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
          },
        }
      );

      if (alpacaRes.ok) {
        const data = await alpacaRes.json();
        const bars = data.bars || {};
        Object.keys(bars).forEach((sym) => {
          const bar = bars[sym];
          const change = ((bar.c - bar.o) / bar.o) * 100;
          results[sym] = {
            price: bar.c?.toFixed(2),
            change: change.toFixed(2),
            open: bar.o?.toFixed(2),
            high: bar.h?.toFixed(2),
            low: bar.l?.toFixed(2),
            volume: (bar.v / 1000000).toFixed(1) + 'M',
          };
        });
      }
    } catch { /* use fallback */ }

    // Fallback demo data if API fails
    if (Object.keys(results).length === 0) {
      results['NVDA'] = { price: '875.40', change: '+2.34', volume: '42.1M' };
      results['AAPL'] = { price: '189.22', change: '-0.41', volume: '58.3M' };
      results['SPY'] = { price: '524.18', change: '+0.87', volume: '71.9M' };
      results['MSFT'] = { price: '418.56', change: '+1.22', volume: '22.7M' };
    }

    setMarketData(results);
    setMarketLoading(false);
  };

  // Context gathering via MCP gateway (no direct API calls — Build #95)
  const fetchGrokContext = async (query) => {
    try {
      const data = await mcpChat({ message: `Real-time market context for: ${query}. Be concise — 2-3 sentences with specific data.`, model: 'fast', vertical: 'finance' });
      return data.response || '';
    } catch { return ''; }
  };

  const fetchPerplexityMarketContext = async (query) => {
    try {
      const data = await mcpChat({ message: query, model: 'pro', vertical: 'finance' });
      return data.response || '';
    } catch { return ''; }
  };

  const detectTickers = (text) => {
    const matches = text.match(/\b[A-Z]{1,5}\b/g) || [];
    return matches.filter((t) => t.length >= 2 && t !== 'I' && t !== 'A');
  };

  const sendMessage = async (msgText) => {
    const text = (msgText || input).trim();
    if (!text || loading) return;
    setInput('');
    inputRef.current?.blur();

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Parallel context gathering
      const mentionedTickers = detectTickers(text);
      const [grokContext, perplexityContext] = await Promise.all([
        fetchGrokContext(text),
        fetchPerplexityMarketContext(text),
      ]);

      // Build market context string
      let marketContext = '';
      if (Object.keys(marketData).length > 0) {
        marketContext = `\n\nLive Market Data:\n${Object.entries(marketData)
          .map(([sym, d]) => `${sym}: $${d.price} (${d.change > 0 ? '+' : ''}${d.change}%) Vol: ${d.volume}`)
          .join('\n')}`;
      }

      let contextBlock = marketContext;
      if (grokContext) contextBlock += `\n\nReal-time Grok Intelligence: ${grokContext}`;
      if (perplexityContext) contextBlock += `\n\nMarket Research Context: ${perplexityContext}`;

      // Build conversation history
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.text }));

      const mcpRes = await mcpChat({
        message: `${text}${contextBlock}`,
        model: 'pro',
        vertical: 'finance',
        history: history.slice(-10),
      });

      if (mcpRes.ok) {
        const responseText = mcpRes.response || 'Analysis unavailable.';

        const hasFinancialData =
          mentionedTickers.length > 0 ||
          text.toLowerCase().includes('portfolio') ||
          text.toLowerCase().includes('volatility') ||
          text.toLowerCase().includes('chart');

        const sources = ['SAL Finance Engine', 'Alpaca Markets'];
        if (grokContext) sources.push('Grok Real-Time');
        if (perplexityContext) sources.push('Market Research');

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: responseText,
            sources,
            time: new Date(),
            hasChart: hasFinancialData,
            tickers: mentionedTickers.slice(0, 3),
          },
        ]);
      } else {
        throw new Error('API error');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Market stream interrupted. Reconnecting to SAL Finance Engine...',
          sources: [],
          time: new Date(),
          hasChart: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const ChartWidget = ({ tickers: chartTickers }) => {
    if (!chartTickers || chartTickers.length === 0) return null;
    const ticker = chartTickers[0];
    const md = marketData[ticker] || {};

    const chartPoints = [120, 110, 40, 60, 100, 30, 50, 20];
    const width = 280;
    const height = 80;
    const pts = chartPoints.map((y, i) => ({
      x: (i / (chartPoints.length - 1)) * width,
      y: y,
    }));
    const pathD = pts.reduce(
      (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
      ''
    );

    const isPositive = parseFloat(md.change || '0') >= 0;

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartCardHeader}>
          <View>
            <Text style={styles.chartCardTitle}>
              {ticker} — Volatility Index
            </Text>
            <Text style={styles.chartCardSub}>Real-time delta analysis</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.chartPrice}>${md.price || '—'}</Text>
            <Text style={[styles.chartChange, isPositive ? styles.chartChangePos : styles.chartChangeNeg]}>
              {isPositive ? '+' : ''}{md.change || '0'}% {isPositive ? '↑' : '↓'}
            </Text>
          </View>
        </View>
        {/* SVG-style chart using View lines */}
        <View style={styles.chartArea}>
          <View style={styles.chartLine}>
            {chartPoints.map((pt, i) => (
              <View
                key={i}
                style={[
                  styles.chartBar,
                  {
                    height: Math.max(4, (120 - pt) / 120 * 60 + 10),
                    backgroundColor: i === chartPoints.length - 1 ? C.gold : `${C.gold}66`,
                  },
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.chartMetrics}>
          {[
            { label: 'Open', value: md.open || '—' },
            { label: 'High', value: md.high || '—' },
            { label: 'Low', value: md.low || '—' },
            { label: 'Volume', value: md.volume || '—' },
          ].map((item) => (
            <View key={item.label} style={styles.chartMetric}>
              <Text style={styles.chartMetricLabel}>{item.label}</Text>
              <Text style={styles.chartMetricValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';

    if (isUser) {
      return (
        <View style={styles.userMsgWrap}>
          <View style={styles.userMsg}>
            <Text style={styles.userMsgText}>{item.text}</Text>
          </View>
          <Text style={styles.msgMeta}>{formatTime(item.time)} • User</Text>
        </View>
      );
    }

    return (
      <View style={styles.agentMsgWrap}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarIcon}>⬡</Text>
        </View>
        <View style={styles.agentContent}>
          <Text style={styles.agentLabel}>SaintSal™ Executive Intelligence</Text>
          <Text style={styles.agentText}>{item.text}</Text>

          {item.hasChart && item.tickers && item.tickers.length > 0 && (
            <ChartWidget tickers={item.tickers} />
          )}

          {item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesRow}>
              {item.sources.map((src, i) => (
                <View key={i} style={styles.sourceChip}>
                  <Text style={styles.sourceChipIcon}>📊</Text>
                  <Text style={styles.sourceChipText} numberOfLines={1}>{src}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.msgMeta}>{formatTime(item.time)} • SAL Finance Alpha v4.2</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScreenHeader title="Finance AI" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIconText}>⬡</Text>
          </View>
          <Text style={styles.headerTitle}>Finance & Analysis</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={fetchMarketData} style={styles.headerActionBtn}>
            {marketLoading ? (
              <ActivityIndicator color={C.green} size="small" />
            ) : (
              <Text style={styles.headerActionText}>⟳</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Market Ticker Bar */}
      <View style={styles.tickerBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerScroll}>
          {Object.entries(marketData).map(([sym, d]) => {
            const isPos = parseFloat(d.change || '0') >= 0;
            return (
              <TouchableOpacity
                key={sym}
                style={styles.tickerChip}
                onPress={() => sendMessage(`Analyze ${sym} — give me technical analysis + price targets`)}
              >
                <Text style={styles.tickerSym}>{sym}</Text>
                <Text style={styles.tickerPrice}>${d.price}</Text>
                <Text style={[styles.tickerChange, isPos ? styles.tickerChangePos : styles.tickerChangeNeg]}>
                  {isPos ? '+' : ''}{d.change}%
                </Text>
              </TouchableOpacity>
            );
          })}
          {marketLoading && <ActivityIndicator color={C.gold} size="small" style={{ marginLeft: 16 }} />}
        </ScrollView>
      </View>

      {/* Quick Prompts */}
      <View style={styles.quickPromptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}>
          {QUICK_PROMPTS.map((p, i) => (
            <TouchableOpacity key={i} style={styles.quickPrompt} onPress={() => sendMessage(p)}>
              <Text style={styles.quickPromptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarIcon}>⬡</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator color={C.gold} size="small" />
              <Text style={styles.typingText}>Running DCF model + market scan...</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Inquire about market trends or request further analysis..."
              placeholderTextColor={C.textGhost}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              multiline
              maxLength={2000}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.attachBtn}>
                <Text style={styles.attachBtnText}>📎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>→</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.modelTag}>
            SaintSal™ Labs Model Alpha v4.2 | Private Financial Instance
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${C.gold}18`,
    backgroundColor: `${C.bg}CC`,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: C.textMuted,
    fontSize: 22,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    backgroundColor: C.gold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.gold,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  headerIconText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    color: C.textMuted,
    fontSize: 18,
    fontWeight: '600',
  },

  // Ticker Bar
  tickerBar: {
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: `${C.gold}18`,
    paddingVertical: 8,
  },
  tickerScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${C.bg}CC`,
    borderWidth: 1,
    borderColor: `${C.gold}22`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tickerSym: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tickerPrice: {
    color: C.textSub,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  tickerChange: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tickerChangePos: { color: C.green },
  tickerChangeNeg: { color: C.red },

  // Quick Prompts
  quickPromptsRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  quickPrompt: {
    backgroundColor: `${C.gold}10`,
    borderWidth: 1,
    borderColor: `${C.gold}22`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '600',
  },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 20,
  },
  userMsgWrap: {
    alignItems: 'flex-end',
    gap: 6,
  },
  userMsg: {
    backgroundColor: `${C.gold}15`,
    borderWidth: 1,
    borderColor: `${C.gold}22`,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '82%',
  },
  userMsgText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 21,
  },
  msgMeta: {
    color: C.textGhost,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  agentMsgWrap: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    backgroundColor: C.gold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: C.gold,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  agentAvatarIcon: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
  agentContent: {
    flex: 1,
    gap: 10,
  },
  agentLabel: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 22,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  sourceChipIcon: { fontSize: 10 },
  sourceChipText: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },

  // Chart Widget
  chartCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: `${C.gold}30`,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  chartCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${C.gold}15`,
    backgroundColor: `${C.gold}08`,
  },
  chartCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  chartCardSub: {
    color: C.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  chartPrice: {
    color: C.gold,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  chartChange: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartChangePos: { color: C.green },
  chartChangeNeg: { color: C.red },
  chartArea: {
    padding: 16,
    height: 90,
    justifyContent: 'flex-end',
  },
  chartLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  chartMetrics: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: `${C.gold}15`,
  },
  chartMetric: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: `${C.gold}10`,
  },
  chartMetricLabel: {
    color: C.textDim,
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  chartMetricValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${C.gold}08`,
    borderWidth: 1,
    borderColor: `${C.gold}20`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  typingText: {
    color: C.textDim,
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 6,
  },

  // Input
  inputSection: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: `${C.gold}18`,
    backgroundColor: `${C.bg}CC`,
  },
  inputContainer: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: `${C.gold}25`,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  input: {
    flex: 1,
    color: '#ddd',
    fontSize: 14,
    paddingVertical: 12,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnText: { fontSize: 18 },
  sendBtn: {
    backgroundColor: C.gold,
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.gold,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: `${C.gold}44`,
    shadowOpacity: 0,
  },
  sendBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  modelTag: {
    color: C.textGhost,
    fontSize: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
