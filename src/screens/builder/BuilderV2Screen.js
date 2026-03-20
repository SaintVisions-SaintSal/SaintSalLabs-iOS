/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER V2 (v0-STYLE)
   Real codegen builder: Chat + File Tree + Live Preview
   Prompt → Project → Code Files → Live Preview
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Dimensions, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { C, T } from '../../config/theme';
import { SALMark } from '../../components';
import useBuilderProject from '../../hooks/useBuilderProject';
import { stitchGenerate } from '../../lib/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/* ── View Modes ──────────────────────────────────── */
const VIEW_MODES = [
  { id: 'chat',    label: 'Chat',    icon: '💬' },
  { id: 'code',    label: 'Code',    icon: '⟨⟩' },
  { id: 'preview', label: 'Preview', icon: '👁' },
  { id: 'split',   label: 'Split',   icon: '◫' },
];

/* ── Build Modes (Think → Plan → Build) ──────────── */
const BUILD_MODES = [
  { id: 'quick',  label: 'Quick Build',  icon: '⚡', desc: 'SAL generates directly' },
  { id: 'grok',   label: 'SuperGrok',    icon: '🧠', desc: 'Think → Plan → Build' },
  { id: 'stitch', label: 'Stitch Design', icon: '🎨', desc: 'Google Stitch UI gen' },
];

/* ── Starter Prompts ─────────────────────────────── */
const STARTERS = [
  'Build a SaaS landing page with pricing cards and CTA',
  'Create an animated portfolio with dark theme + gold accents',
  'Build a todo app with local storage and smooth animations',
  'Create a dashboard with charts and real-time counters',
];

/* ── Language Colors ─────────────────────────────── */
const LANG_COLORS = {
  html: '#E34F26',
  css: '#1572B6',
  javascript: '#F7DF1E',
  js: '#F7DF1E',
  typescript: '#3178C6',
  tsx: '#3178C6',
  json: '#6B7280',
  text: '#9CA3AF',
};

