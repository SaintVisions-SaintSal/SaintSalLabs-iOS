/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER SCREEN
   14-State Mission Flow · Figma Design System
   SSE Pipeline: Grok → Stitch → Claude
   Build #92 · US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import useAgentPipeline, {
  AGENTS, AGENT_IDLE, AGENT_THINKING, AGENT_COMPLETE,
  PHASE_IDLE, PHASE_PLANNING, PHASE_BUILDING, PHASE_WIRING, PHASE_COMPLETE, PHASE_ERROR,
} from '../../hooks/useAgentPipeline';
import { MCP_BASE, MCP_KEY, mcpChat } from '../../lib/api';
import { supabase } from '../../lib/supabase';

/* ── Design Tokens (Figma) ───────────────────────── */
const C = {
  neon:       '#00FF88',
  neonSoft:   '#A4FFB9',
  neonGlow:   'rgba(0,255,136,0.3)',
  gold:       '#FFD709',
  goldDim:    'rgba(255,215,9,0.5)',
  goldGlow:   'rgba(255,215,0,0.2)',
  bg:         '#050505',
  bgCard:     '#0E0E0E',
  bgSurface:  '#131313',
  bgElev:     '#262626',
  gray:       '#777575',
  grayBorder: 'rgba(73,72,71,0.2)',
  white:      '#FFFFFF',
  white90:    'rgba(255,255,255,0.9)',
};

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const HEAD = Platform.OS === 'ios' ? 'System' : 'sans-serif';


/* ═══════════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════════ */

