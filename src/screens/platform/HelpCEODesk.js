/* ═══════════════════════════════════════════════════
   STITCH SCREEN — HELP CO-CEO DESK
   Source: stitch_ai_chat_suite/elite_help_co_ceo_desk
   AI Co-CEO assistant, Claude claude-opus-4-5 with executive system prompt
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_KEY = 'LABS_BACKEND_PROXY';

const CEO_SYSTEM_PROMPT = `You are SAL Co-CEO — an elite executive AI assistant for SaintSal™ Labs (Patent #10,290,222). You operate with the authority and strategic acumen of a Fortune 500 CEO combined with the technical depth of a world-class CTO.

Your responsibilities:
- Strategic business planning and execution
- Cross-department coordination and prioritization
- Executive decision support with data-driven insights
- Competitive analysis and market intelligence
- Team leadership and organizational design
- Financial modeling and growth strategy

Communication style: Direct, confident, action-oriented. Provide actionable recommendations, not vague advice. Think like Jensen Huang meets Sam Altman meets Warren Buffett.`;

const QUICK_ACTIONS = [
  { icon: '📊', label: 'Strategic Review', prompt: 'Conduct a full strategic review of SaintSal Labs Q2 priorities' },
  { icon: '💰', label: 'Revenue Analysis', prompt: 'Analyze our revenue model and top growth opportunities' },
  { icon: '⚡', label: 'Decision Support', prompt: 'Help me make a critical business decision with a decision framework' },
  { icon: '🎯', label: 'OKRs', prompt: 'Help me build quarterly OKRs for maximum impact' },
  { icon: '🏆', label: 'Competitive Intel', prompt: 'What should SaintSal do about major AI competitors in 2026?' },
  { icon: '🔮', label: ' 90-Day Plan', prompt: 'Create a 90-day strategic execution plan for scaling SaintSal Labs' },
];

export default function HelpCEODesk() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Good to have you in the war room. I'm your AI Co-CEO — fully briefed on SaintSal Labs, HACP Protocol, and your strategic objectives. What executive decision can we tackle today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sendMessage = async (content) => {
    const text = content || input.trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          system: CEO_SYSTEM_PROMPT,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          max_tokens: 1200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.content?.[0]?.text || 'Strategic response received.';
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Anthropic API returned ${res.status}. Executive systems on standby.` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network connection interrupted. Executive intelligence on standby — check your connection.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SAL CO-CEO DESK</Text>
          <View style={s.statusRow}>
            <Animated.View style={[s.statusDot, { opacity: pulseAnim }]} />
            <Text style={s.statusTxt}>ONLINE & STRATEGIC</Text>
          </View>
        </View>
        <View style={s.eliteBadge}>
          <Text style={s.eliteTxt}>ELITE</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Co-CEO Profile */}
          <View style={s.profile}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>SAL</Text>
              </View>
              <View style={s.onlineDot} />
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>SAL Co-CEO</Text>
              <Text style={s.profileRole}>Strategic Executive AI · Elite Help Desk</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={s.actionsSection}>
            <Text style={s.sectionLabel}>EXECUTIVE QUICK ACTIONS</Text>
            <View style={s.actionsGrid}>
              {QUICK_ACTIONS.map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={s.actionCard}
                  onPress={() => sendMessage(action.prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionIcon}>{action.icon}</Text>
                  <Text style={s.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Messages */}
          <View style={s.messagesSection}>
            <Text style={s.sectionLabel}>EXECUTIVE BRIEFING</Text>
            <ScrollView
              ref={scrollRef}
              style={s.messages}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, i) => (
                <View key={i} style={[s.bubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
                  {msg.role === 'assistant' && (
                    <Text style={s.bubbleRole}>SAL CO-CEO</Text>
                  )}
                  <Text style={[s.bubbleText, msg.role === 'user' && s.userBubbleText]}>
                    {msg.content}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={s.aiBubble}>
                  <Text style={s.bubbleRole}>SAL CO-CEO</Text>
                  <View style={s.typingRow}>
                    <ActivityIndicator size="small" color={C.gold} />
                    <Text style={s.typingTxt}>Strategizing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Brief me on your executive challenge..."
            placeholderTextColor={C.textGhost}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={s.sendBtnTxt}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusTxt: { fontSize: 8, fontWeight: '700', color: C.green, letterSpacing: 2 },
  eliteBadge: { backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  eliteTxt: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  scroll: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.gold + '20', borderWidth: 2, borderColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: '900', color: C.gold },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: C.green, borderWidth: 2, borderColor: C.bg },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800', color: C.text },
  profileRole: { fontSize: 12, color: C.gold, marginTop: 2 },
  actionsSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'flex-start' },
  actionIcon: { fontSize: 22, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: C.text },
  messagesSection: { paddingHorizontal: 16 },
  messages: { maxHeight: 400 },
  bubble: { borderRadius: 14, padding: 14, marginBottom: 12 },
  aiBubble: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, marginRight: 20 },
  userBubble: { backgroundColor: C.gold + '15', borderWidth: 1, borderColor: C.gold + '30', marginLeft: 20 },
  bubbleRole: { fontSize: 8, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 6 },
  bubbleText: { fontSize: 13, color: C.textSub, lineHeight: 20 },
  userBubbleText: { color: C.text },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingTxt: { fontSize: 12, color: C.textDim, fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard },
  textInput: { flex: 1, backgroundColor: C.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  sendBtnTxt: { fontSize: 18, fontWeight: '700', color: C.bg },
});
