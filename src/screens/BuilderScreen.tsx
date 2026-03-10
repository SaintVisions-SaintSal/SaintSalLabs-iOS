/**
 * SaintSal Labs — Builder Screen
 * Real-time Claude streaming code generation with chat + code viewer
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/config/theme';
import SALHeader from '@/components/SALHeader';
import { streamBuilderChat } from '@/lib/api';
import { useStore } from '@/lib/store';
import type { BuilderProject, BuilderFile } from '@/types';

// ─── Language color dots ───
const LANG_COLORS: Record<string, string> = {
  tsx: '#3178C6', ts: '#3178C6',
  jsx: '#F7DF1E', js: '#F7DF1E',
  css: '#1572B6', html: '#E34F26',
  json: '#666', py: '#3776AB',
  md: '#A0A0B0', text: '#6B6B7B',
};

// ─── Parse code blocks from Claude's markdown ───
function parseCodeBlocks(text: string): { name: string; lang: string; content: string }[] {
  const blocks: { name: string; lang: string; content: string }[] = [];
  const regex = /```(\w+)?\s*([\w./\-]+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lang = match[1] || 'text';
    const name = match[2] || `file${blocks.length + 1}.${lang}`;
    const content = match[3].trim();
    if (content.length > 0) {
      blocks.push({ name, lang, content });
    }
  }
  return blocks;
}

// ─── Chat message type ───
interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
}

// ─── Quick templates ───
const TEMPLATES = [
  { icon: '🏠', title: 'SaaS Landing Page', prompt: 'Build a modern SaaS landing page with hero section, feature cards, pricing tiers, testimonials, and a dark theme with gold accents. Include responsive CSS.' },
  { icon: '📊', title: 'Dashboard', prompt: 'Build an admin dashboard with sidebar navigation, stat cards, a data table, and chart placeholders. Dark theme, responsive layout.' },
  { icon: '🔌', title: 'REST API', prompt: 'Build a RESTful API with Express.js including user CRUD endpoints, JWT auth middleware, error handling, and a health check route. Include TypeScript types.' },
  { icon: '📝', title: 'Blog', prompt: 'Build a developer blog with a post list, individual post view, categories sidebar, search, and syntax-highlighted code blocks. Dark theme.' },
];

export default function BuilderScreen() {
  const insets = useSafeAreaInsets();
  const { addBuilderProject } = useStore();

  // ─── State ───
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'code'>('chat');
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const chatScrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse animation for streaming indicator
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(0.4);
  }, [pulseAnim]);

  // ─── All messages including current stream ───
  const allMessages: ChatMsg[] = isStreaming
    ? [...messages, { role: 'assistant', content: streamingText }]
    : messages;

  // ─── Parsed code blocks from last assistant message ───
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const codeBlocks = lastAssistant ? parseCodeBlocks(lastAssistant.content) : [];

  // ─── Send message ───
  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    setActiveView('chat');
    startPulse();

    const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));

    let accumulated = '';

    streamBuilderChat(
      apiMessages,
      (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
        // Auto-scroll
        setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: false }), 50);
      },
      (fullText, modelUsed) => {
        const assistantMsg: ChatMsg = { role: 'assistant', content: fullText, modelUsed };
        setMessages(prev => [...prev, assistantMsg]);
        setStreamingText('');
        setIsStreaming(false);
        stopPulse();

        // Parse files and save project if code was generated
        const parsed = parseCodeBlocks(fullText);
        if (parsed.length > 0) {
          const files: BuilderFile[] = parsed.map(b => ({
            path: b.name,
            content: b.content,
            language: b.lang,
          }));
          addBuilderProject({
            id: `proj_${Date.now()}`,
            name: text.slice(0, 40),
            prompt: text,
            files,
            framework: 'auto',
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          setActiveFileIdx(0);
        }
      },
      (error) => {
        const errMsg: ChatMsg = { role: 'assistant', content: `Build failed: ${error}` };
        setMessages(prev => [...prev, errMsg]);
        setStreamingText('');
        setIsStreaming(false);
        stopPulse();
      },
    );
  }, [input, messages, isStreaming, addBuilderProject, startPulse, stopPulse]);

  // ─── Copy file content ───
  const handleCopy = useCallback((content: string, idx: number) => {
    try {
      const Clipboard = require('expo-clipboard');
      Clipboard.setStringAsync(content);
    } catch {
      // fallback
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  // ─── Active file for code viewer ───
  const activeFile = codeBlocks[activeFileIdx];

  // ─── Has chat history? ───
  const hasMessages = allMessages.length > 0;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Builder" subtitle="Code generation powered by Claude" />

      {/* ─── Segmented Control ─── */}
      {hasMessages && (
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'chat' && styles.segmentBtnActive]}
            onPress={() => setActiveView('chat')}
          >
            <Text style={[styles.segmentText, activeView === 'chat' && styles.segmentTextActive]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeView === 'code' && styles.segmentBtnActive]}
            onPress={() => codeBlocks.length > 0 && setActiveView('code')}
            disabled={codeBlocks.length === 0}
          >
            <Text style={[
              styles.segmentText,
              activeView === 'code' && styles.segmentTextActive,
              codeBlocks.length === 0 && styles.segmentTextDisabled,
            ]}>
              Code{codeBlocks.length > 0 ? ` (${codeBlocks.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── CHAT VIEW ─── */}
      {activeView === 'chat' && (
        <View style={styles.chatContainer}>
          {!hasMessages ? (
            /* ─── Empty state / welcome ─── */
            <ScrollView style={styles.scroll} contentContainerStyle={styles.welcomeContent}>
              <View style={styles.heroSection}>
                <View style={styles.builderIcon}>
                  <Text style={styles.builderIconText}>{'</>'}</Text>
                </View>
                <Text style={styles.heroTitle}>Build Anything</Text>
                <Text style={styles.heroSub}>
                  Describe what you want — SAL generates{'\n'}
                  production-ready code in real time.
                </Text>
              </View>

              {/* Quick templates */}
              <Text style={styles.sectionLabel}>Quick Templates</Text>
              <View style={styles.templateGrid}>
                {TEMPLATES.map((t, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.templateCard}
                    onPress={() => handleSend(t.prompt)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateIcon}>{t.icon}</Text>
                    <Text style={styles.templateTitle}>{t.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            /* ─── Chat messages ─── */
            <ScrollView
              ref={chatScrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.chatContent}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: false })}
            >
              {allMessages.map((msg, i) => (
                <View
                  key={i}
                  style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAssistant]}
                >
                  {msg.role === 'assistant' && (
                    <View style={styles.assistantDot}>
                      <Text style={styles.assistantDotText}>S</Text>
                    </View>
                  )}
                  <View style={[styles.msgBubble, msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAssistant]}>
                    <Text style={[styles.msgText, msg.role === 'user' && styles.msgTextUser]} selectable>
                      {msg.content}
                    </Text>
                    {msg.modelUsed && (
                      <Text style={styles.modelTag}>{msg.modelUsed}</Text>
                    )}
                  </View>
                </View>
              ))}
              {isStreaming && streamingText.length === 0 && (
                <View style={[styles.msgRow, styles.msgRowAssistant]}>
                  <View style={styles.assistantDot}>
                    <Text style={styles.assistantDotText}>S</Text>
                  </View>
                  <Animated.View style={[styles.thinkingBubble, { opacity: pulseAnim }]}>
                    <Text style={styles.thinkingText}>Generating code...</Text>
                  </Animated.View>
                </View>
              )}
            </ScrollView>
          )}

          {/* ─── Input bar ─── */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder={hasMessages ? 'Describe changes or ask for more...' : 'Describe what you want to build...'}
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={4000}
              editable={!isStreaming}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <ActivityIndicator color="#0A0A0F" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── CODE VIEW ─── */}
      {activeView === 'code' && codeBlocks.length > 0 && (
        <View style={styles.codeContainer}>
          {/* File tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileTabs}>
            {codeBlocks.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.fileTab, i === activeFileIdx && styles.fileTabActive]}
                onPress={() => setActiveFileIdx(i)}
              >
                <View style={[styles.langDot, { backgroundColor: LANG_COLORS[f.lang] || Colors.textTertiary }]} />
                <Text style={[styles.fileTabText, i === activeFileIdx && styles.fileTabTextActive]} numberOfLines={1}>
                  {f.name.split('/').pop()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* File path + metadata */}
          {activeFile && (
            <View style={styles.fileMetaRow}>
              <View style={styles.fileMetaLeft}>
                <Text style={styles.filePath}>{activeFile.name}</Text>
                <View style={styles.fileMetaPill}>
                  <Text style={styles.fileMetaPillText}>{activeFile.lang}</Text>
                </View>
                <Text style={styles.fileLines}>{activeFile.content.split('\n').length} lines</Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copiedIdx === activeFileIdx && styles.copyBtnCopied]}
                onPress={() => handleCopy(activeFile.content, activeFileIdx)}
              >
                <Text style={[styles.copyBtnText, copiedIdx === activeFileIdx && styles.copyBtnTextCopied]}>
                  {copiedIdx === activeFileIdx ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Code content */}
          <ScrollView style={styles.codeScroll} horizontal>
            <ScrollView style={styles.codeScrollInner} nestedScrollEnabled>
              {activeFile && (
                <View style={styles.codeBlock}>
                  {activeFile.content.split('\n').map((line, lineIdx) => (
                    <View key={lineIdx} style={styles.codeLine}>
                      <Text style={styles.lineNumber}>{lineIdx + 1}</Text>
                      <Text style={styles.codeText} selectable>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </ScrollView>

          {/* Iterate bar at bottom of code view */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder="Describe changes to the code..."
              placeholderTextColor={Colors.textMuted}
              multiline
              editable={!isStreaming}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
              onPress={() => { handleSend(); setActiveView('chat'); }}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <ActivityIndicator color="#0A0A0F" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───
const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const CODE_BG = '#0D0D14';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  // ─── Segmented control ───
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.sm,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm - 2,
  },
  segmentBtnActive: {
    backgroundColor: Colors.bgTertiary,
  },
  segmentText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.gold,
  },
  segmentTextDisabled: {
    opacity: 0.35,
  },

  // ─── Welcome / empty state ───
  welcomeContent: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  builderIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.gold,
  },
  builderIconText: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: '700',
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  templateCard: {
    width: '48%' as any,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  templateIcon: {
    fontSize: 24,
  },
  templateTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // ─── Chat messages ───
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  msgRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  assistantDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  assistantDotText: {
    color: '#0A0A0F',
    fontSize: 11,
    fontWeight: '900',
  },
  msgBubble: {
    maxWidth: '82%' as any,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  msgBubbleUser: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  msgBubbleAssistant: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    lineHeight: 22,
    fontFamily: MONO,
  },
  msgTextUser: {
    color: '#0A0A0F',
    fontFamily: undefined,
  },
  modelTag: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  thinkingBubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  thinkingText: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },

  // ─── Input bar ───
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.gold,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    color: '#0A0A0F',
    fontSize: 20,
    fontWeight: '700',
  },

  // ─── Code viewer ───
  codeContainer: {
    flex: 1,
  },
  fileTabs: {
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    maxHeight: 44,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  fileTabActive: {
    borderBottomColor: Colors.gold,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fileTabText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    maxWidth: 120,
  },
  fileTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  fileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  fileMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  filePath: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: MONO,
  },
  fileMetaPill: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fileMetaPillText: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fileLines: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  copyBtn: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  copyBtnCopied: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  copyBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  copyBtnTextCopied: {
    color: Colors.gold,
  },
  codeScroll: {
    flex: 1,
    backgroundColor: CODE_BG,
  },
  codeScrollInner: {
    flex: 1,
  },
  codeBlock: {
    paddingVertical: Spacing.md,
    minWidth: '100%' as any,
  },
  codeLine: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    minHeight: 22,
  },
  lineNumber: {
    width: 40,
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: MONO,
    textAlign: 'right',
    marginRight: Spacing.lg,
    opacity: 0.5,
  },
  codeText: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: MONO,
    flex: 1,
  },
});
