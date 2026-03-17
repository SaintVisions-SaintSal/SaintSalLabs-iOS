/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — CO-CEO DESK
   elite_help_co_ceo_desk — Executive AI with Claude Sonnet
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { streamSalChat } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const CEO_SYSTEM_PROMPT = `You are SaintSal™ Co-CEO — an elite executive AI strategist and business advisor. You operate at the intersection of:
- Strategic business development and growth hacking
- Financial analysis, P&L optimization, and investment strategy
- Technology architecture and product roadmap
- Operations, team building, and leadership
- Market intelligence and competitive analysis
- Legal, compliance, and risk management

You speak with executive authority, precision, and urgency. Provide actionable, CEO-level strategic guidance. Be direct, data-driven, and decisive. Format responses with clear sections when appropriate. You are a true thought partner to the founder.`;

const QUICK_BRIEFS = [
  'Morning CEO briefing — key priorities today',
  'Analyze our biggest growth opportunities',
  'What metrics should I be tracking?',
  'Review our competitive positioning',
  'Help me prepare for investor pitch',
  'Identify our biggest operational risks',
];

export default function CoCEODesk() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const xhrRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Good morning, CEO. I'm your Co-CEO — fully briefed and ready to execute. What's the strategic priority today? I can analyze your business, identify opportunities, review operations, or prepare you for any meeting.",
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    return () => xhrRef.current?.abort?.();
  }, []);

  const sendMessage = (customMsg) => {
    const msg = customMsg || input.trim();
    if (!msg || streaming) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);

    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);
    setStreaming(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    xhrRef.current = streamSalChat({
      mode: 'creative',
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      system: CEO_SYSTEM_PROMPT,
      onChunk: (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
        scrollRef.current?.scrollToEnd({ animated: false });
      },
      onDone: () => setStreaming(false),
      onError: (err) => {
        setStreaming(false);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${err}` };
          return updated;
        });
      },
    });
  };

  const PRIORITY_TASKS = [
    { id: 1, title: 'Review Q1 Revenue', priority: 'HIGH', status: 'pending', icon: '💰' },
    { id: 2, title: 'Investor Deck Update', priority: 'HIGH', status: 'in-progress', icon: '📊' },
    { id: 3, title: 'Team Hiring Plan', priority: 'MED', status: 'pending', icon: '👥' },
    { id: 4, title: 'Product Roadmap', priority: 'MED', status: 'done', icon: '🗺️' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Co-CEO Desk</Text>
          <View style={styles.headerStatusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatus}>EXECUTIVE AI ONLINE</Text>
          </View>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{user?.email?.[0]?.toUpperCase() || 'C'}</Text>
        </View>
      </View>

      {/* Priority dashboard */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityScroll}>
        <View style={styles.priorityRow}>
          {PRIORITY_TASKS.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.priorityCard, task.status === 'done' && styles.priorityCardDone]}
              onPress={() => sendMessage(`Help me with: ${task.title}`)}
            >
              <Text style={styles.priorityIcon}>{task.icon}</Text>
              <Text style={styles.priorityTitle}>{task.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: task.priority === 'HIGH' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }
              ]}>
                <Text style={[
                  styles.priorityBadgeText,
                  { color: task.priority === 'HIGH' ? '#f87171' : GOLD }
                ]}>{task.priority}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <View key={i} style={[styles.messageRow, msg.role === 'user' && styles.messageRowUser]}>
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>C</Text>
                </View>
              )}
              <View style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}>
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                  {msg.content || (streaming && i === messages.length - 1 ? '▌' : '')}
                </Text>
              </View>
              {msg.role === 'user' && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user?.email?.[0]?.toUpperCase() || 'Y'}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Quick briefs */}
          {messages.length <= 1 && (
            <View style={styles.quickBriefs}>
              <Text style={styles.quickBriefsLabel}>QUICK EXECUTIVE BRIEFS</Text>
              <View style={styles.quickBriefsGrid}>
                {QUICK_BRIEFS.map((brief, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickBriefBtn}
                    onPress={() => sendMessage(brief)}
                  >
                    <Text style={styles.quickBriefText}>{brief}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask your Co-CEO anything..."
              placeholderTextColor={MUTED}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              onSubmitEditing={() => sendMessage()}
            />
            {streaming && <ActivityIndicator color={GOLD} size="small" style={{ marginRight: 8 }} />}
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || streaming}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick action buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <View style={styles.quickActionsRow}>
            {[
              { label: '📊 Business Review', msg: 'Give me a complete business performance review and top 3 strategic priorities' },
              { label: '💰 Revenue Strategy', msg: 'How can I increase monthly revenue by 30% in the next 90 days?' },
              { label: '📋 Delegate Tasks', msg: 'Help me prioritize and delegate my current task list' },
              { label: '🎯 OKRs', msg: 'Help me set powerful OKRs for this quarter' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.quickActionBtn} onPress={() => sendMessage(action.msg)} disabled={streaming}>
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 18, fontFamily: 'PublicSans-Bold' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  headerStatus: { color: '#4ade80', fontSize: 9, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: `${GOLD}4D`, alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: GOLD, fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  priorityScroll: { maxHeight: 100, borderBottomWidth: 1, borderBottomColor: BORDER },
  priorityRow: { flexDirection: 'row', gap: 10, padding: 12 },
  priorityCard: {
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    padding: 12, minWidth: 140, gap: 6,
  },
  priorityCardDone: { opacity: 0.5 },
  priorityIcon: { fontSize: 20 },
  priorityTitle: { color: '#e2e8f0', fontWeight: '600', fontSize: 12, fontFamily: 'PublicSans-Bold' },
  priorityBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  priorityBadgeText: { fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  messagesContent: { padding: 16, paddingBottom: 8, gap: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { color: GOLD, fontWeight: '800', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  userAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: SURFACE,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  messageBubble: {
    maxWidth: '78%', padding: 14, borderRadius: 14,
  },
  aiBubble: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}4D`, borderTopRightRadius: 4 },
  messageText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22, fontFamily: 'PublicSans-Regular' },
  userMessageText: { color: '#fff' },
  quickBriefs: { marginTop: 8, gap: 12 },
  quickBriefsLabel: { color: MUTED, fontSize: 9, fontWeight: '700', letterSpacing: 4, fontFamily: 'PublicSans-Bold' },
  quickBriefsGrid: { gap: 8 },
  quickBriefBtn: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, padding: 14,
  },
  quickBriefText: { color: '#e2e8f0', fontSize: 13, fontFamily: 'PublicSans-Regular' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: BORDER },
  inputWrapper: {
    flex: 1, backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1,
    borderColor: BORDER, flexDirection: 'row', alignItems: 'center', paddingRight: 8,
  },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14, maxHeight: 120, fontFamily: 'PublicSans-Regular' },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: BLACK, fontSize: 22, fontWeight: '700' },
  quickActionsScroll: { maxHeight: 44, borderTopWidth: 1, borderTopColor: BORDER },
  quickActionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  quickActionBtn: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  quickActionText: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
});