const LANG_ICONS = {
  html: '🌐',
  css: '🎨',
  javascript: '⚡',
  js: '⚡',
  typescript: '🔷',
  tsx: '🔷',
  json: '📦',
  text: '📄',
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function BuilderV2Screen() {
  const router = useRouter();
  const project = useBuilderProject();
  const [viewMode, setViewMode] = useState('chat');
  const [buildMode, setBuildMode] = useState('quick');
  const [input, setInput] = useState('');
  const [showFileTree, setShowFileTree] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const chatScrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const webViewRef = useRef(null);

  /* ── Pulse animation for status dot ─────────────── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  /* ── Auto-scroll chat ──────────────────────────── */
  useEffect(() => {
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [project.conversation]);

  /* ── Auto-switch to preview after generation ──── */
  useEffect(() => {
    if (!project.generating && project.files.length > 0 && project.conversation.length > 0) {
      const lastMsg = project.conversation[project.conversation.length - 1];
      if (lastMsg?.role === 'assistant' && lastMsg?.filesGenerated > 0) {
        setViewMode('split');
      }
    }
  }, [project.generating, project.conversation]);

  /* ── Handle send (routes by build mode) ────────── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || project.generating) return;
    setInput('');

    // SuperGrok mode → navigate to orchestration screen
    if (buildMode === 'grok') {
      router.push({ pathname: '/supergrok', params: { prompt: text } });
      return;
    }

    // Stitch mode → generate design then build
    if (buildMode === 'stitch') {
      try {
        const design = await stitchGenerate({ prompt: text, mode: 'pro' });
        if (design?.content) {
          await project.generate(`Build this based on the following Stitch design:\n${design.content}\n\nOriginal request: ${text}`);
        } else {
          await project.generate(text);
        }
      } catch {
        await project.generate(text);
      }
      return;
    }

    // Quick mode → direct generation
    await project.generate(text);
  }, [input, project, buildMode, router]);

  /* ── Handle starter prompt ─────────────────────── */
  const handleStarter = useCallback((text) => {
    setInput(text);
    // Small delay so user sees it, then send
    setTimeout(async () => {
      await project.generate(text);
    }, 100);
  }, [project]);

  /* ═══ RENDER: Header ═══════════════════════════ */
  const renderHeader = () => (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <SALMark size={28} />
        <View>
          <Text style={s.headerKicker}>BUILDER · CREATE</Text>
          <Text style={s.headerTitle}>SAL Builder</Text>
          <View style={s.statusRow}>
            <Animated.View style={[s.statusDot, { opacity: pulseAnim }]} />
            <Text style={s.statusText}>
              {project.generating ? 'GENERATING...' : 'READY'}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.headerRight}>
        <TouchableOpacity
          style={[s.headerBtn, buildMode === 'grok' && { borderColor: C.amber + '44' }]}
          onPress={() => setShowModeSelector(!showModeSelector)}
        >
          <Text style={s.headerBtnIcon}>
            {BUILD_MODES.find(m => m.id === buildMode)?.icon || '⚡'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => setShowFileTree(!showFileTree)}
        >
          <Text style={s.headerBtnIcon}>📁</Text>
          <Text style={s.headerBtnBadge}>{project.files.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.headerBtn} onPress={project.resetProject}>
          <Text style={s.headerBtnIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ═══ RENDER: Build Mode Selector (overlay) ═══ */
  const renderModeSelector = () => {
    if (!showModeSelector) return null;
    return (
      <View style={s.modeSelectorOverlay}>
        <View style={s.modeSelector}>
          <Text style={s.modeSelectorTitle}>BUILD MODE</Text>
          {BUILD_MODES.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={[
                s.modeSelectorItem,
                buildMode === mode.id && s.modeSelectorItemActive,
              ]}
              onPress={() => { setBuildMode(mode.id); setShowModeSelector(false); }}
            >
              <Text style={s.modeSelectorIcon}>{mode.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[
                  s.modeSelectorLabel,
                  buildMode === mode.id && { color: C.amber },
                ]}>{mode.label}</Text>
                <Text style={s.modeSelectorDesc}>{mode.desc}</Text>
              </View>
              {buildMode === mode.id && (
                <Text style={{ color: C.amber, fontSize: 14 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  /* ═══ RENDER: View Mode Tabs ═══════════════════ */
  const renderModeTabs = () => (
    <View style={s.modeBar}>
      {VIEW_MODES.map(mode => (
        <TouchableOpacity
          key={mode.id}
          style={[s.modeTab, viewMode === mode.id && s.modeTabActive]}
          onPress={() => setViewMode(mode.id)}
        >
          <Text style={s.modeIcon}>{mode.icon}</Text>
          <Text style={[s.modeLabel, viewMode === mode.id && s.modeLabelActive]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /* ═══ RENDER: Chat Panel ═══════════════════════ */
  const renderChatPanel = () => (
    <View style={s.chatPanel}>
      <ScrollView
        ref={chatScrollRef}
        style={s.chatScroll}
        contentContainerStyle={s.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome message if empty */}
        {project.conversation.length === 0 && (
          <View style={s.welcomeWrap}>
            <View style={s.welcomeIcon}>
              <Text style={{ fontSize: 32 }}>⚡</Text>
            </View>
            <Text style={s.welcomeTitle}>SAL Builder V2</Text>
            <Text style={s.welcomeSubtitle}>
              Describe what you want to build. I'll generate the complete project.
            </Text>

            <View style={s.starterGrid}>
              {STARTERS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.starterCard}
                  onPress={() => handleStarter(prompt)}
                  activeOpacity={0.7}
                >
                  <Text style={s.starterText}>{prompt}</Text>
                  <Text style={s.starterArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Chat messages */}
        {project.conversation.map((msg, i) => (
          <View
            key={i}
            style={[
              s.msgBubble,
              msg.role === 'user' ? s.msgUser : s.msgAssistant,
              msg.isError && s.msgError,
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={s.msgAvatarRow}>
                <SALMark size={18} />
                <Text style={s.msgRoleLabel}>SAL Builder</Text>
                {msg.filesGenerated > 0 && (
                  <View style={s.filesBadge}>
                    <Text style={s.filesBadgeText}>
                      {msg.filesGenerated} file{msg.filesGenerated > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text style={[s.msgText, msg.role === 'user' && s.msgTextUser]}>
              {msg.content}
            </Text>
          </View>
        ))}

        {/* Generating indicator */}
        {project.generating && (
          <View style={[s.msgBubble, s.msgAssistant]}>
            <View style={s.msgAvatarRow}>
              <SALMark size={18} />
              <Text style={s.msgRoleLabel}>SAL Builder</Text>
            </View>
            <View style={s.genIndicator}>
              <ActivityIndicator size="small" color={C.amber} />
              <Text style={s.genText}>Generating your project...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  /* ═══ RENDER: File Tree Sidebar ════════════════ */
  const renderFileTree = () => (
    <View style={s.fileTree}>
      <View style={s.fileTreeHeader}>
        <Text style={s.fileTreeTitle}>FILES</Text>
        <TouchableOpacity onPress={() => setShowFileTree(false)}>
          <Text style={{ color: C.textDim, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {project.files.map((file, i) => {
          const isActive = file.path === project.activeFilePath;
          const lang = file.language || 'text';
          const langColor = LANG_COLORS[lang] || '#9CA3AF';
          const icon = LANG_ICONS[lang] || '📄';

          return (
            <TouchableOpacity
              key={file.path}
              style={[s.fileRow, isActive && s.fileRowActive]}
              onPress={() => {
                project.setActiveFilePath(file.path);
                if (viewMode === 'preview') setViewMode('code');
              }}
              onLongPress={() => {
                Alert.alert(
                  file.path,
                  'Delete this file?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => project.deleteFile(file.path) },
                  ]
                );
              }}
            >
              <Text style={s.fileIcon}>{icon}</Text>
              <Text style={[s.fileName, isActive && { color: C.amber }]}>{file.path}</Text>
              <View style={[s.langDot, { backgroundColor: langColor }]} />
            </TouchableOpacity>
          );
        })}

        {/* Add file button */}
        <TouchableOpacity
          style={s.addFileBtn}
          onPress={() => {
            Alert.prompt?.(
              'New File',
              'Enter filename (e.g., utils.js)',
              (name) => {
                if (name?.trim()) {
                  const ext = name.split('.').pop();
                  const langMap = { html: 'html', css: 'css', js: 'javascript', ts: 'typescript', json: 'json' };
                  project.addFile(name.trim(), langMap[ext] || 'text', '');
                }
              }
            ) || (() => {
              // Fallback for Android (no Alert.prompt)
              project.addFile(`new-file-${Date.now()}.js`, 'javascript', '// New file\n');
            })();
          }}
        >
          <Text style={s.addFileIcon}>+</Text>
          <Text style={s.addFileText}>New File</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  /* ═══ RENDER: Code Editor ═════════════════════ */
  const renderCodeEditor = () => {
    const file = project.activeFile;
    if (!file) return null;

    const lines = (file.content || '').split('\n');
    const lang = file.language || 'text';
    const langColor = LANG_COLORS[lang] || '#9CA3AF';

    return (
      <View style={s.codePanel}>
        {/* File tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.codeTabBar}
          contentContainerStyle={s.codeTabContent}
        >
          {project.files.map(f => (
            <TouchableOpacity
              key={f.path}
              style={[s.codeTab, f.path === project.activeFilePath && s.codeTabActive]}
              onPress={() => project.setActiveFilePath(f.path)}
            >
              <Text style={{ fontSize: 10 }}>{LANG_ICONS[f.language] || '📄'}</Text>
              <Text style={[
                s.codeTabLabel,
                f.path === project.activeFilePath && s.codeTabLabelActive,
              ]}>
                {f.path}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Code content */}
        <ScrollView style={s.codeScroll} showsVerticalScrollIndicator={false}>
          <View style={s.codeWrap}>
            {/* Line numbers */}
            <View style={s.lineNumbers}>
              {lines.map((_, i) => (
                <Text key={i} style={s.lineNum}>{i + 1}</Text>
              ))}
            </View>
            {/* Code text */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={s.codeText} selectable>
                {file.content}
              </Text>
            </ScrollView>
          </View>
        </ScrollView>

        {/* File info bar */}
        <View style={s.codeInfoBar}>
          <View style={s.codeInfoLeft}>
            <View style={[s.langIndicator, { backgroundColor: langColor + '33' }]}>
              <Text style={[s.langIndicatorText, { color: langColor }]}>{lang.toUpperCase()}</Text>
            </View>
            <Text style={s.codeInfoText}>{lines.length} lines</Text>
          </View>
          <Text style={s.codeInfoText}>UTF-8</Text>
        </View>
      </View>
    );
  };

  /* ═══ RENDER: Live Preview ═══════════════════ */
  const renderPreview = () => {
    const html = project.buildPreviewHtml();

    return (
      <View style={s.previewPanel}>
        {/* Preview bar */}
        <View style={s.previewBar}>
          <View style={s.previewDots}>
            <View style={[s.dot, { backgroundColor: '#EF4444' }]} />
            <View style={[s.dot, { backgroundColor: '#F59E0B' }]} />
            <View style={[s.dot, { backgroundColor: '#22C55E' }]} />
          </View>
          <View style={s.previewUrlBar}>
            <Text style={s.previewUrl}>
              {project.previewEntry || 'index.html'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => webViewRef.current?.reload()}
            style={s.previewReload}
          >
            <Text style={{ color: C.textDim, fontSize: 12 }}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={s.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={s.previewLoading}>
              <ActivityIndicator color={C.amber} />
              <Text style={s.previewLoadingText}>Rendering preview...</Text>
            </View>
          )}
          onError={(e) => console.log('WebView error:', e.nativeEvent)}
        />
      </View>
    );
  };

  /* ═══ RENDER: Input Bar ═══════════════════════ */
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
            placeholder={project.conversation.length > 0 ? 'Edit: "change the header to blue"' : 'Describe what you want to build...'}
            placeholderTextColor={C.textGhost}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!project.generating}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || project.generating) && s.sendBtnDisabled]}
            onPress={project.generating ? project.cancelGeneration : handleSend}
            disabled={!input.trim() && !project.generating}
          >
            {project.generating ? (
              <Text style={s.sendIcon}>⬛</Text>
            ) : (
              <Text style={s.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Next steps quick actions */}
        {project.nextSteps.length > 0 && !project.generating && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.nextStepsRow}
            contentContainerStyle={{ gap: 8 }}
          >
            {project.nextSteps.slice(0, 3).map((step, i) => (
              <TouchableOpacity
                key={i}
                style={s.nextStepChip}
                onPress={() => {
                  setInput(step);
                  setTimeout(() => project.generate(step), 100);
                }}
              >
                <Text style={s.nextStepText}>✨ {step}</Text>
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
      {renderModeSelector()}
      {renderModeTabs()}

      <View style={s.main}>
        {/* File tree overlay */}
        {showFileTree && renderFileTree()}

        {/* Main content area */}
        <View style={{ flex: 1 }}>
          {viewMode === 'chat' && renderChatPanel()}
          {viewMode === 'code' && renderCodeEditor()}
          {viewMode === 'preview' && renderPreview()}
          {viewMode === 'split' && (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                {renderPreview()}
              </View>
              <View style={s.splitDivider} />
              <View style={{ height: SCREEN_H * 0.25 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.splitFileBar}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {project.files.map(f => (
                    <TouchableOpacity
                      key={f.path}
                      style={[
                        s.splitFileChip,
                        f.path === project.activeFilePath && s.splitFileChipActive,
                      ]}
                      onPress={() => project.setActiveFilePath(f.path)}
                    >
                      <Text style={{ fontSize: 10 }}>{LANG_ICONS[f.language] || '📄'}</Text>
                      <Text style={[
                        s.splitFileChipText,
                        f.path === project.activeFilePath && { color: C.amber },
                      ]}>{f.path}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView style={{ flex: 1, padding: 8 }} showsVerticalScrollIndicator={false}>
                  <Text style={s.splitCode} selectable>
                    {project.activeFile?.content || ''}
                  </Text>
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </View>

      {renderInputBar()}
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* ── Header ─────────────────────────────────────── */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerKicker: {
    fontSize: 10,
    fontWeight: '800',
    color: C.gold,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: C.textDim, textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 14, color: C.textMuted },
  headerBtnBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center',
  },

  /* ── Mode Selector Overlay ──────────────────────── */
  modeSelectorOverlay: {
    position: 'absolute', top: 60, right: 12, zIndex: 100,
  },
  modeSelector: {
    width: 220, backgroundColor: C.bgElevated,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 10,
  },
  modeSelectorTitle: {
    fontSize: 9, fontWeight: '800', letterSpacing: 1.2,
    color: C.textGhost, paddingHorizontal: 10, paddingVertical: 6,
  },
  modeSelectorItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10,
  },
  modeSelectorItemActive: { backgroundColor: C.amberGhost },
  modeSelectorIcon: { fontSize: 18 },
  modeSelectorLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  modeSelectorDesc: { fontSize: 10, color: C.textDim, marginTop: 1 },

  /* ── Mode Tabs ──────────────────────────────────── */
  modeBar: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  modeTabActive: {
    borderColor: C.amber + '33',
    backgroundColor: C.amberGhost,
  },
  modeIcon: { fontSize: 13 },
  modeLabel: { fontSize: 12, fontWeight: '700', color: C.textDim },
  modeLabelActive: { color: C.text },

  /* ── Main ───────────────────────────────────────── */
  main: { flex: 1, flexDirection: 'row' },

  /* ── Chat Panel ─────────────────────────────────── */
  chatPanel: { flex: 1 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16 },

  /* Welcome */
  welcomeWrap: { alignItems: 'center', paddingTop: 34 },
  welcomeIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amber + '33',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  /* Starters */
  starterGrid: { marginTop: 24, width: '100%', gap: 8 },
  starterCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
  },
  starterText: { fontSize: 13, color: C.textSub, flex: 1, marginRight: 12 },
  starterArrow: { fontSize: 16, color: C.amber },

  /* Messages */
  msgBubble: {
    marginBottom: 12, padding: 14, borderRadius: 14, maxWidth: '100%',
  },
  msgUser: {
    backgroundColor: C.amber + '18', borderWidth: 1, borderColor: C.amber + '28',
    alignSelf: 'flex-end', maxWidth: '85%',
  },
  msgAssistant: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignSelf: 'flex-start', maxWidth: '100%',
  },
  msgError: { borderColor: C.red + '44' },
  msgAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  msgRoleLabel: { fontSize: 11, fontWeight: '700', color: C.amber, letterSpacing: 0.5 },
  filesBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
    backgroundColor: C.green + '22', borderWidth: 1, borderColor: C.green + '44',
  },
  filesBadgeText: { fontSize: 9, fontWeight: '700', color: C.green },
  msgText: { fontSize: 14, lineHeight: 22, color: C.textSub },
  msgTextUser: { color: C.text },

  /* Generating */
  genIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  genText: { fontSize: 13, color: C.textMuted, fontStyle: 'italic' },

  /* ── File Tree ──────────────────────────────────── */
  fileTree: {
    width: 200, backgroundColor: C.sidebar,
    borderRightWidth: 1, borderRightColor: C.border,
  },
  fileTreeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  fileTreeTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: C.textDim },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, paddingHorizontal: 14,
  },
  fileRowActive: { backgroundColor: C.amberGhost },
  fileIcon: { fontSize: 12 },
  fileName: { fontSize: 12, color: C.textMuted, flex: 1 },
  langDot: { width: 6, height: 6, borderRadius: 3 },
  addFileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: C.border, marginTop: 8,
  },
  addFileIcon: { fontSize: 14, color: C.textDim },
  addFileText: { fontSize: 12, color: C.textDim, fontStyle: 'italic' },

  /* ── Code Editor ────────────────────────────────── */
  codePanel: { flex: 1 },
  codeTabBar: {
    maxHeight: 38, borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bgCard,
  },
  codeTabContent: { paddingHorizontal: 4, alignItems: 'center' },
  codeTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  codeTabActive: { borderBottomColor: C.amber },
  codeTabLabel: { fontSize: 11, fontWeight: '600', color: C.textDim },
  codeTabLabelActive: { color: C.amber },

  codeScroll: { flex: 1, backgroundColor: C.bg, padding: 12 },
  codeWrap: { flexDirection: 'row' },
  lineNumbers: { marginRight: 12, alignItems: 'flex-end' },
  lineNum: { fontSize: 12, lineHeight: 20, color: C.textGhost, fontFamily: 'monospace' },
  codeText: { fontSize: 12, lineHeight: 20, color: '#C8D3F5', fontFamily: 'monospace' },

  codeInfoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border,
  },
  codeInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langIndicator: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  langIndicatorText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  codeInfoText: { fontSize: 10, color: C.textDim },

  /* ── Preview ────────────────────────────────────── */
  previewPanel: { flex: 1, backgroundColor: '#000' },
  previewBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: C.bgElevated,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  previewDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  previewUrlBar: {
    flex: 1, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, backgroundColor: C.bgInput,
  },
  previewUrl: { fontSize: 11, color: C.textDim, fontFamily: 'monospace' },
  previewReload: { padding: 4 },
  webview: { flex: 1, backgroundColor: '#000' },
  previewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
  },
  previewLoadingText: { fontSize: 12, color: C.textDim, marginTop: 8 },

  /* ── Split View ─────────────────────────────────── */
  splitDivider: { height: 2, backgroundColor: C.amber + '33' },
  splitFileBar: {
    maxHeight: 34, borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bgCard, paddingHorizontal: 8,
  },
  splitFileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  splitFileChipActive: { borderBottomWidth: 2, borderBottomColor: C.amber },
  splitFileChipText: { fontSize: 10, fontWeight: '600', color: C.textDim },
  splitCode: { fontSize: 11, lineHeight: 18, color: '#C8D3F5', fontFamily: 'monospace' },

  /* ── Input Bar ──────────────────────────────────── */
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

  /* Next Steps */
  nextStepsRow: { marginTop: 8, maxHeight: 36 },
  nextStepChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99,
    backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.amber + '28',
  },
  nextStepText: { fontSize: 11, color: C.amber, fontWeight: '600' },
});
