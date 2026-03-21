/* ═══════════════════════════════════════════════════
   SAINTSALLABS — UNIFIED BUILDER SCREEN
   Quick Build + SuperGrok Agentic Pipeline
   Kinetic Blueprint Design System
   Replaces: BuilderV2Screen.js + SuperGrokScreen.js
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Dimensions, Alert, Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SALMark } from '../../components';
import useAgentPipeline, {
  AGENTS, AGENT_IDLE, AGENT_THINKING, AGENT_COMPLETE, AGENT_ERROR,
  PHASE_IDLE, PHASE_PLANNING, PHASE_BUILDING, PHASE_WIRING, PHASE_COMPLETE, PHASE_ERROR,
} from '../../hooks/useAgentPipeline';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

/* ── Kinetic Blueprint Color Tokens ──────────────── */
const KB = {
  bg:          '#050508',
  bgCard:      '#0A0A0F',
  bgElevated:  '#111118',
  bgTerminal:  '#020204',
  neon:        '#00FF88',
  neonDim:     '#00FF8833',
  neonGlow:    '#00FF8818',
  agentGrok:   '#FF6B35',
  agentStitch: '#818CF8',
  agentClaude: '#00FF88',
  thinking:    '#F59E0B',
  complete:    '#00FF88',
  error:       '#EF4444',
  idle:        '#333340',
  text:        '#E8E6E1',
  textSub:     '#9CA3AF',
  textDim:     '#555566',
  textGhost:   '#333340',
  textTerminal:'#00FF88',
  border:      '#1A1A24',
  borderNeon:  '#00FF8833',
};

/* ── Language Colors ─────────────────────────────── */
const LANG_COLORS = {
  html: '#E34F26', css: '#1572B6', javascript: '#F7DF1E', js: '#F7DF1E',
  typescript: '#3178C6', tsx: '#3178C6', json: '#6B7280', python: '#3776AB', text: '#9CA3AF',
};

/* ── Starter Prompts ─────────────────────────────── */
const STARTERS = [
  'Build a SaaS landing page with pricing cards and CTA',
  'Create an animated portfolio with dark theme',
  'Build a todo app with local storage and smooth animations',
  'Create a dashboard with charts and real-time counters',
];

/* ── Terminal line colors by type ─────────────────── */
const TERMINAL_COLORS = {
  system:  KB.textDim,
  agent:   KB.thinking,
  success: KB.neon,
  info:    KB.textSub,
  file:    '#818CF8',
  error:   KB.error,
  complete:KB.neon,
};


