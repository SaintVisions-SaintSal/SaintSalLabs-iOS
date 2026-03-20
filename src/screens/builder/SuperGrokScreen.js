/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SUPERGROK ORCHESTRATION SCREEN
   "Watch the AI Think Before It Builds"
   4-Agent Visible Planning → SAL Execution
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { C, T } from '../../config/theme';
import { SALMark } from '../../components';
import useGrokOrchestrator, { AGENTS } from '../../hooks/useGrokOrchestrator';

const { width: SW } = Dimensions.get('window');

/* ── Phases for the pipeline visualization ────────── */
const PIPELINE = [
  { key: 'captain',     label: 'DECOMPOSE' },
  { key: 'harper',      label: 'RESEARCH' },
  { key: 'benjamin',    label: 'ARCHITECT' },
  { key: 'lucas',       label: 'DESIGN' },
  { key: 'synthesizer', label: 'SYNTHESIZE' },
];

/* ── Phase dot colors ──────────────────────────────── */
const PHASE_COLORS = {
  idle:      C.textGhost,
  thinking:  '#F59E0B',
  complete:  '#22C55E',
  error:     '#EF4444',
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function SuperGrokScreen() {
  const router = useRouter();
  const grok = useGrokOrchestrator();
  const [input, setInput] = useState('');
  const [expandedAgent, setExpandedAgent] = useState(null);
  const scrollRef = useRef(null);
  const pulseAnims = useRef(
    PIPELINE.reduce((acc, p) => ({ ...acc, [p.key]: new Animated.Value(1) }), {})
  ).current;

  /* ── Auto-scroll to bottom on new logs ─────────── */
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  }, [grok.logs]);

  /* ── Pulse animation for active agent ──────────── */
  useEffect(() => {
    if (grok.currentAgent) {
      const anim = pulseAnims[grok.currentAgent];
      if (anim) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();
      }
    }
    return () => {
      Object.values(pulseAnims).forEach(a => a.stopAnimation());
    };
  }, [grok.currentAgent]);

  /* ── Handle send ───────────────────────────────── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || grok.orchestrating) return;
    setInput('');
    setExpandedAgent(null);
    await grok.orchestrate(text);
  }, [input, grok]);

  /* ── Handle "Execute Plan" → go to Builder ─────── */
  const handleExecute = useCallback(() => {
    if (grok.synthesis) {
      // Navigate to builder with the plan as initial context
      router.push({
        pathname: '/builder',
        params: { plan: JSON.stringify(grok.synthesis) },
      });
    }
  }, [grok.synthesis, router]);

  /* ═══ RENDER: Header ═══════════════════════════ */
  const renderHeader = () => (
    <View style={s.header}>
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backIcon}>‹</Text>
      </TouchableOpacity>
      <View style={s.headerCenter}>
        <Text style={s.headerKicker}>SUPERGROK · ORCHESTRATION</Text>
        <Text style={s.headerTitle}>Think → Plan → Build</Text>
      </View>
      <TouchableOpacity onPress={grok.reset} style={s.resetBtn}>
        <Text style={s.resetText}>RESET</Text>
      </TouchableOpacity>
    </View>
  );

  /* ═══ RENDER: Pipeline Visualization ═══════════ */
  const renderPipeline = () => (
    <View style={s.pipeline}>
      {PIPELINE.map((phase, i) => {
        const state = grok.phaseStates[phase.key];
        const isActive = grok.currentAgent === phase.key;
        const color = PHASE_COLORS[state] || PHASE_COLORS.idle;
        const agent = AGENTS[phase.key];

        return (
          <React.Fragment key={phase.key}>
            <TouchableOpacity
              style={[s.pipeNode, isActive && s.pipeNodeActive]}
              onPress={() => setExpandedAgent(expandedAgent === phase.key ? null : phase.key)}
            >
              <Animated.View
                style={[
                  s.pipeDot,
                  { backgroundColor: color },
                  isActive && { opacity: pulseAnims[phase.key] },
                ]}
              />
              <Text style={[s.pipeIcon, isActive && { opacity: 1 }]}>{agent?.icon}</Text>
              <Text style={[
                s.pipeLabel,
                state === 'complete' && { color: '#22C55E' },
                isActive && { color: C.amber },
              ]}>
                {phase.label}
              </Text>
              {state === 'complete' && <Text style={s.pipeCheck}>✓</Text>}
            </TouchableOpacity>
            {i < PIPELINE.length - 1 && (
              <View style={[
                s.pipeConnector,
                state === 'complete' && { backgroundColor: '#22C55E44' },
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  /* ═══ RENDER: Agent Detail Panel ═══════════════ */
  const renderAgentDetail = () => {
    if (!expandedAgent) return null;
    const agent = AGENTS[expandedAgent];
    const output = grok.agentOutputs[expandedAgent];
    if (!agent) return null;

    return (
      <View style={s.agentPanel}>
        <View style={s.agentHeader}>
          <Text style={s.agentIcon}>{agent.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.agentName}>{agent.name}</Text>
            <Text style={s.agentRole}>{agent.role}</Text>
          </View>
          <TouchableOpacity onPress={() => setExpandedAgent(null)}>
            <Text style={{ color: C.textDim, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {output?.reasoning ? (
          <View style={s.reasoningBlock}>
            <Text style={s.reasoningLabel}>REASONING</Text>
            <Text style={s.reasoningText}>{output.reasoning.slice(0, 500)}</Text>
          </View>
        ) : null}

        {output?.content ? (
          <ScrollView style={s.agentOutput} nestedScrollEnabled>
            <Text style={s.agentOutputText}>{output.content}</Text>
          </ScrollView>
        ) : (
          <View style={s.agentWaiting}>
            <ActivityIndicator size="small" color={agent.color || C.amber} />
            <Text style={s.agentWaitingText}>Waiting...</Text>
          </View>
        )}

        {output?.usage && (
          <View style={s.usageRow}>
            <Text style={s.usageText}>
              Tokens: {output.usage.total_tokens?.toLocaleString()} · Model: {output.model || 'grok-4'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /* ═══ RENDER: Live Activity Log ═══════════════ */
  const renderActivityLog = () => (
    <ScrollView
      ref={scrollRef}
      style={s.logScroll}
      contentContainerStyle={s.logContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome state */}
      {grok.logs.length === 0 && !grok.orchestrating && (
        <View style={s.welcome}>
          <LinearGradient
            colors={['#F59E0B22', '#F59E0B08', 'transparent']}
            style={s.welcomeGlow}
          />
          <Text style={s.welcomeIcon}>⚡</Text>
          <Text style={s.welcomeTitle}>SuperGrok</Text>
          <Text style={s.welcomeDesc}>
            Powered by Grok 4 multi-agent reasoning.{'\n'}
            Watch 4 AI agents think, debate, and plan{'\n'}
            before SAL builds your project.
          </Text>
          <View style={s.agentGrid}>
            {Object.entries(AGENTS).filter(([k]) => k !== 'synthesizer').map(([key, agent]) => (
              <View key={key} style={s.agentCard}>
                <Text style={s.agentCardIcon}>{agent.icon}</Text>
                <Text style={s.agentCardName}>{agent.name}</Text>
                <Text style={s.agentCardDesc}>{agent.desc}</Text>
              </View>
            ))}
          </View>
          <View style={s.patentBadge}>
            <Text style={s.patentText}>US Patent #10,290,222 · HACP Protocol</Text>
          </View>
        </View>
      )}

      {/* Log entries */}
      {grok.logs.map((log, i) => {
        const agent = AGENTS[log.agent] || { icon: '⚙', name: 'System', color: C.textDim };
        const isThinking = log.type === 'thinking';
        const isError = log.type === 'error';
        const isPhase = log.type === 'phase';

        return (
          <View key={i} style={[s.logEntry, isError && s.logEntryError]}>
            <View style={s.logLeft}>
              <Text style={s.logIcon}>{agent.icon}</Text>
              <View style={[s.logLine, { backgroundColor: agent.color || C.textGhost }]} />
            </View>
            <View style={s.logRight}>
              <View style={s.logMeta}>
                <Text style={[s.logAgent, { color: agent.color || C.textDim }]}>
                  {agent.name}
                </Text>
                <Text style={s.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              </View>
              {isPhase && (
                <View style={s.phaseTag}>
                  <Text style={s.phaseTagText}>{log.content}</Text>
                </View>
              )}
              {isThinking && (
                <View style={s.thinkingBlock}>
                  <Text style={s.thinkingText}>{log.content}</Text>
                </View>
              )}
              {log.type === 'result' && (
                <Text style={s.logResultText}>{log.content}</Text>
              )}
              {isError && (
                <Text style={s.logErrorText}>{log.content}</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Active thinking indicator */}
      {grok.orchestrating && grok.currentAgent && (
        <View style={s.activeIndicator}>
          <ActivityIndicator size="small" color={AGENTS[grok.currentAgent]?.color || C.amber} />
          <Text style={s.activeText}>
            {AGENTS[grok.currentAgent]?.icon} {AGENTS[grok.currentAgent]?.name}: {grok.currentLabel}
          </Text>
        </View>
      )}

      {/* Synthesis complete → Execute button */}
      {grok.synthesis && !grok.orchestrating && (
        <View style={s.synthResult}>
          <LinearGradient
            colors={['#22C55E15', '#22C55E08', 'transparent']}
            style={s.synthGlow}
          />
          <Text style={s.synthTitle}>Plan Ready</Text>
          <Text style={s.synthDesc}>
            All 4 agents have completed analysis.{'\n'}
            Ready to execute via SAL Builder.
          </Text>
          <View style={s.synthActions}>
            <TouchableOpacity style={s.executeBtn} onPress={handleExecute}>
              <LinearGradient
                colors={[C.amber, '#D97706']}
                style={s.executeBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={s.executeBtnText}>⚡ EXECUTE PLAN</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={s.viewPlanBtn} onPress={() => setExpandedAgent('synthesizer')}>
              <Text style={s.viewPlanText}>VIEW FULL PLAN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  /* ═══ RENDER: Input Bar ════════════════════════ */
  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={s.inputBar}>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe what you want to build..."
            placeholderTextColor={C.textGhost}
            multiline
            maxLength={2000}
            editable={!grok.orchestrating}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() && !grok.orchestrating) && s.sendBtnDisabled]}
            onPress={grok.orchestrating ? grok.cancel : handleSend}
            disabled={!input.trim() && !grok.orchestrating}
          >
            {grok.orchestrating ? (
              <Text style={s.sendIcon}>⬛</Text>
            ) : (
              <Text style={s.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={s.inputMeta}>
          <Text style={s.inputMetaText}>GROK 4 · 4-AGENT MODE · PATENT #10,290,222</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  /* ═══ MAIN RENDER ═══════════════════════════════ */
  return (
    <SafeAreaView style={s.safe}>
      {renderHeader()}
      {renderPipeline()}
      {renderAgentDetail()}
      {renderActivityLog()}
      {renderInput()}
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* ── Header ──────────────────────────────────── */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: C.textMuted, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerKicker: {
    fontSize: 9, fontWeight: '800', letterSpacing: 1.5,
    color: C.amber, marginBottom: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  resetBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  resetText: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 0.8 },

  /* ── Pipeline ────────────────────────────────── */
  pipeline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: C.bgCard,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pipeNode: {
    alignItems: 'center', width: (SW - 80) / 5,
  },
  pipeNodeActive: {},
  pipeDot: {
    width: 8, height: 8, borderRadius: 4,
    marginBottom: 4,
  },
  pipeIcon: { fontSize: 16, marginBottom: 2, opacity: 0.5 },
  pipeLabel: {
    fontSize: 8, fontWeight: '800', letterSpacing: 0.8,
    color: C.textGhost, textAlign: 'center',
  },
  pipeCheck: { fontSize: 10, color: '#22C55E', marginTop: 1 },
  pipeConnector: {
    width: 12, height: 2, borderRadius: 1,
    backgroundColor: C.border, marginBottom: 18,
  },

  /* ── Agent Panel ─────────────────────────────── */
  agentPanel: {
    backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border,
    maxHeight: 260,
  },
  agentHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  agentIcon: { fontSize: 24 },
  agentName: { fontSize: 15, fontWeight: '700', color: C.text },
  agentRole: { fontSize: 11, color: C.textMuted },
  reasoningBlock: {
    margin: 12, padding: 10, borderRadius: 8,
    backgroundColor: '#F59E0B0A', borderWidth: 1, borderColor: '#F59E0B22',
  },
  reasoningLabel: {
    fontSize: 9, fontWeight: '800', letterSpacing: 1,
    color: C.amber, marginBottom: 4,
  },
  reasoningText: { fontSize: 12, lineHeight: 18, color: C.textSub, fontStyle: 'italic' },
  agentOutput: { paddingHorizontal: 16, paddingVertical: 8, maxHeight: 140 },
  agentOutputText: { fontSize: 12, lineHeight: 19, color: C.textSub, fontFamily: 'monospace' },
  agentWaiting: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 16,
  },
  agentWaitingText: { fontSize: 12, color: C.textDim },
  usageRow: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  usageText: { fontSize: 10, color: C.textGhost },

  /* ── Activity Log ────────────────────────────── */
  logScroll: { flex: 1 },
  logContent: { padding: 16 },

  /* Welcome */
  welcome: { alignItems: 'center', paddingTop: 20, paddingBottom: 30 },
  welcomeGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
  },
  welcomeIcon: { fontSize: 48, marginBottom: 12 },
  welcomeTitle: {
    fontSize: 28, fontWeight: '800', color: C.text,
    letterSpacing: -0.5, marginBottom: 8,
  },
  welcomeDesc: {
    fontSize: 14, lineHeight: 22, color: C.textMuted,
    textAlign: 'center', paddingHorizontal: 20, marginBottom: 24,
  },
  agentGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 8, marginBottom: 20,
  },
  agentCard: {
    width: (SW - 56) / 2, padding: 14, borderRadius: 14,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
  },
  agentCardIcon: { fontSize: 24, marginBottom: 6 },
  agentCardName: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  agentCardDesc: { fontSize: 11, lineHeight: 16, color: C.textDim },
  patentBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: '#F59E0B22',
  },
  patentText: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 0.5 },

  /* Log entries */
  logEntry: {
    flexDirection: 'row', marginBottom: 12,
  },
  logEntryError: {},
  logLeft: { width: 32, alignItems: 'center' },
  logIcon: { fontSize: 16, marginBottom: 4 },
  logLine: { width: 2, flex: 1, borderRadius: 1, opacity: 0.3 },
  logRight: { flex: 1, marginLeft: 8 },
  logMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  logAgent: { fontSize: 12, fontWeight: '700' },
  logTime: { fontSize: 9, color: C.textGhost },
  phaseTag: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: '#F59E0B22',
    alignSelf: 'flex-start',
  },
  phaseTagText: { fontSize: 11, color: C.amber, fontWeight: '600' },
  thinkingBlock: {
    padding: 8, borderRadius: 8,
    backgroundColor: '#818CF808', borderWidth: 1, borderColor: '#818CF822',
  },
  thinkingText: { fontSize: 11, lineHeight: 17, color: C.textSub, fontStyle: 'italic' },
  logResultText: { fontSize: 12, lineHeight: 19, color: C.textSub },
  logErrorText: { fontSize: 12, color: '#EF4444' },

  /* Active indicator */
  activeIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 10,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    marginTop: 8,
  },
  activeText: { fontSize: 12, color: C.textMuted },

  /* Synthesis */
  synthResult: {
    marginTop: 16, padding: 20, borderRadius: 16,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: '#22C55E33',
    alignItems: 'center', overflow: 'hidden',
  },
  synthGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
  },
  synthTitle: {
    fontSize: 20, fontWeight: '800', color: '#22C55E',
    letterSpacing: -0.3, marginBottom: 6,
  },
  synthDesc: {
    fontSize: 13, lineHeight: 20, color: C.textMuted,
    textAlign: 'center', marginBottom: 20,
  },
  synthActions: { gap: 10, width: '100%' },
  executeBtn: { borderRadius: 12, overflow: 'hidden' },
  executeBtnGrad: {
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  executeBtnText: {
    fontSize: 15, fontWeight: '800', color: '#000',
    letterSpacing: 0.5,
  },
  viewPlanBtn: {
    paddingVertical: 12, alignItems: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  viewPlanText: { fontSize: 12, fontWeight: '700', color: C.textDim, letterSpacing: 0.5 },

  /* ── Input Bar ───────────────────────────────── */
  inputBar: {
    paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 4,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: C.bgInput, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingLeft: 14, paddingRight: 6, paddingVertical: 6,
  },
  input: {
    flex: 1, fontSize: 14, color: C.text, maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.textGhost },
  sendIcon: { fontSize: 16, fontWeight: '800', color: '#000' },
  inputMeta: { alignItems: 'center', paddingTop: 4, paddingBottom: 2 },
  inputMetaText: {
    fontSize: 8, fontWeight: '800', letterSpacing: 1.2,
    color: C.textGhost,
  },
});