/* User chat bubble — right-aligned, #262626 bg, green right border */
function UserBubble({ text }) {
  return (
    <View style={hc.userBubbleWrap}>
      <View style={hc.userBubble}>
        <Text style={hc.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

/* SAL chat bubble — left-aligned, #000 bg, green left border, helmet avatar */
function SALBubble({ text, isError }) {
  return (
    <View style={hc.salBubbleWrap}>
      <Image
        source={require('../../../assets/logo-80.png')}
        style={hc.salAvatar}
        resizeMode="contain"
      />
      <View style={[hc.salBubble, isError && hc.salBubbleError]}>
        <Text style={[hc.salBubbleText, isError && hc.salBubbleTextError]}>{text}</Text>
      </View>
    </View>
  );
}

/* Corner bracket decoration for plan panel */
function CornerBrackets() {
  return (
    <>
      <View style={[hc.corner, hc.cornerTL]} />
      <View style={[hc.corner, hc.cornerTR]} />
      <View style={[hc.corner, hc.cornerBL]} />
      <View style={[hc.corner, hc.cornerBR]} />
    </>
  );
}

/* Stat block for Mission Complete */
function Stat({ label, value }) {
  return (
    <View style={hc.statBlock}>
      <Text style={hc.statValue} numberOfLines={1}>{String(value)}</Text>
      <Text style={hc.statLabel}>{label}</Text>
    </View>
  );
}

/* Checkbox row for manifest */
function CheckRow({ label, checked = false, onPress }) {
  return (
    <TouchableOpacity style={hc.checkRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[hc.checkbox, checked && hc.checkboxChecked]}>
        {checked && <Text style={hc.checkMark}>✓</Text>}
      </View>
      <Text style={hc.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* Action button for finalized grid */
function ActionBtn({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={hc.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={hc.actionBtnIcon}>{icon}</Text>
      <Text style={hc.actionBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* Connection row for deploy panel */
function ConnectionRow({ name, status }) {
  const isReady = status === 'Ready' || status === 'Connected';
  return (
    <View style={hc.connectionRow}>
      <View style={[hc.connDot, { backgroundColor: isReady ? C.neon : C.gray }]} />
      <Text style={hc.connName}>{name}</Text>
      <Text style={[hc.connStatus, { color: isReady ? C.neon : C.gray }]}>{status}</Text>
    </View>
  );
}

/* Setting row */
function SettingRow({ label, value }) {
  return (
    <View style={hc.settingRow}>
      <Text style={hc.settingLabel}>{label}</Text>
      <Text style={hc.settingValue}>{value}</Text>
    </View>
  );
}

/* Connector row */
function ConnectorRow({ name, connected }) {
  return (
    <View style={hc.settingRow}>
      <View style={hc.connectorLeft}>
        <View style={[hc.connDot, { backgroundColor: connected ? C.neon : C.gray }]} />
        <Text style={hc.settingLabel}>{name}</Text>
      </View>
      <View style={[hc.connectorBadge, { backgroundColor: connected ? 'rgba(0,255,136,0.15)' : C.bgElev }]}>
        <Text style={[hc.connectorBadgeText, { color: connected ? C.neon : C.gray }]}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </Text>
      </View>
    </View>
  );
}

/* API key row */
function APIRow({ provider, status }) {
  const isActive = status === 'Active';
  return (
    <View style={hc.settingRow}>
      <Text style={hc.settingLabel}>{provider}</Text>
      <View style={[hc.connectorBadge, { backgroundColor: isActive ? 'rgba(0,255,136,0.15)' : C.bgElev }]}>
        <Text style={[hc.connectorBadgeText, { color: isActive ? C.neon : C.gray }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/* Helper component styles */
const hc = StyleSheet.create({
  /* UserBubble */
  userBubbleWrap: {
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingLeft: 48,
  },
  userBubble: {
    backgroundColor: C.bgElev,
    borderRightWidth: 2,
    borderRightColor: C.neon,
    borderRadius: 8,
    borderTopRightRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '90%',
  },
  userBubbleText: {
    color: C.white90,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: HEAD,
  },

  /* SALBubble */
  salBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 48,
  },
  salAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginTop: 2,
    backgroundColor: C.bgCard,
  },
  salBubble: {
    backgroundColor: '#000000',
    borderLeftWidth: 2,
    borderLeftColor: C.neon,
    borderRadius: 8,
    borderTopLeftRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  salBubbleError: {
    borderLeftColor: '#FF4444',
  },
  salBubbleText: {
    color: C.white90,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: HEAD,
  },
  salBubbleTextError: {
    color: '#FF6666',
  },

  /* CornerBrackets */
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: C.gold,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: C.gold,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: C.gold,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: C.gold,
  },

  /* Stat */
  statBlock: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  statValue: {
    color: C.neon,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: MONO,
    letterSpacing: 1,
  },
  statLabel: {
    color: C.gray,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 2,
    marginTop: 2,
  },

  /* CheckRow */
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: C.gray,
    borderRadius: 3,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.neon,
    borderColor: C.neon,
  },
  checkMark: {
    color: C.bg,
    fontSize: 11,
    fontWeight: '700',
  },
  checkLabel: {
    color: C.white90,
    fontSize: 13,
    fontFamily: MONO,
    letterSpacing: 1,
  },

  /* ActionBtn */
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.grayBorder,
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  actionBtnIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionBtnLabel: {
    color: C.white90,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 1,
    textAlign: 'center',
  },

  /* ConnectionRow */
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  connName: {
    color: C.white90,
    fontSize: 13,
    fontFamily: HEAD,
    flex: 1,
  },
  connStatus: {
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 1,
  },

  /* SettingRow */
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
  },
  settingLabel: {
    color: C.white90,
    fontSize: 13,
    fontFamily: HEAD,
    flex: 1,
  },
  settingValue: {
    color: C.gray,
    fontSize: 12,
    fontFamily: MONO,
    maxWidth: '55%',
    textAlign: 'right',
  },

  /* ConnectorRow */
  connectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connectorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  connectorBadgeText: {
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 1,
    fontWeight: '700',
  },
});


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function BuilderScreen() {
  const pipe = useAgentPipeline();

  /* ── Local State ──────────────────────────────── */
  const [builderView, setBuilderView] = useState('briefing');
  const [input, setInput] = useState('');
  const [buildTab, setBuildTab] = useState('terminal');
  const [previewMode, setPreviewMode] = useState('mobile');
  const [codeFile, setCodeFile] = useState(null);
  const [manifestChecks, setManifestChecks] = useState({
    PUSH_GITHUB: false,
    COMMIT_DOMAIN: false,
    GET_ADDITIONAL_DOMAIN: false,
  });

  /* ── Refs ─────────────────────────────────────── */
  const scrollRef = useRef(null);
  const terminalScrollRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Auto-transitions from SSE phase ─────────── */
  useEffect(() => {
    switch (pipe.phase) {
      case PHASE_PLANNING:
        setBuilderView('agents');
        break;
      case PHASE_BUILDING:
      case PHASE_WIRING:
        setBuilderView('building');
        break;
      case PHASE_COMPLETE:
        setBuilderView('complete');
        break;
      case PHASE_ERROR:
        // Stay on current view — error shown inline
        break;
      default:
        break;
    }
  }, [pipe.phase]);

  /* ── When plan arrives, flash to plan view ───── */
  useEffect(() => {
    if (pipe.plan) setBuilderView('plan');
  }, [pipe.plan]);

  /* ── When files arrive + complete, show preview ─ */
  useEffect(() => {
    if (pipe.files.length > 0 && pipe.phase === PHASE_COMPLETE) {
      setBuilderView('preview');
    }
  }, [pipe.files, pipe.phase]);

  /* ── Auto-scroll terminal ─────────────────────── */
  useEffect(() => {
    if (terminalScrollRef.current && pipe.terminalBuffer.length > 0) {
      terminalScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [pipe.terminalBuffer]);

  /* ── Auto-scroll chat ────────────────────────── */
  useEffect(() => {
    if (scrollRef.current && pipe.conversation.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [pipe.conversation]);


  /* ═══════════════════════════════════════════════
     SUPABASE SAVE
  ═══════════════════════════════════════════════ */
  const saveToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to archive your project.');
        return;
      }

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`${MCP_BASE}/api/builder/v2/save-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sal-key': MCP_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pipe.plan?.title || pipe.projectName,
          files: pipe.files,
          user_id: user.id,
        }),
      });

      if (res.ok) {
        Alert.alert('Archived!', 'Project saved to your vault.');
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Save Failed', err.error || 'Could not save project.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save project.');
    }
  };


  /* ═══════════════════════════════════════════════
     SHARED RENDER: CHAT
  ═══════════════════════════════════════════════ */
  const renderChat = () => (
    <ScrollView
      ref={scrollRef}
      style={s.chatScroll}
      contentContainerStyle={s.chatContent}
      keyboardShouldPersistTaps="handled"
    >
      {pipe.conversation.length === 0 && (
        <View style={s.chatEmpty}>
          <Text style={s.chatEmptyText}>SAL is ready. Describe your mission.</Text>
        </View>
      )}
      {pipe.conversation.map((msg, i) => (
        msg.role === 'user'
          ? <UserBubble key={i} text={msg.content} />
          : <SALBubble key={i} text={msg.content} isError={msg.isError} />
      ))}
      {pipe.generating && pipe.phase === PHASE_WIRING && (
        <View style={s.thinkingRow}>
          <ActivityIndicator size="small" color={C.neon} />
          <Text style={s.thinkingText}>SAL is wiring your app...</Text>
        </View>
      )}
    </ScrollView>
  );


  /* ═══════════════════════════════════════════════
     SHARED RENDER: TERMINAL
  ═══════════════════════════════════════════════ */
  const renderTerminal = () => (
    <ScrollView
      ref={terminalScrollRef}
      style={s.terminal}
      contentContainerStyle={s.terminalContent}
    >
      <Text style={s.termPrompt}>{'> SAL MISSION TERMINAL'}</Text>
      <Text style={s.termDivider}>{'─'.repeat(40)}</Text>
      {pipe.terminalBuffer.length === 0 && (
        <Text style={[s.termLine, { color: C.gray }]}>{'> Waiting for pipeline...'}</Text>
      )}
      {pipe.terminalBuffer.map((line, i) => {
        const totalLines = pipe.terminalBuffer.length;
        const age = totalLines - i;
        const opacity = Math.max(0.3, 1 - (age / totalLines) * 0.6);
        const color =
          line.type === 'error'    ? '#FF4444' :
          line.type === 'success'  ? C.neon :
          line.type === 'complete' ? C.neon :
          line.type === 'agent'    ? C.gold :
          line.type === 'file'     ? C.neonSoft :
          C.gray;
        return (
          <Text key={i} style={[s.termLine, { color, opacity }]}>
            {line.text}
          </Text>
        );
      })}
      {pipe.generating && (
        <View style={s.termCursor}>
          <ActivityIndicator size="small" color={C.neon} style={{ marginRight: 8 }} />
          <Text style={s.termCursorText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );


  /* ═══════════════════════════════════════════════
     SHARED RENDER: LIVE PREVIEW
  ═══════════════════════════════════════════════ */
  const renderLivePreview = () => {
    const html = pipe.buildPreviewHtml();
    return (
      <View style={s.livePreviewContainer}>
        {pipe.files.length === 0 ? (
          <View style={s.previewEmpty}>
            <Text style={s.previewEmptyText}>Preview will appear here as files are generated</Text>
          </View>
        ) : (
          <WebView
            key={`live-${pipe.files.length}-${(pipe.files[0]?.content?.length || 0)}`}
            source={{ html }}
            style={s.webView}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
    );
  };


  /* ═══════════════════════════════════════════════
     SHARED RENDER: INPUT BAR
  ═══════════════════════════════════════════════ */
  const renderInputBar = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inputBar}>
        <TextInput
          ref={inputRef}
          style={s.input}
          placeholder="COMMAND INPUT..."
          placeholderTextColor="rgba(119,117,117,0.5)"
          value={input}
          onChangeText={setInput}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (input.trim() && !pipe.generating) {
              pipe.startPipeline(input.trim());
              setInput('');
            }
          }}
        />
        {pipe.generating ? (
          <TouchableOpacity style={s.cancelBtn} onPress={pipe.cancel}>
            <Text style={s.cancelBtnText}>■</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={() => {
              if (input.trim()) {
                pipe.startPipeline(input.trim());
                setInput('');
              }
            }}
            disabled={!input.trim()}
          >
            <Text style={s.sendBtnText}>▶</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );


  /* ═══════════════════════════════════════════════
     VIEW: briefing (Figma Screens 1-2)
  ═══════════════════════════════════════════════ */
  const renderBriefing = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerDot} />
          <Text style={s.headerTitle}>MISSION BRIDGE v4.20</Text>
        </View>
        <TouchableOpacity
          style={s.headerReset}
          onPress={pipe.resetProject}
        >
          <Text style={s.headerResetText}>NEW</Text>
        </TouchableOpacity>
      </View>

      {/* Error banner */}
      {pipe.error && (
        <View style={s.errorBanner}>
          <Text style={s.errorBannerText}>✗ {pipe.error}</Text>
        </View>
      )}

      {/* Chat messages */}
      {renderChat()}

      {/* INITIALIZE MISSION button */}
      {!pipe.generating && input.trim().length > 0 && (
        <TouchableOpacity
          style={s.missionBtn}
          onPress={() => {
            pipe.startPipeline(input.trim());
            setInput('');
          }}
          activeOpacity={0.85}
        >
          <Text style={s.missionBtnText}>⚡ INITIALIZE MISSION</Text>
        </TouchableOpacity>
      )}

      {/* Input bar */}
      {renderInputBar()}
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: agents (Figma Screens 3-4)
  ═══════════════════════════════════════════════ */
  const renderAgents = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerDot} />
          <Text style={s.headerTitle}>AGENTIC PLANNING PHASE</Text>
        </View>
        {pipe.generating && <ActivityIndicator size="small" color={C.gold} />}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={s.phaseSubtitle}>Initializing multi-agent orchestration...</Text>

        {/* 3 Agent Cards */}
        {Object.entries(AGENTS).map(([key, agent]) => {
          const state = pipe.agentStates[key];
          const msg = pipe.agentMessages[key];
          const isActive = state === AGENT_THINKING;
          const isDone = state === AGENT_COMPLETE;
          const borderColor = isActive ? C.gold : isDone ? C.neon : C.grayBorder;
          const glowColor = isActive ? C.goldGlow : isDone ? C.neonGlow : 'transparent';

          return (
            <View key={key} style={[
              s.agentCard,
              { borderColor },
              isActive && s.agentCardActive,
            ]}>
              <View style={s.agentCardHeader}>
                <Text style={s.agentIcon}>{agent.icon}</Text>
                <View style={s.agentNameBlock}>
                  <Text style={s.agentName}>{agent.name.toUpperCase()}</Text>
                  <Text style={s.agentRole}>{agent.role}</Text>
                </View>
                <View style={[
                  s.agentBadge,
                  {
                    backgroundColor:
                      isActive ? C.gold :
                      isDone ? C.neon :
                      C.bgElev,
                  }
                ]}>
                  <Text style={[
                    s.agentBadgeText,
                    { color: isActive || isDone ? C.bg : C.gray }
                  ]}>
                    {isActive ? 'ACTIVE' : isDone ? 'DONE' : 'STANDBY'}
                  </Text>
                </View>
              </View>
              {msg ? (
                <Text style={[s.agentMsg, { color: isActive ? C.gold : isDone ? C.neon : C.gray }]}>
                  {msg}
                </Text>
              ) : null}
              {isActive && (
                <View style={s.agentProgress}>
                  <ActivityIndicator size="small" color={C.gold} />
                  <Text style={s.agentProgressText}>Processing...</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Terminal output during agents phase */}
        <Text style={s.sectionTitle}>PIPELINE LOG</Text>
        <View style={[s.terminal, { maxHeight: 200 }]}>
          <ScrollView ref={terminalScrollRef}>
            {pipe.terminalBuffer.slice(-20).map((line, i) => {
              const color =
                line.type === 'error'   ? '#FF4444' :
                line.type === 'success' ? C.neon :
                line.type === 'agent'   ? C.gold :
                C.gray;
              return (
                <Text key={i} style={[s.termLine, { color }]}>
                  {line.text}
                </Text>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: plan (Figma Screen 5)
  ═══════════════════════════════════════════════ */
  const renderPlan = () => {
    if (!pipe.plan) return null;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={[s.headerDot, { backgroundColor: C.gold }]} />
            <Text style={[s.headerTitle, { color: C.gold }]}>ARCHITECT PLAN</Text>
          </View>
        </View>

        {/* Gold bordered plan panel */}
        <View style={s.planPanel}>
          <CornerBrackets />

          {/* Plan title + meta */}
          <Text style={s.planTitle}>{pipe.plan.title || 'MISSION BLUEPRINT'}</Text>
          <View style={s.planMeta}>
            {pipe.plan.complexity && (
              <View style={[s.complexBadge, { backgroundColor: C.gold }]}>
                <Text style={s.complexText}>{pipe.plan.complexity.toUpperCase()}</Text>
              </View>
            )}
            {pipe.plan.estimated_time && (
              <Text style={s.planTime}>EST: {pipe.plan.estimated_time}</Text>
            )}
          </View>

          {/* Components */}
          {pipe.plan.components?.length > 0 && (
            <>
              <Text style={s.planLabel}>COMPONENTS</Text>
              <View style={s.pillRow}>
                {pipe.plan.components.map((comp, i) => (
                  <View key={i} style={s.pill}>
                    <Text style={s.pillText}>{comp}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* APIs */}
          {pipe.plan.apis?.length > 0 && (
            <>
              <Text style={s.planLabel}>APIS</Text>
              <View style={s.pillRow}>
                {pipe.plan.apis.map((api, i) => (
                  <View key={i} style={[s.pill, s.pillGold]}>
                    <Text style={[s.pillText, { color: C.gold }]}>{api}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Steps */}
          {pipe.plan.steps?.length > 0 && (
            <>
              <Text style={s.planLabel}>STEPS</Text>
              {pipe.plan.steps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <Text style={s.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={s.goldBtn}
          onPress={() => setBuilderView('building')}
          activeOpacity={0.85}
        >
          <Text style={s.goldBtnText}>CONFIRM BLUEPRINT</Text>
        </TouchableOpacity>

        {/* Back to agents */}
        <TouchableOpacity
          style={[s.outlineBtn, { marginTop: 10 }]}
          onPress={() => setBuilderView('agents')}
        >
          <Text style={s.outlineBtnText}>VIEW AGENTS</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };


  /* ═══════════════════════════════════════════════
     VIEW: building (Figma Screens 6-7)
  ═══════════════════════════════════════════════ */
  const renderBuilding = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tab bar */}
      <View style={s.tabBar}>
        <View style={s.tabBarLeft}>
          <View style={[s.headerDot, { marginLeft: 12 }]} />
          <Text style={[s.headerTitle, { marginLeft: 8, fontSize: 11 }]}>BUILDING</Text>
          {pipe.generating && <ActivityIndicator size="small" color={C.neon} style={{ marginLeft: 8 }} />}
        </View>
        <View style={s.tabBtns}>
          {['terminal', 'chat', 'preview'].map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tab, buildTab === t && s.tabActive]}
              onPress={() => setBuildTab(t)}
            >
              <Text style={[s.tabText, buildTab === t && s.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Error banner */}
      {pipe.error && (
        <View style={s.errorBanner}>
          <Text style={s.errorBannerText}>✗ {pipe.error}</Text>
        </View>
      )}

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {buildTab === 'terminal' && renderTerminal()}
        {buildTab === 'chat' && renderChat()}
        {buildTab === 'preview' && renderLivePreview()}
      </View>

      {/* Input bar always visible */}
      {renderInputBar()}
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: preview (Figma Screen 8)
  ═══════════════════════════════════════════════ */
  const renderPreview = () => {
    const html = pipe.buildPreviewHtml();
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.headerDot} />
            <Text style={s.headerTitle}>LIVE PREVIEW</Text>
          </View>
          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => setBuilderView('complete')}
          >
            <Text style={s.headerBtnText}>MISSION →</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile / Desktop toggle */}
        <View style={s.previewToggle}>
          <TouchableOpacity
            onPress={() => setPreviewMode('mobile')}
            style={[s.toggleBtn, previewMode === 'mobile' && s.toggleActive]}
          >
            <Text style={[s.toggleText, previewMode === 'mobile' && s.toggleTextActive]}>
              📱 MOBILE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPreviewMode('desktop')}
            style={[s.toggleBtn, previewMode === 'desktop' && s.toggleActive]}
          >
            <Text style={[s.toggleText, previewMode === 'desktop' && s.toggleTextActive]}>
              🖥 DESKTOP
            </Text>
          </TouchableOpacity>
        </View>

        {/* WebView with key prop for refresh */}
        <View style={[
          s.previewWrapper,
          previewMode === 'mobile' && s.mobileFrame,
        ]}>
          <WebView
            key={`preview-${pipe.files.length}-${pipe.files[0]?.content?.length || 0}`}
            source={{ html }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>

        {/* Bottom nav */}
        <View style={s.previewFooter}>
          <TouchableOpacity
            style={[s.outlineBtn, { flex: 1, marginRight: 6 }]}
            onPress={() => setBuilderView('building')}
          >
            <Text style={s.outlineBtnText}>← BUILD LOG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.neonBtn, { flex: 1, marginLeft: 6 }]}
            onPress={() => setBuilderView('complete')}
          >
            <Text style={s.neonBtnText}>COMPLETE →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  /* ═══════════════════════════════════════════════
     VIEW: complete (Figma Screen 9)
  ═══════════════════════════════════════════════ */
  const renderComplete = () => (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={s.completeContent}>
      {/* Mission Complete header */}
      <View style={s.missionCompleteHeader}>
        <Text style={s.missionCompleteLabel}>// MISSION COMPLETE</Text>
        <Text style={s.missionCompleteTitle}>
          {pipe.plan?.title || 'PROJECT BUILT'}
        </Text>
        <View style={s.missionCompleteLine} />
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <Stat label="FILES" value={pipe.files.length} />
        <View style={s.statDivider} />
        <Stat label="AGENTS" value="3" />
        <View style={s.statDivider} />
        <Stat label="MODEL" value={pipe.buildModel ? pipe.buildModel.split('-').slice(0, 2).join('-') : 'claude'} />
      </View>

      {/* Preview thumbnail */}
      <View style={s.previewThumb}>
        <WebView
          source={{ html: pipe.buildPreviewHtml() }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled
          scrollEnabled={false}
          pointerEvents="none"
        />
        <View style={s.previewThumbOverlay}>
          <Text style={s.previewThumbLabel}>PREVIEW</Text>
        </View>
      </View>

      {/* Action buttons */}
      <TouchableOpacity
        style={s.neonBtn}
        onPress={() => setBuilderView('preview')}
        activeOpacity={0.85}
      >
        <Text style={s.neonBtnText}>VIEW FULL PREVIEW</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.goldBtn, { marginTop: 10 }]}
        onPress={() => setBuilderView('manifest')}
        activeOpacity={0.85}
      >
        <Text style={s.goldBtnText}>VIEW PROJECT FILES</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.outlineBtn, { marginTop: 10 }]}
        onPress={() => setBuilderView('finalized')}
        activeOpacity={0.85}
      >
        <Text style={s.outlineBtnText}>DEPLOY &amp; FINALIZE</Text>
      </TouchableOpacity>

      {/* New mission */}
      <TouchableOpacity
        style={[s.ghostBtn, { marginTop: 16 }]}
        onPress={() => {
          pipe.resetProject();
          setBuilderView('briefing');
        }}
      >
        <Text style={s.ghostBtnText}>+ NEW MISSION</Text>
      </TouchableOpacity>
    </ScrollView>
  );


  /* ═══════════════════════════════════════════════
     VIEW: manifest (Figma Screen 10)
  ═══════════════════════════════════════════════ */
  const renderManifest = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setBuilderView('complete')} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>FILE_MANIFEST</Text>
        <Text style={s.headerMeta}>{pipe.files.length} FILES</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* File list */}
        <Text style={[s.sectionTitle, { marginTop: 16, marginHorizontal: 16 }]}>FILE_SUMMARY</Text>
        {pipe.files.map((f, i) => {
          const icon =
            f.language === 'html'       ? '🌐' :
            f.language === 'css'        ? '🎨' :
            f.language === 'javascript' ? '⚡' :
            f.language === 'typescript' ? '🔷' :
            f.language === 'json'       ? '📋' :
            f.language === 'python'     ? '🐍' :
            '📄';
          return (
            <TouchableOpacity
              key={i}
              style={s.fileRow}
              onPress={() => {
                pipe.setActiveFilePath(f.path);
                setCodeFile(f);
                setBuilderView('code');
              }}
              activeOpacity={0.7}
            >
              <Text style={s.fileIcon}>{icon}</Text>
              <View style={s.fileInfo}>
                <Text style={s.fileName}>{f.path}</Text>
                <Text style={s.fileSize}>{f.content.length.toLocaleString()} chars</Text>
              </View>
              <Text style={s.fileArrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Deployment options */}
        <Text style={[s.sectionTitle, { marginTop: 20, marginHorizontal: 16 }]}>DEPLOYMENT OPTIONS</Text>
        {Object.entries(manifestChecks).map(([key, checked]) => (
          <CheckRow
            key={key}
            label={key}
            checked={checked}
            onPress={() => setManifestChecks(prev => ({ ...prev, [key]: !prev[key] }))}
          />
        ))}

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <TouchableOpacity
            style={s.neonBtn}
            onPress={() => setBuilderView('finalized')}
            activeOpacity={0.85}
          >
            <Text style={s.neonBtnText}>FINALIZE PROJECT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: finalized (Figma Screen 11)
  ═══════════════════════════════════════════════ */
  const renderFinalized = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setBuilderView('complete')} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>PROJECT_FINAL</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title block */}
        <View style={s.finalizedHero}>
          <Text style={s.finalTitle}>
            {pipe.plan?.title?.toUpperCase() || 'PROJECT_FINAL'}
          </Text>
          <View style={[s.badge, { marginTop: 8 }]}>
            <Text style={s.badgeText}>HYPER-AGENTIC FRAMEWORK</Text>
          </View>
        </View>

        {/* File list */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginBottom: 4 }]}>FILES</Text>
        {pipe.files.map((f, i) => (
          <View key={i} style={[s.fileRow, { paddingVertical: 8 }]}>
            <Text style={s.fileIcon}>
              {f.language === 'html' ? '🌐' : f.language === 'css' ? '🎨' : f.language === 'javascript' ? '⚡' : '📄'}
            </Text>
            <View style={s.fileInfo}>
              <Text style={s.fileName}>{f.path}</Text>
            </View>
            <Text style={[s.fileSize, { textAlign: 'right' }]}>{f.language?.toUpperCase()}</Text>
          </View>
        ))}

        {/* Action grid */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 20, marginBottom: 8 }]}>ACTIONS</Text>
        <View style={s.actionGrid}>
          <ActionBtn label="VIEW_CODE" icon="📄" onPress={() => {
            if (pipe.files.length > 0) {
              setCodeFile(pipe.files[0]);
              pipe.setActiveFilePath(pipe.files[0].path);
            }
            setBuilderView('code');
          }} />
          <ActionBtn label="SETTINGS" icon="⚙️" onPress={() => setBuilderView('settings')} />
          <ActionBtn label="ARCHIVE" icon="📦" onPress={saveToSupabase} />
        </View>

        {/* Deploy connections */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 24 }]}>CONNECTIONS</Text>
        <View style={s.connectionsCard}>
          <ConnectionRow name="Vercel" status="Ready" />
          <ConnectionRow name="GitHub" status="Connected" />
          <ConnectionRow name="Render" status="Ready" />
        </View>
      </ScrollView>
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: settings (Figma Screen 12)
  ═══════════════════════════════════════════════ */
  const renderSettings = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setBuilderView('finalized')} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>SYSTEM CONFIG</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* System section */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 16 }]}>SYSTEM</Text>
        <View style={s.settingsCard}>
          <SettingRow label="AI Provider" value="Claude + Grok + Stitch" />
          <SettingRow label="Deploy Target" value="Vercel" />
          <SettingRow label="Domain" value="saintsallabs.com" />
          <SettingRow label="Build Mode" value="SuperGrok SSE" />
          <SettingRow label="Protocol" value="HACP v4.20" />
        </View>

        {/* Connectors */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 20 }]}>CONNECTORS</Text>
        <View style={s.settingsCard}>
          <ConnectorRow name="GitHub" connected />
          <ConnectorRow name="Vercel" connected />
          <ConnectorRow name="Render" connected />
          <ConnectorRow name="Cloudflare" connected />
        </View>

        {/* API Keys */}
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 20 }]}>API KEYS</Text>
        <View style={s.settingsCard}>
          <APIRow provider="Anthropic (Claude)" status="Active" />
          <APIRow provider="xAI (Grok)" status="Active" />
          <APIRow provider="Google (Stitch)" status="Active" />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableOpacity
            style={s.outlineBtn}
            onPress={() => setBuilderView('finalized')}
            activeOpacity={0.85}
          >
            <Text style={s.outlineBtnText}>BACK TO PROJECT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );


  /* ═══════════════════════════════════════════════
     VIEW: code (File Viewer)
  ═══════════════════════════════════════════════ */
  const renderCode = () => {
    const activeFile = codeFile || pipe.activeFile;
    const lines = activeFile?.content?.split('\n') || [];

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => setBuilderView('manifest')}
            style={s.backBtn}
          >
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.codeHeaderTitle} numberOfLines={1}>
            {activeFile?.path || 'CODE VIEWER'}
          </Text>
        </View>

        {/* File tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fileTabBar}>
          {pipe.files.map((f, i) => {
            const isActive = f.path === activeFile?.path;
            return (
              <TouchableOpacity
                key={i}
                style={[s.fileTab, isActive && s.fileTabActive]}
                onPress={() => {
                  pipe.setActiveFilePath(f.path);
                  setCodeFile(f);
                }}
              >
                <Text style={[s.fileTabText, isActive && s.fileTabTextActive]}>
                  {f.path}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Code content */}
        <ScrollView
          style={s.codeScroll}
          horizontal={false}
          contentContainerStyle={s.codeContent}
        >
          {lines.map((line, i) => (
            <View key={i} style={s.codeLine}>
              <Text style={s.codeLineNum}>{String(i + 1).padStart(4, ' ')}</Text>
              <Text style={s.codeLineText}>{line || ' '}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };


  /* ═══════════════════════════════════════════════
     MAIN RETURN
  ═══════════════════════════════════════════════ */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {builderView === 'briefing'  && renderBriefing()}
      {builderView === 'agents'    && renderAgents()}
      {builderView === 'plan'      && renderPlan()}
      {builderView === 'building'  && renderBuilding()}
      {builderView === 'preview'   && renderPreview()}
      {builderView === 'complete'  && renderComplete()}
      {builderView === 'manifest'  && renderManifest()}
      {builderView === 'finalized' && renderFinalized()}
      {builderView === 'settings'  && renderSettings()}
      {builderView === 'code'      && renderCode()}
    </SafeAreaView>
  );
}


/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({

  /* ── Header ──────────────────────────────────── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
    backgroundColor: C.bg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.neon,
    marginRight: 8,
  },
  headerTitle: {
    color: C.neon,
    fontSize: 12,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerMeta: {
    color: C.gray,
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  headerReset: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.grayBorder,
    borderRadius: 4,
  },
  headerResetText: {
    color: C.gray,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.neon,
    borderRadius: 4,
  },
  headerBtnText: {
    color: C.neon,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 1,
    fontWeight: '700',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backBtnText: {
    color: C.neon,
    fontSize: 20,
    fontFamily: HEAD,
    fontWeight: '300',
  },

  /* ── Error Banner ────────────────────────────── */
  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorBannerText: {
    color: '#FF6666',
    fontSize: 12,
    fontFamily: MONO,
  },

  /* ── Chat ────────────────────────────────────── */
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  chatEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chatEmptyText: {
    color: C.gray,
    fontSize: 13,
    fontFamily: HEAD,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 4,
  },
  thinkingText: {
    color: C.neonSoft,
    fontSize: 12,
    fontFamily: MONO,
    marginLeft: 8,
  },

  /* ── Input Bar ───────────────────────────────── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.grayBorder,
    backgroundColor: C.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: C.white,
    fontSize: 13,
    fontFamily: MONO,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.bgSurface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.grayBorder,
    marginRight: 8,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: C.neon,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: C.bgElev,
  },
  sendBtnText: {
    color: C.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#FF4444',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── Mission Button ──────────────────────────── */
  missionBtn: {
    backgroundColor: '#00FD87',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: C.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  missionBtnText: {
    color: C.bg,
    fontSize: 14,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 3,
  },

  /* ── Phase / Agents ──────────────────────────── */
  phaseSubtitle: {
    color: C.gray,
    fontSize: 12,
    fontFamily: MONO,
    letterSpacing: 1,
    marginBottom: 20,
  },
  agentCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  agentCardActive: {
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  agentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  agentIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  agentNameBlock: {
    flex: 1,
  },
  agentName: {
    color: C.white,
    fontSize: 13,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 2,
  },
  agentRole: {
    color: C.gray,
    fontSize: 11,
    fontFamily: HEAD,
    marginTop: 1,
  },
  agentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  agentBadgeText: {
    fontSize: 9,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 1,
  },
  agentMsg: {
    fontSize: 11,
    fontFamily: MONO,
    lineHeight: 16,
    marginTop: 4,
  },
  agentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  agentProgressText: {
    color: C.gold,
    fontSize: 11,
    fontFamily: MONO,
    marginLeft: 6,
  },

  /* ── Terminal ────────────────────────────────── */
  terminal: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.15)',
    borderRadius: 4,
    margin: 0,
  },
  terminalContent: {
    padding: 12,
    paddingBottom: 20,
  },
  termPrompt: {
    color: C.neon,
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 2,
    marginBottom: 4,
  },
  termDivider: {
    color: 'rgba(0,255,136,0.2)',
    fontSize: 11,
    fontFamily: MONO,
    marginBottom: 8,
  },
  termLine: {
    fontSize: 11,
    fontFamily: MONO,
    lineHeight: 17,
    marginBottom: 1,
  },
  termCursor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  termCursorText: {
    color: C.neon,
    fontSize: 11,
    fontFamily: MONO,
    opacity: 0.7,
  },

  /* ── Tab Bar ─────────────────────────────────── */
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
    backgroundColor: C.bg,
    paddingRight: 8,
    minHeight: 44,
  },
  tabBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabBtns: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.neon,
  },
  tabText: {
    color: C.gray,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 1,
    fontWeight: '700',
  },
  tabTextActive: {
    color: C.neon,
  },

  /* ── Live Preview ────────────────────────────── */
  livePreviewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  previewEmptyText: {
    color: C.gray,
    fontSize: 13,
    fontFamily: MONO,
    textAlign: 'center',
    lineHeight: 20,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },

  /* ── Preview View ────────────────────────────── */
  previewWrapper: {
    flex: 1,
    backgroundColor: '#111',
  },
  mobileFrame: {
    marginHorizontal: 40,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.grayBorder,
  },
  previewToggle: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.grayBorder,
  },
  toggleActive: {
    borderColor: C.neon,
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  toggleText: {
    color: C.gray,
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: C.neon,
  },
  previewFooter: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.grayBorder,
  },

  /* ── Plan Panel ──────────────────────────────── */
  planPanel: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold,
    borderRadius: 8,
    padding: 20,
    paddingTop: 24,
    marginBottom: 16,
    position: 'relative',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  planTitle: {
    color: C.gold,
    fontSize: 16,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  complexBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  complexText: {
    color: C.bg,
    fontSize: 10,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planTime: {
    color: C.gray,
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  planLabel: {
    color: C.goldDim,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 12,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  pill: {
    backgroundColor: C.bgElev,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.grayBorder,
  },
  pillGold: {
    borderColor: C.goldDim,
    backgroundColor: 'rgba(255,215,9,0.08)',
  },
  pillText: {
    color: C.neonSoft,
    fontSize: 11,
    fontFamily: MONO,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNum: {
    color: C.gold,
    fontSize: 11,
    fontFamily: MONO,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 24,
    opacity: 0.7,
  },
  stepText: {
    color: C.white90,
    fontSize: 12,
    fontFamily: HEAD,
    lineHeight: 18,
    flex: 1,
  },

  /* ── Mission Complete ────────────────────────── */
  completeContent: {
    padding: 16,
    paddingBottom: 40,
  },
  missionCompleteHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  missionCompleteLabel: {
    color: C.neon,
    fontSize: 11,
    fontFamily: MONO,
    letterSpacing: 3,
    opacity: 0.7,
    marginBottom: 8,
  },
  missionCompleteTitle: {
    color: C.white,
    fontSize: 22,
    fontFamily: MONO,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  missionCompleteLine: {
    width: 60,
    height: 2,
    backgroundColor: C.neon,
    marginTop: 14,
    borderRadius: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.grayBorder,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.grayBorder,
    marginHorizontal: 4,
  },
  previewThumb: {
    height: 260,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.grayBorder,
    marginBottom: 20,
    position: 'relative',
  },
  previewThumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(5,5,5,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewThumbLabel: {
    color: C.gray,
    fontSize: 10,
    fontFamily: MONO,
    letterSpacing: 2,
  },

  /* ── Manifest ────────────────────────────────── */
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
  },
  fileIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: C.white90,
    fontSize: 13,
    fontFamily: MONO,
  },
  fileSize: {
    color: C.gray,
    fontSize: 11,
    fontFamily: MONO,
    marginTop: 2,
  },
  fileArrow: {
    color: C.gray,
    fontSize: 20,
    fontFamily: HEAD,
    fontWeight: '300',
  },

  /* ── Finalized ───────────────────────────────── */
  finalizedHero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  finalTitle: {
    color: C.white,
    fontSize: 20,
    fontFamily: MONO,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: C.neon,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: C.bg,
    fontSize: 9,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  connectionsCard: {
    marginHorizontal: 16,
    backgroundColor: C.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.grayBorder,
    overflow: 'hidden',
  },

  /* ── Settings ────────────────────────────────── */
  settingsCard: {
    marginHorizontal: 16,
    backgroundColor: C.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.grayBorder,
    overflow: 'hidden',
  },

  /* ── Code Viewer ─────────────────────────────── */
  codeHeaderTitle: {
    color: C.neon,
    fontSize: 11,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  fileTabBar: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
    backgroundColor: C.bgCard,
  },
  fileTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: C.grayBorder,
  },
  fileTabActive: {
    backgroundColor: C.bgSurface,
    borderBottomWidth: 2,
    borderBottomColor: C.neon,
  },
  fileTabText: {
    color: C.gray,
    fontSize: 11,
    fontFamily: MONO,
  },
  fileTabTextActive: {
    color: C.neon,
  },
  codeScroll: {
    flex: 1,
    backgroundColor: '#020202',
  },
  codeContent: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  codeLine: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    minHeight: 18,
  },
  codeLineNum: {
    color: 'rgba(119,117,117,0.4)',
    fontSize: 11,
    fontFamily: MONO,
    width: 44,
    paddingLeft: 8,
    paddingRight: 8,
    textAlign: 'right',
    lineHeight: 18,
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(73,72,71,0.15)',
  },
  codeLineText: {
    color: C.neonSoft,
    fontSize: 11,
    fontFamily: MONO,
    lineHeight: 18,
    paddingLeft: 12,
    flex: 1,
  },

  /* ── Section Title ───────────────────────────── */
  sectionTitle: {
    color: C.neon,
    fontSize: 10,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
    marginTop: 4,
  },

  /* ── Buttons ─────────────────────────────────── */
  neonBtn: {
    backgroundColor: C.neon,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  neonBtnText: {
    color: C.bg,
    fontSize: 13,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 3,
  },
  goldBtn: {
    backgroundColor: C.gold,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldBtnText: {
    color: C.bg,
    fontSize: 13,
    fontFamily: MONO,
    fontWeight: '700',
    letterSpacing: 3,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: C.grayBorder,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: C.white90,
    fontSize: 12,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  ghostBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: C.gray,
    fontSize: 12,
    fontFamily: MONO,
    letterSpacing: 2,
  },
});