/* ═══════════════════════════════════════════════════
   CORNER BRACKET DECORATOR
   Renders ┌── ──┐ style corner accents on a card
═══════════════════════════════════════════════════ */
function CornerBrackets({ color = KB.neonDim, size = 12, thickness = 1 }) {
  const style = { position: 'absolute', width: size, height: size, borderColor: color };
  return (
    <>
      <View style={[style, { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[style, { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View style={[style, { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[style, { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness }]} />
    </>
  );
}


/* ═══════════════════════════════════════════════════
   AGENT CARD COMPONENT
   Displays one agent with state-driven visuals
═══════════════════════════════════════════════════ */
function AgentCard({ agentKey, state, message }) {
  const agent = AGENTS[agentKey];
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (state === AGENT_THINKING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(state === AGENT_COMPLETE ? 1 : 0.4);
    }
  }, [state]);

  const borderColor = state === AGENT_COMPLETE ? KB.complete
    : state === AGENT_THINKING ? agent.color
    : state === AGENT_ERROR ? KB.error
    : KB.border;

  const bgColor = state === AGENT_THINKING ? agent.color + '0A'
    : state === AGENT_COMPLETE ? KB.complete + '08'
    : KB.bgCard;

  return (
    <Animated.View style={[s.agentCard, { borderColor, backgroundColor: bgColor, opacity: state === AGENT_IDLE ? 0.5 : 1 }]}>
      <CornerBrackets color={borderColor} size={8} thickness={1} />

      {/* Status dot */}
      <View style={s.agentCardHeader}>
        <Animated.View style={[
          s.agentStatusDot,
          { backgroundColor: borderColor, opacity: state === AGENT_THINKING ? pulseAnim : 1 },
        ]} />
        <Text style={[s.agentCardIcon]}>{agent.icon}</Text>
      </View>

      {/* Name + Role */}
      <Text style={[s.agentCardName, { color: state === AGENT_COMPLETE ? KB.complete : KB.text }]}>
        {agent.name}
      </Text>
      <Text style={s.agentCardRole}>{agent.role}</Text>

      {/* State label */}
      <View style={[s.agentStateTag, { borderColor }]}>
        {state === AGENT_THINKING && <ActivityIndicator size={8} color={agent.color} style={{ marginRight: 4 }} />}
        <Text style={[s.agentStateText, { color: borderColor }]}>
          {state === AGENT_IDLE ? 'WAITING' : state === AGENT_THINKING ? 'ACTIVE' : state === AGENT_COMPLETE ? 'DONE' : 'ERROR'}
        </Text>
      </View>

      {/* Message */}
      {message ? (
        <Text style={s.agentCardMsg} numberOfLines={2}>{message}</Text>
      ) : null}

      {/* Check badge */}
      {state === AGENT_COMPLETE && (
        <View style={s.agentCheckBadge}>
          <Text style={s.agentCheckMark}>✓</Text>
        </View>
      )}
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════
   PLAN PANEL COMPONENT
   Slides in after plan_ready with build details
═══════════════════════════════════════════════════ */
function PlanPanel({ plan, visible }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: visible ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  if (!plan) return null;

  const maxHeight = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });

  return (
    <Animated.View style={[s.planPanel, { maxHeight, opacity: heightAnim }]}>
      <View style={s.planInner}>
        <CornerBrackets color={KB.neonDim} size={10} />

        {/* Title row */}
        <View style={s.planTitleRow}>
          <Text style={s.planTitle}>{plan.title || 'Build Plan'}</Text>
          <View style={s.planComplexityBadge}>
            <Text style={s.planComplexityText}>{(plan.complexity || 'unknown').toUpperCase()}</Text>
          </View>
          {plan.estimated_time && (
            <Text style={s.planTime}>{plan.estimated_time}</Text>
          )}
        </View>

        {/* Components */}
        {plan.components?.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionLabel}>COMPONENTS</Text>
            <View style={s.chipRow}>
              {plan.components.map((c, i) => (
                <View key={i} style={s.planChip}>
                  <Text style={s.planChipText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* APIs */}
        {plan.apis?.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionLabel}>APIS</Text>
            <View style={s.chipRow}>
              {plan.apis.map((a, i) => (
                <View key={i} style={[s.planChip, { borderColor: KB.agentStitch + '44' }]}>
                  <Text style={[s.planChipText, { color: KB.agentStitch }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        {plan.steps?.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionLabel}>STEPS</Text>
            {plan.steps.map((step, i) => (
              <Text key={i} style={s.planStepText}>{step}</Text>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — UNIFIED BUILDER SCREEN
═══════════════════════════════════════════════════ */
export default function BuilderScreen() {
  const pipe = useAgentPipeline();
  const [buildMode, setBuildMode] = useState('quick'); // 'quick' | 'supergrok'
  const [contentView, setContentView] = useState('chat'); // 'chat' | 'terminal' | 'code' | 'preview'
  const [input, setInput] = useState('');
  const [showFileTree, setShowFileTree] = useState(false);
  const chatScrollRef = useRef(null);
  const terminalScrollRef = useRef(null);
  const webViewRef = useRef(null);
  const cursorBlink = useRef(new Animated.Value(1)).current;

  /* ── Terminal cursor blink ─────────────────────── */
  useEffect(() => {
    if (pipe.generating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorBlink, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(cursorBlink, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      cursorBlink.stopAnimation();
      cursorBlink.setValue(0);
    }
  }, [pipe.generating]);

  /* ── Auto-scroll chat ──────────────────────────── */
  useEffect(() => {
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [pipe.conversation]);

  /* ── Auto-scroll terminal ──────────────────────── */
  useEffect(() => {
    setTimeout(() => terminalScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [pipe.terminalBuffer]);

  /* ── Auto-switch views based on pipeline phase ─── */
  useEffect(() => {
    if (buildMode !== 'supergrok') return;
    switch (pipe.phase) {
      case PHASE_PLANNING:
      case PHASE_BUILDING:
        // Stay on terminal during planning/building
        if (contentView === 'chat') setContentView('terminal');
        break;
      case PHASE_WIRING:
        setContentView('terminal');
        break;
      case PHASE_COMPLETE:
        setContentView('preview');
        break;
    }
  }, [pipe.phase, buildMode]);

  /* ── Auto-switch to preview after quick build ──── */
  useEffect(() => {
    if (buildMode === 'quick' && !pipe.generating && pipe.conversation.length > 0) {
      const lastMsg = pipe.conversation[pipe.conversation.length - 1];
      if (lastMsg?.role === 'assistant' && lastMsg?.filesGenerated > 0) {
        setContentView('preview');
      }
    }
  }, [pipe.generating, pipe.conversation, buildMode]);

  /* ── Handle send ───────────────────────────────── */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || pipe.generating) return;
    setInput('');

    if (buildMode === 'supergrok') {
      pipe.startPipeline(text);
    } else {
      pipe.quickBuild(text);
    }
  }, [input, pipe, buildMode]);

  /* ── Handle copy code ──────────────────────────── */
  const handleCopyCode = useCallback(async () => {
    const allCode = pipe.files.map(f => `// === ${f.path} ===\n${f.content}`).join('\n\n');
    try {
      await Share.share({ message: allCode });
    } catch {}
  }, [pipe.files]);


  /* ═══ RENDER: Header ═══════════════════════════ */
  const renderHeader = () => (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <SALMark size={24} />
        <View>
          <Text style={s.headerKicker}>BUILDER</Text>
          <Text style={s.headerTitle}>SAL Labs</Text>
        </View>
      </View>

      {/* Mode Toggle */}
      <View style={s.modeToggle}>
        <TouchableOpacity
          style={[s.modeToggleBtn, buildMode === 'quick' && s.modeToggleBtnActive]}
          onPress={() => setBuildMode('quick')}
        >
          <Text style={[s.modeToggleText, buildMode === 'quick' && s.modeToggleTextActive]}>⚡ QUICK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.modeToggleBtn, buildMode === 'supergrok' && s.modeToggleBtnActiveGrok]}
          onPress={() => setBuildMode('supergrok')}
        >
          <Text style={[s.modeToggleText, buildMode === 'supergrok' && s.modeToggleTextActiveGrok]}>🧠 SUPERGROK</Text>
        </TouchableOpacity>
      </View>

      <View style={s.headerRight}>
        <TouchableOpacity style={s.headerBtn} onPress={() => setShowFileTree(!showFileTree)}>
          <Text style={s.headerBtnIcon}>📁</Text>
          <View style={s.headerBtnBadge}>
            <Text style={s.headerBtnBadgeText}>{pipe.files.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.headerBtn} onPress={pipe.resetProject}>
          <Text style={s.headerBtnIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  /* ═══ RENDER: Agent Cards Row (SuperGrok only) ═══ */
  const renderAgentCards = () => {
    if (buildMode !== 'supergrok') return null;
    if (pipe.phase === PHASE_IDLE && pipe.terminalBuffer.length === 0) return null;

    return (
      <View style={s.agentCardsRow}>
        {['grok', 'stitch', 'claude'].map(key => (
          <AgentCard
            key={key}
            agentKey={key}
            state={pipe.agentStates[key]}
            message={pipe.agentMessages[key]}
          />
        ))}
      </View>
    );
  };


  /* ═══ RENDER: Content View Tabs ════════════════ */
  const renderContentTabs = () => {
    const tabs = buildMode === 'supergrok'
      ? [
          { id: 'chat',     label: 'CHAT',     icon: '💬' },
          { id: 'terminal', label: 'TERMINAL',  icon: '▶' },
          { id: 'code',     label: 'CODE',      icon: '⟨⟩' },
          { id: 'preview',  label: 'PREVIEW',   icon: '👁' },
        ]
      : [
          { id: 'chat',    label: 'CHAT',    icon: '💬' },
          { id: 'code',    label: 'CODE',    icon: '⟨⟩' },
          { id: 'preview', label: 'PREVIEW', icon: '👁' },
        ];

    return (
      <View style={s.contentTabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.contentTab, contentView === t.id && s.contentTabActive]}
            onPress={() => setContentView(t.id)}
          >
            <Text style={s.contentTabIcon}>{t.icon}</Text>
            <Text style={[s.contentTabLabel, contentView === t.id && s.contentTabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  /* ═══ RENDER: Chat Panel ═══════════════════════ */
  const renderChat = () => (
    <ScrollView
      ref={chatScrollRef}
      style={s.chatPanel}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome */}
      {pipe.conversation.length === 0 && (
        <View style={s.welcomeWrap}>
          <View style={s.welcomeIconWrap}>
            <Text style={{ fontSize: 28 }}>⚡</Text>
          </View>
          <Text style={s.welcomeTitle}>
            {buildMode === 'supergrok' ? 'SuperGrok Builder' : 'Quick Builder'}
          </Text>
          <Text style={s.welcomeSubtitle}>
            {buildMode === 'supergrok'
              ? 'Grok plans. Stitch designs. Claude codes.\nWatch the AI think before it builds.'
              : 'Describe what you want to build.\nSAL generates the complete project.'}
          </Text>
          <View style={s.starterGrid}>
            {STARTERS.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={s.starterCard}
                onPress={() => { setInput(prompt); }}
                activeOpacity={0.7}
              >
                <CornerBrackets color={KB.border} size={6} />
                <Text style={s.starterText}>{prompt}</Text>
                <Text style={s.starterArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      {pipe.conversation.map((msg, i) => (
        <View
          key={i}
          style={[s.msgBubble, msg.role === 'user' ? s.msgUser : s.msgAssistant, msg.isError && s.msgError]}
        >
          {msg.role === 'assistant' && (
            <View style={s.msgAvatarRow}>
              <SALMark size={16} />
              <Text style={s.msgRoleLabel}>SAL</Text>
              {msg.filesGenerated > 0 && (
                <View style={s.filesBadge}>
                  <Text style={s.filesBadgeText}>{msg.filesGenerated} file{msg.filesGenerated > 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
          )}
          <Text style={[s.msgText, msg.role === 'user' && s.msgTextUser]}>{msg.content}</Text>
        </View>
      ))}

      {/* Generating */}
      {pipe.generating && (
        <View style={[s.msgBubble, s.msgAssistant]}>
          <View style={s.msgAvatarRow}>
            <SALMark size={16} />
            <Text style={s.msgRoleLabel}>SAL</Text>
          </View>
          <View style={s.genIndicator}>
            <ActivityIndicator size="small" color={KB.neon} />
            <Text style={s.genText}>
              {buildMode === 'supergrok' ? 'Pipeline running...' : 'Generating...'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );


  /* ═══ RENDER: Terminal (SuperGrok) ═════════════ */
  const renderTerminal = () => (
    <View style={s.terminalWrap}>
      <View style={s.terminalHeader}>
        <View style={s.terminalDots}>
          <View style={[s.terminalDot, { backgroundColor: '#EF4444' }]} />
          <View style={[s.terminalDot, { backgroundColor: '#F59E0B' }]} />
          <View style={[s.terminalDot, { backgroundColor: '#22C55E' }]} />
        </View>
        <Text style={s.terminalTitle}>SAL PIPELINE</Text>
        <Text style={s.terminalMeta}>{pipe.terminalBuffer.length} events</Text>
      </View>
      <ScrollView
        ref={terminalScrollRef}
        style={s.terminal}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {pipe.terminalBuffer.map((line, i) => (
          <Text
            key={i}
            style={[s.terminalLine, { color: TERMINAL_COLORS[line.type] || KB.textTerminal }]}
          >
            {line.text}
          </Text>
        ))}
        {pipe.generating && (
          <View style={s.terminalCursor}>
            <Animated.Text style={[s.terminalCursorChar, { opacity: cursorBlink }]}>█</Animated.Text>
          </View>
        )}
      </ScrollView>
    </View>
  );


  /* ═══ RENDER: Code Editor ══════════════════════ */
  const renderCode = () => {
    const file = pipe.activeFile;
    if (!file) return <View style={s.emptyState}><Text style={s.emptyText}>No files yet</Text></View>;

    const lines = (file.content || '').split('\n');
    const lang = file.language || 'text';

    return (
      <View style={{ flex: 1 }}>
        {/* File tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fileTabBar}>
          {pipe.files.map(f => (
            <TouchableOpacity
              key={f.path}
              style={[s.fileTab, f.path === pipe.activeFilePath && s.fileTabActive]}
              onPress={() => pipe.setActiveFilePath(f.path)}
            >
              <View style={[s.fileDot, { backgroundColor: LANG_COLORS[f.language] || '#9CA3AF' }]} />
              <Text style={[s.fileTabText, f.path === pipe.activeFilePath && s.fileTabTextActive]}>{f.path}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Code */}
        <ScrollView style={s.codeScroll} showsVerticalScrollIndicator={false}>
          <View style={s.codeWrap}>
            <View style={s.lineNumbers}>
              {lines.map((_, i) => (
                <Text key={i} style={s.lineNum}>{i + 1}</Text>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={s.codeText} selectable>{file.content}</Text>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Info bar */}
        <View style={s.codeInfoBar}>
          <View style={[s.langTag, { borderColor: (LANG_COLORS[lang] || '#999') + '44' }]}>
            <Text style={[s.langTagText, { color: LANG_COLORS[lang] || '#999' }]}>{lang.toUpperCase()}</Text>
          </View>
          <Text style={s.codeInfoText}>{lines.length} lines</Text>
          {pipe.buildModel ? <Text style={s.codeInfoText}>{pipe.buildModel}</Text> : null}
        </View>
      </View>
    );
  };


  /* ═══ RENDER: Live Preview ═════════════════════ */
  const renderPreview = () => {
    const html = pipe.buildPreviewHtml();

    return (
      <View style={{ flex: 1 }}>
        {/* Preview chrome */}
        <View style={s.previewBar}>
          <View style={s.previewDots}>
            <View style={[s.previewDot, { backgroundColor: '#EF4444' }]} />
            <View style={[s.previewDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[s.previewDot, { backgroundColor: '#22C55E' }]} />
          </View>
          <View style={s.previewUrlBar}>
            <Text style={s.previewUrl}>{pipe.previewEntry || 'index.html'}</Text>
          </View>
          <TouchableOpacity onPress={() => webViewRef.current?.reload()} style={s.previewAction}>
            <Text style={s.previewActionText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          key={pipe.files.length + '-' + (pipe.files[0]?.content?.length || 0)}
          ref={webViewRef}
          source={{ html }}
          style={{ flex: 1, backgroundColor: '#000' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={s.previewLoading}>
              <ActivityIndicator color={KB.neon} />
              <Text style={s.previewLoadingText}>Rendering...</Text>
            </View>
          )}
        />

        {/* Pipeline building overlay */}
        {pipe.generating && buildMode === 'supergrok' && (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#050508F0',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <ActivityIndicator color={KB.neon} size="large" />
            <Text style={{
              color: KB.neon, fontSize: 11, fontFamily: MONO,
              fontWeight: '800', letterSpacing: 1, marginTop: 12,
            }}>
              BUILDING...
            </Text>
            <Text style={{
              color: KB.textDim, fontSize: 10, fontFamily: MONO, marginTop: 4,
            }}>
              {pipe.agentMessages.claude || 'Waiting for pipeline...'}
            </Text>
          </View>
        )}

        {/* Toolbar */}
        {pipe.phase === PHASE_COMPLETE && (
          <View style={s.toolbar}>
            <TouchableOpacity style={s.toolbarBtn} onPress={handleCopyCode}>
              <Text style={s.toolbarBtnIcon}>📋</Text>
              <Text style={s.toolbarBtnText}>COPY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={() => setContentView('code')}>
              <Text style={s.toolbarBtnIcon}>⟨⟩</Text>
              <Text style={s.toolbarBtnText}>CODE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.toolbarBtn, s.toolbarBtnPrimary]}>
              <Text style={s.toolbarBtnIcon}>🚀</Text>
              <Text style={[s.toolbarBtnText, { color: '#000' }]}>DEPLOY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={() => webViewRef.current?.reload()}>
              <Text style={s.toolbarBtnIcon}>↻</Text>
              <Text style={s.toolbarBtnText}>RELOAD</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };


  /* ═══ RENDER: File Tree ════════════════════════ */
  const renderFileTree = () => {
    if (!showFileTree) return null;
    return (
      <View style={s.fileTree}>
        <View style={s.fileTreeHeader}>
          <Text style={s.fileTreeTitle}>FILES</Text>
          <TouchableOpacity onPress={() => setShowFileTree(false)}>
            <Text style={{ color: KB.textDim, fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {pipe.files.map(file => {
            const isActive = file.path === pipe.activeFilePath;
            return (
              <TouchableOpacity
                key={file.path}
                style={[s.fileRow, isActive && s.fileRowActive]}
                onPress={() => { pipe.setActiveFilePath(file.path); setContentView('code'); }}
                onLongPress={() => {
                  Alert.alert(file.path, 'Delete this file?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => pipe.deleteFile(file.path) },
                  ]);
                }}
              >
                <View style={[s.fileDot, { backgroundColor: LANG_COLORS[file.language] || '#9CA3AF' }]} />
                <Text style={[s.fileName, isActive && { color: KB.neon }]}>{file.path}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };


  /* ═══ RENDER: Input Bar ════════════════════════ */
  const renderInputBar = () => (
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
            placeholder={buildMode === 'supergrok' ? 'What should we build?' : 'Describe what you want...'}
            placeholderTextColor={KB.textGhost}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!pipe.generating}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() && !pipe.generating) && s.sendBtnDisabled]}
            onPress={pipe.generating ? pipe.cancel : handleSend}
            disabled={!input.trim() && !pipe.generating}
          >
            {pipe.generating ? (
              <View style={s.stopSquare} />
            ) : (
              <Text style={s.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Next steps */}
        {pipe.nextSteps.length > 0 && !pipe.generating && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.nextStepsRow} contentContainerStyle={{ gap: 8 }}>
            {pipe.nextSteps.slice(0, 3).map((step, i) => (
              <TouchableOpacity key={i} style={s.nextStepChip} onPress={() => { setInput(step); }}>
                <Text style={s.nextStepText}>{step}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );


  /* ═══ MAIN RENDER ═══════════════════════════════ */
  return (
    <SafeAreaView style={s.safe}>
      {renderHeader()}
      {renderAgentCards()}
      <PlanPanel plan={pipe.plan} visible={!!pipe.plan && buildMode === 'supergrok'} />
      {renderContentTabs()}

      <View style={s.main}>
        {renderFileTree()}
        <View style={{ flex: 1 }}>
          {contentView === 'chat' && renderChat()}
          {contentView === 'terminal' && renderTerminal()}
          {contentView === 'code' && renderCode()}
          {contentView === 'preview' && renderPreview()}
        </View>
      </View>

      {renderInputBar()}
    </SafeAreaView>
  );
}


/* ═══════════════════════════════════════════════════
   STYLES — KINETIC BLUEPRINT DESIGN SYSTEM
   #00FF88 neon · 0px radius · Grid aesthetic
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KB.bg },

  /* ── Header ─────────────────────────────────────── */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerKicker: {
    fontSize: 8, fontWeight: '800', letterSpacing: 2,
    color: KB.neon, fontFamily: MONO,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: KB.text, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 32, height: 32, borderRadius: 0,
    backgroundColor: KB.bgCard, borderWidth: 1, borderColor: KB.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 12, color: KB.textSub },
  headerBtnBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 14, height: 14, borderRadius: 0,
    backgroundColor: KB.neon, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 2,
  },
  headerBtnBadgeText: { fontSize: 8, fontWeight: '800', color: '#000' },

  /* ── Mode Toggle ────────────────────────────────── */
  modeToggle: {
    flexDirection: 'row', backgroundColor: KB.bgCard,
    borderWidth: 1, borderColor: KB.border, borderRadius: 0,
  },
  modeToggleBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: KB.neonGlow, borderWidth: 1, borderColor: KB.neonDim,
  },
  modeToggleBtnActiveGrok: {
    backgroundColor: KB.agentGrok + '18', borderWidth: 1, borderColor: KB.agentGrok + '44',
  },
  modeToggleText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: KB.textDim, fontFamily: MONO },
  modeToggleTextActive: { color: KB.neon },
  modeToggleTextActiveGrok: { color: KB.agentGrok },

  /* ── Agent Cards Row ────────────────────────────── */
  agentCardsRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  agentCard: {
    flex: 1, padding: 10, borderWidth: 1, borderRadius: 0,
    position: 'relative', overflow: 'hidden',
  },
  agentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  agentStatusDot: { width: 6, height: 6, borderRadius: 3 },
  agentCardIcon: { fontSize: 16 },
  agentCardName: { fontSize: 11, fontWeight: '800', color: KB.text, letterSpacing: 0.5 },
  agentCardRole: { fontSize: 8, color: KB.textDim, fontFamily: MONO, letterSpacing: 0.3, marginBottom: 6 },
  agentStateTag: {
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: 0,
    paddingHorizontal: 6, paddingVertical: 2,
    flexDirection: 'row', alignItems: 'center',
  },
  agentStateText: { fontSize: 7, fontWeight: '800', letterSpacing: 1, fontFamily: MONO },
  agentCardMsg: { fontSize: 9, color: KB.textSub, marginTop: 4, lineHeight: 13 },
  agentCheckBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 14, height: 14, borderRadius: 0,
    backgroundColor: KB.complete, alignItems: 'center', justifyContent: 'center',
  },
  agentCheckMark: { fontSize: 9, color: '#000', fontWeight: '800' },

  /* ── Plan Panel ─────────────────────────────────── */
  planPanel: {
    overflow: 'hidden',
    borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  planInner: {
    padding: 12, backgroundColor: KB.bgCard,
    borderWidth: 1, borderColor: KB.neonDim,
    marginHorizontal: 10, marginVertical: 6, borderRadius: 0,
    position: 'relative',
  },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  planTitle: { fontSize: 13, fontWeight: '800', color: KB.text, flex: 1 },
  planComplexityBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0,
    borderWidth: 1, borderColor: KB.neonDim, backgroundColor: KB.neonGlow,
  },
  planComplexityText: { fontSize: 7, fontWeight: '800', color: KB.neon, letterSpacing: 1, fontFamily: MONO },
  planTime: { fontSize: 9, color: KB.textDim, fontFamily: MONO },
  planSection: { marginBottom: 6 },
  planSectionLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 1.5, color: KB.textDim, fontFamily: MONO, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  planChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 0,
    borderWidth: 1, borderColor: KB.neonDim, backgroundColor: KB.neonGlow,
  },
  planChipText: { fontSize: 9, fontWeight: '700', color: KB.neon, fontFamily: MONO },
  planStepText: { fontSize: 10, color: KB.textSub, lineHeight: 16, fontFamily: MONO },

  /* ── Content Tabs ───────────────────────────────── */
  contentTabs: {
    flexDirection: 'row', backgroundColor: KB.bgCard,
    borderBottomWidth: 1, borderBottomColor: KB.border,
    paddingHorizontal: 8, paddingVertical: 4, gap: 4,
  },
  contentTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 7, borderRadius: 0, borderWidth: 1, borderColor: 'transparent',
  },
  contentTabActive: {
    borderColor: KB.neonDim, backgroundColor: KB.neonGlow,
  },
  contentTabIcon: { fontSize: 10 },
  contentTabLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: KB.textGhost, fontFamily: MONO },
  contentTabLabelActive: { color: KB.neon },

  /* ── Main Content ───────────────────────────────── */
  main: { flex: 1, flexDirection: 'row' },

  /* ── Chat Panel ─────────────────────────────────── */
  chatPanel: { flex: 1 },
  welcomeWrap: { alignItems: 'center', paddingTop: 30 },
  welcomeIconWrap: {
    width: 56, height: 56, borderRadius: 0,
    backgroundColor: KB.neonGlow, borderWidth: 1, borderColor: KB.neonDim,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  welcomeTitle: { fontSize: 20, fontWeight: '800', color: KB.text, marginBottom: 6 },
  welcomeSubtitle: { fontSize: 12, color: KB.textSub, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  starterGrid: { marginTop: 20, width: '100%', gap: 6 },
  starterCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 0, position: 'relative',
    backgroundColor: KB.bgCard, borderWidth: 1, borderColor: KB.border,
  },
  starterText: { fontSize: 12, color: KB.textSub, flex: 1, marginRight: 10, fontFamily: MONO },
  starterArrow: { fontSize: 14, color: KB.neon },

  /* Messages */
  msgBubble: { marginBottom: 10, padding: 12, borderRadius: 0, maxWidth: '100%' },
  msgUser: { backgroundColor: KB.neonGlow, borderWidth: 1, borderColor: KB.neonDim, alignSelf: 'flex-end', maxWidth: '85%' },
  msgAssistant: { backgroundColor: KB.bgCard, borderWidth: 1, borderColor: KB.border, alignSelf: 'flex-start', maxWidth: '100%' },
  msgError: { borderColor: KB.error + '44' },
  msgAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  msgRoleLabel: { fontSize: 9, fontWeight: '800', color: KB.neon, letterSpacing: 1, fontFamily: MONO },
  filesBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 0,
    backgroundColor: KB.complete + '22', borderWidth: 1, borderColor: KB.complete + '44',
  },
  filesBadgeText: { fontSize: 8, fontWeight: '700', color: KB.complete, fontFamily: MONO },
  msgText: { fontSize: 13, lineHeight: 20, color: KB.textSub },
  msgTextUser: { color: KB.text },
  genIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  genText: { fontSize: 12, color: KB.textDim, fontFamily: MONO },

  /* ── Terminal ───────────────────────────────────── */
  terminalWrap: { flex: 1, backgroundColor: KB.bgTerminal },
  terminalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: KB.bgElevated, borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  terminalDots: { flexDirection: 'row', gap: 4 },
  terminalDot: { width: 6, height: 6, borderRadius: 3 },
  terminalTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: KB.textDim, fontFamily: MONO, flex: 1 },
  terminalMeta: { fontSize: 8, color: KB.textGhost, fontFamily: MONO },
  terminal: { flex: 1 },
  terminalLine: { fontSize: 11, lineHeight: 18, fontFamily: MONO },
  terminalCursor: { marginTop: 2 },
  terminalCursorChar: { fontSize: 11, color: KB.neon, fontFamily: MONO },

  /* ── Code Editor ────────────────────────────────── */
  fileTabBar: {
    maxHeight: 32, borderBottomWidth: 1, borderBottomColor: KB.border,
    backgroundColor: KB.bgCard, paddingHorizontal: 4,
  },
  fileTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  fileTabActive: { borderBottomColor: KB.neon },
  fileDot: { width: 5, height: 5, borderRadius: 0 },
  fileTabText: { fontSize: 9, fontWeight: '600', color: KB.textDim, fontFamily: MONO },
  fileTabTextActive: { color: KB.neon },

  codeScroll: { flex: 1, backgroundColor: KB.bgTerminal, padding: 10 },
  codeWrap: { flexDirection: 'row' },
  lineNumbers: { marginRight: 10, alignItems: 'flex-end' },
  lineNum: { fontSize: 10, lineHeight: 18, color: KB.textGhost, fontFamily: MONO },
  codeText: { fontSize: 10, lineHeight: 18, color: '#C8D3F5', fontFamily: MONO },

  codeInfoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: KB.bgCard, borderTopWidth: 1, borderTopColor: KB.border,
  },
  langTag: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 0, borderWidth: 1,
  },
  langTagText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5, fontFamily: MONO },
  codeInfoText: { fontSize: 8, color: KB.textDim, fontFamily: MONO },

  /* ── Preview ────────────────────────────────────── */
  previewBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: KB.bgElevated, borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  previewDots: { flexDirection: 'row', gap: 4 },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  previewUrlBar: {
    flex: 1, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 0, backgroundColor: KB.bgCard, borderWidth: 1, borderColor: KB.border,
  },
  previewUrl: { fontSize: 9, color: KB.textDim, fontFamily: MONO },
  previewAction: { padding: 4 },
  previewActionText: { color: KB.textDim, fontSize: 12 },
  previewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
  },
  previewLoadingText: { fontSize: 10, color: KB.textDim, marginTop: 6, fontFamily: MONO },

  /* ── Toolbar ────────────────────────────────────── */
  toolbar: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: KB.bgElevated, borderTopWidth: 1, borderTopColor: KB.border,
  },
  toolbarBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: 0,
    backgroundColor: KB.bgCard, borderWidth: 1, borderColor: KB.border,
  },
  toolbarBtnPrimary: {
    backgroundColor: KB.neon, borderColor: KB.neon,
  },
  toolbarBtnIcon: { fontSize: 10 },
  toolbarBtnText: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: KB.textSub, fontFamily: MONO },

  /* ── File Tree ──────────────────────────────────── */
  fileTree: {
    width: 180, backgroundColor: KB.bgCard,
    borderRightWidth: 1, borderRightColor: KB.border,
  },
  fileTreeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: KB.border,
  },
  fileTreeTitle: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5, color: KB.textDim, fontFamily: MONO },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  fileRowActive: { backgroundColor: KB.neonGlow },
  fileName: { fontSize: 10, color: KB.textSub, flex: 1, fontFamily: MONO },

  /* ── Input Bar ──────────────────────────────────── */
  inputBar: {
    paddingHorizontal: 10, paddingVertical: 6, paddingBottom: 2,
    borderTopWidth: 1, borderTopColor: KB.border, backgroundColor: KB.bg,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 6,
    backgroundColor: KB.bgCard, borderRadius: 0,
    borderWidth: 1, borderColor: KB.border,
    paddingLeft: 12, paddingRight: 4, paddingVertical: 4,
  },
  input: {
    flex: 1, fontSize: 13, color: KB.text, maxHeight: 90,
    paddingVertical: Platform.OS === 'ios' ? 5 : 3,
  },
  sendBtn: {
    width: 32, height: 32, borderRadius: 0,
    backgroundColor: KB.neon, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: KB.textGhost },
  stopSquare: { width: 10, height: 10, borderRadius: 0, backgroundColor: '#000' },
  sendIcon: { fontSize: 16, fontWeight: '800', color: '#000' },
  nextStepsRow: { marginTop: 6, maxHeight: 30 },
  nextStepChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 0,
    backgroundColor: KB.neonGlow, borderWidth: 1, borderColor: KB.neonDim,
  },
  nextStepText: { fontSize: 9, color: KB.neon, fontWeight: '700', fontFamily: MONO },

  /* ── Empty State ────────────────────────────────── */
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, color: KB.textDim, fontFamily: MONO },
});
