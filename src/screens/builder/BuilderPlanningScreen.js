/* ═══════════════════════════════════════════════════
   SCREEN 16 — AI PLANNING AGENT
   builder_ai_planning_agent → HACP Protocol
   Wire: Claude claude-sonnet-4-6 streaming plan generation
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { streamChat, API_BASE } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const PLAN_TYPES = [
  { id: 'feature',  label: 'FEATURE', icon: '⚡' },
  { id: 'app',      label: 'FULL APP', icon: '📱' },
  { id: 'api',      label: 'API',      icon: '🔌' },
  { id: 'auth',     label: 'AUTH',     icon: '🔐' },
  { id: 'database', label: 'DATABASE', icon: '🗄️' },
  { id: 'deploy',   label: 'DEPLOY',   icon: '🚀' },
];

const EXAMPLES = [
  'Build a secure auth flow with Supabase and magic links',
  'Create a REST API with rate limiting and JWT auth',
  'Design a real-time chat system with WebSockets',
  'Build a payment system with Stripe subscriptions',
];

export default function BuilderPlanningScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [prompt, setPrompt]   = useState('');
  const [planType, setPlanType] = useState('feature');
  const [tasks, setTasks]     = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const xhrRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const SYSTEM = `You are SAL AI Planning Agent — an elite software architect using HACP (Hierarchical Adaptive Context Protocol).
When given a feature or app request, produce a structured implementation plan with numbered tasks.
Format each task as: [STATUS] Task description — estimated time
STATUS options: ✅ (done), ⏳ (in progress), ⬜ (pending)
Be specific, technical, and comprehensive. Include file names, API routes, DB schemas when relevant.`;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setStreaming(true);
    setTasks([]);
    setRawOutput('');
    let buffer = '';

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      system: SYSTEM,
      messages: [{ role: 'user', content: `Plan type: ${planType.toUpperCase()}\n\nRequest: ${prompt}` }],
      onChunk: (chunk) => {
        buffer += chunk;
        setRawOutput(buffer);
        // Parse tasks from buffer
        const lines = buffer.split('\n').filter(l => l.trim());
        const parsed = lines.map(l => {
          const isDone = l.includes('✅');
          const isActive = l.includes('⏳');
          return { text: l.replace(/[✅⏳⬜]/g, '').trim(), status: isDone ? 'done' : isActive ? 'active' : 'pending' };
        }).filter(t => t.text.length > 3);
        setTasks(parsed);
      },
      onDone: () => setStreaming(false),
      onError: (err) => { Alert.alert('Error', err); setStreaming(false); },
    });
  };

  const handleStop = () => {
    xhrRef.current?.abort();
    setStreaming(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>AI Planning Agent</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>HACP PROTOCOL ACTIVE</Text>
          </View>
        </View>
        <View style={s.ssBadge}>
          <Text style={s.ssTxt}>SS</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Plan Type Selector */}
        <View style={s.pad}>
          <Text style={s.fieldLabel}>PLAN TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
            {PLAN_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.typeChip, planType === t.id && s.typeActive]}
                onPress={() => setPlanType(t.id)}
              >
                <Text style={s.typeIcon}>{t.icon}</Text>
                <Text style={[s.typeLabel, planType === t.id && { color: BG }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.fieldLabel}>DESCRIBE YOUR BUILD</Text>
          <TextInput
            style={s.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Build a secure auth flow with Supabase..."
            placeholderTextColor="#444"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.generateBtn, streaming && { opacity: 0.7 }]}
            onPress={streaming ? handleStop : handleGenerate}
            activeOpacity={0.85}
          >
            <Text style={s.generateTxt}>
              {streaming ? '⏹ STOP PLANNING' : '⚡ GENERATE PLAN'}
            </Text>
          </TouchableOpacity>

          {/* Quick Examples */}
          {tasks.length === 0 && !streaming && (
            <>
              <Text style={[s.fieldLabel, { marginTop: 20 }]}>QUICK EXAMPLES</Text>
              {EXAMPLES.map((ex, i) => (
                <TouchableOpacity key={i} style={s.exampleChip} onPress={() => setPrompt(ex)}>
                  <Text style={s.exampleTxt}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Streaming indicator */}
        {streaming && tasks.length === 0 && (
          <View style={s.architectingRow}>
            <View style={s.architectingIcon}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
            </View>
            <Text style={s.architectingTxt}>Architecting Implementation...</Text>
          </View>
        )}

        {/* Task List */}
        {tasks.length > 0 && (
          <View style={[s.pad, { paddingTop: 0 }]}>
            <View style={s.taskCard}>
              <Text style={s.taskCardTitle}>IMPLEMENTATION PLAN</Text>
              {tasks.map((task, i) => (
                <View key={i} style={s.taskRow}>
                  <View style={s.taskLeft}>
                    <View style={[
                      s.taskStatus,
                      task.status === 'done' ? s.taskDone :
                      task.status === 'active' ? s.taskActive : s.taskPending
                    ]}>
                      {task.status === 'done' && <Text style={s.taskStatusIcon}>✓</Text>}
                      {task.status === 'active' && <View style={s.taskSpinner} />}
                    </View>
                  </View>
                  <Text style={[
                    s.taskText,
                    task.status === 'done' && { color: '#6B7280' },
                    task.status === 'active' && { color: GOLD },
                  ]}>{task.text}</Text>
                </View>
              ))}
              {streaming && (
                <View style={s.taskRow}>
                  <Animated.View style={[s.taskStatus, s.taskActive, { opacity: pulseAnim }]}>
                    <View style={s.taskSpinner} />
                  </Animated.View>
                  <Text style={[s.taskText, { color: GOLD }]}>Generating next step...</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { fontSize: 8, fontWeight: '800', color: '#22C55E', letterSpacing: 1.5 },
  ssBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: GOLD + '50', backgroundColor: GOLD + '20', alignItems: 'center', justifyContent: 'center' },
  ssTxt: { fontSize: 11, fontWeight: '800', color: GOLD },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8, marginTop: 14 },
  typeRow: { gap: 8, paddingBottom: 4 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD },
  typeActive: { backgroundColor: GOLD, borderColor: GOLD },
  typeIcon: { fontSize: 12 },
  typeLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  promptInput: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14, minHeight: 100 },
  generateBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  generateTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  exampleChip: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 10, padding: 12, marginBottom: 8 },
  exampleTxt: { fontSize: 13, color: '#E8E6E1' },
  architectingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  architectingIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  architectingTxt: { fontSize: 13, fontWeight: '700', color: GOLD },
  taskCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: GOLD + '20' },
  taskCardTitle: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 14 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  taskLeft: { paddingTop: 2 },
  taskStatus: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskDone: { backgroundColor: '#22C55E20', borderColor: '#22C55E' },
  taskActive: { backgroundColor: GOLD + '20', borderColor: GOLD },
  taskPending: { backgroundColor: 'transparent', borderColor: '#4B5563' },
  taskStatusIcon: { fontSize: 9, color: '#22C55E', fontWeight: '800' },
  taskSpinner: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: GOLD, borderTopColor: 'transparent' },
  taskText: { flex: 1, fontSize: 13, color: '#E8E6E1', lineHeight: 18 },
});
