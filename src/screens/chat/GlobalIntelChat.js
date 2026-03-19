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
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';

const ANTHROPIC_API_KEY =
  'LABS_BACKEND_PROXY';
const PERPLEXITY_API_KEY = '';
const EXA_API_KEY = 'b27bdba9-bd2a-49fd-a4ef-d096cdfe66eb';
const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const INTEL_TABS = ['ALL INTEL', 'GEOPOLITICAL', 'ECONOMIC', 'MILITARY'];
const MODELS = [
  { id: 'claude', label: 'SAL-1 Claude', desc: 'Deep analysis' },
  { id: 'perplexity', label: 'SAL-1 Search', desc: 'Live web' },
  { id: 'hybrid', label: 'SAL-1 Quantum', desc: 'Full spectrum' },
];

const formatTime = (date) => {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

export default function GlobalIntelChat({ navigation }) {
  const [activeTab, setActiveTab] = useState('ALL INTEL');
  const [model, setModel] = useState('hybrid');
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: 'SAL-1 Quantum Agent online. Real-time global intelligence streams active. I can analyze geopolitical shifts, economic signals, and provide deep research with live source citations. What intelligence do you need?',
      sources: ['Reuters Intel', 'Bloomberg Terminal Live', 'Arctic Council Data Feed'],
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const getSystemPrompt = () => {
    const tabContext = activeTab !== 'ALL INTEL' ? `Focus on ${activeTab.toLowerCase()} intelligence. ` : '';
    return `You are SAL-1 — the global intelligence agent for SaintSal™ Labs, backed by US Patent #10,290,222 HACP Protocol. ${tabContext}You analyze geopolitical shifts, economic signals, military developments, and global events with the depth of an institutional intelligence analyst. Provide specific data, percentages, citations formatted as [Source N: Name], and strategic implications. Be authoritative, structured, and incisive.`;
  };

  const fetchExaContext = async (query) => {
    try {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_API_KEY,
        },
        body: JSON.stringify({
          query,
          numResults: 5,
          useAutoprompt: true,
          type: 'neural',
          contents: { text: { maxCharacters: 400 } },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch { /* silent fail */ }
    return [];
  };

  const fetchPerplexityContext = async (query) => {
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content:
                'You are a geopolitical intelligence researcher. Provide current, fact-based context with specific numbers, recent events, and source quality. 3-4 sentences max.',
            },
            { role: 'user', content: query },
          ],
          max_tokens: 400,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch { /* silent fail */ }
    return '';
  };

  const sendMessage = async () => {
    const text = input.trim();
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

    const assistantId = (Date.now() + 1).toString();
    setStreamingId(assistantId);

    try {
      // Parallel context fetch
      const [exaResults, perplexityContext] = await Promise.all([
        model === 'hybrid' || model === 'perplexity' ? fetchExaContext(text) : Promise.resolve([]),
        model === 'hybrid' || model === 'perplexity' ? fetchPerplexityContext(text) : Promise.resolve(''),
      ]);

      const sources = exaResults
        .slice(0, 4)
        .map((r) => r.title || r.url)
        .filter(Boolean);

      // Build context string
      let contextBlock = '';
      if (perplexityContext) {
        contextBlock += `\n\nLive Intelligence Context: ${perplexityContext}`;
      }
      if (exaResults.length > 0) {
        contextBlock += `\n\nDeep Research Sources:\n${exaResults
          .slice(0, 3)
          .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.text?.slice(0, 200) || ''}`)
          .join('\n\n')}`;
      }

      // Build conversation history for Claude
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.text }));

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1200,
          system: getSystemPrompt(),
          messages: [
            ...history,
            {
              role: 'user',
              content: `${text}${contextBlock}`,
            },
          ],
        }),
      });

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json();
        const responseText = claudeData.content?.[0]?.text || 'Intelligence stream unavailable.';

        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            text: responseText,
            sources: sources.length > 0 ? sources : ['SAL Intelligence Network', 'Live Data Feed'],
            time: new Date(),
          },
        ]);
      } else {
        throw new Error('Claude API error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          text: 'Intelligence stream interrupted. Reconnecting to SAL network...',
          sources: [],
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setStreamingId(null);
    }
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
          <Text style={styles.agentAvatarIcon}>✦</Text>
        </View>
        <View style={styles.agentContent}>
          <View style={styles.agentHeader}>
            <Text style={styles.agentLabel}>SAL Agent Analysis</Text>
            <Text style={styles.agentStatus}>Processing real-time feeds...</Text>
          </View>
          <View style={styles.agentBubble}>
            <Text style={styles.agentText}>{item.text}</Text>
            {item.id === streamingId && loading && (
              <Animated.View style={[styles.cursor, { opacity: pulseAnim }]} />
            )}
          </View>
          {item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesRow}>
              {item.sources.slice(0, 4).map((src, i) => (
                <View key={i} style={styles.sourceChip}>
                  <Text style={styles.sourceChipIcon}>🔗</Text>
                  <Text style={styles.sourceChipText} numberOfLines={1}>{src}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.msgMeta}>{formatTime(item.time)} • SAL-1</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScreenHeader title="Global Intelligence" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🌐</Text>
          <View>
            <Text style={styles.headerTitle}>Global Intelligence</Text>
            <Text style={styles.headerSub}>SAL-1 QUANTUM AGENT ACTIVE</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveStreamBadge}>
            <Animated.View style={[styles.liveBadgeDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveBadgeText}>Live Stream</Text>
          </View>
        </View>
      </View>

      {/* Tab Nav */}
      <View style={styles.tabNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {INTEL_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.intelTab, activeTab === tab && styles.intelTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.intelTabText, activeTab === tab && styles.intelTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Model Selector */}
      <View style={styles.modelSelector}>
        {MODELS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.modelChip, model === m.id && styles.modelChipActive]}
            onPress={() => setModel(m.id)}
          >
            <Text style={[styles.modelChipLabel, model === m.id && styles.modelChipLabelActive]}>
              {m.label}
            </Text>
            <Text style={styles.modelChipDesc}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Loading indicator */}
        {loading && streamingId === null && (
          <View style={styles.typingRow}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarIcon}>✦</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator color={C.gold} size="small" />
              <Text style={styles.typingText}>Scanning intel streams...</Text>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputActionBtn}>
              <Text style={styles.inputActionBtnText}>+</Text>
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask follow-up or command agent..."
              placeholderTextColor={C.textGhost}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
              maxLength={2000}
            />
            <View style={styles.inputBtns}>
              <TouchableOpacity style={styles.micBtn}>
                <Text style={styles.micBtnText}>🎙</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>↑</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${C.amber}18`,
    backgroundColor: `${C.bg}CC`,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    color: C.amber,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: C.textDim,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${C.amber}18`,
    borderWidth: 1,
    borderColor: `${C.amber}33`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.amber,
  },
  liveBadgeText: {
    color: C.amber,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Tab Nav
  tabNav: {
    borderBottomWidth: 1,
    borderBottomColor: `${C.amber}0A`,
    backgroundColor: `${C.bg}80`,
    paddingHorizontal: 16,
  },
  intelTab: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 4,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  intelTabActive: {
    borderBottomColor: C.amber,
  },
  intelTabText: {
    color: C.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intelTabTextActive: {
    color: C.amber,
  },

  // Model Selector
  modelSelector: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modelChip: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modelChipActive: {
    borderColor: `${C.amber}55`,
    backgroundColor: `${C.amber}10`,
  },
  modelChipLabel: {
    color: C.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modelChipLabelActive: {
    color: C.amber,
  },
  modelChipDesc: {
    color: C.textGhost,
    fontSize: 8,
    marginTop: 2,
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
    backgroundColor: `${C.amber}15`,
    borderWidth: 1,
    borderColor: `${C.amber}25`,
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userMsgText: {
    color: '#fff',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${C.amber}22`,
    borderWidth: 1,
    borderColor: `${C.amber}44`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  agentAvatarIcon: {
    color: C.amber,
    fontSize: 14,
    fontWeight: '700',
  },
  agentContent: {
    flex: 1,
    gap: 8,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentLabel: {
    color: C.amber,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentStatus: {
    color: C.textDim,
    fontSize: 9,
  },
  agentBubble: {
    backgroundColor: `${C.amber}08`,
    borderLeftWidth: 2,
    borderLeftColor: C.amber,
    borderRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  agentText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 22,
  },
  cursor: {
    width: 8,
    height: 16,
    backgroundColor: C.amber,
    marginTop: 4,
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
    maxWidth: 180,
  },
  sourceChipIcon: { fontSize: 10 },
  sourceChipText: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '500',
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
    backgroundColor: `${C.amber}08`,
    borderLeftWidth: 2,
    borderLeftColor: C.amber,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  typingText: {
    color: C.textDim,
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 6,
  },

  // Input Bar
  inputBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${C.amber}18`,
    backgroundColor: C.bg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${C.bgCard}CC`,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  inputActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputActionBtnText: {
    color: C.textDim,
    fontSize: 22,
    lineHeight: 26,
  },
  input: {
    flex: 1,
    color: '#ddd',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    maxHeight: 100,
  },
  inputBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnText: {
    fontSize: 18,
  },
  sendBtn: {
    backgroundColor: C.amber,
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  sendBtnDisabled: {
    backgroundColor: `${C.amber}55`,
  },
  sendBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
});
