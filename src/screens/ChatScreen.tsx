/**
 * SaintSal Labs — Chat Screen
 * Premium AI chat with real-time streaming, model selection, vertical intelligence
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, Image, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, TierColors } from '@/config/theme';
import { SAL_MODELS, VERTICALS, SAL_SYSTEM_PROMPT } from '@/config/api';
import { useStore } from '@/lib/store';
import { streamChat } from '@/lib/api';
import SALHeader from '@/components/SALHeader';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import VerticalCard from '@/components/VerticalCard';
import type { ChatMessage, VerticalId, SALModelTier } from '@/types';

const QUICK_PROMPTS = [
  'What can you build me?',
  'Analyze the market today',
  'Deep research on AI agents',
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const cursorAnim = useRef(new Animated.Value(0)).current;

  const {
    conversations, activeConversationId, selectedModel, activeVertical,
    createConversation, addMessage, updateMessage, setActiveConversation, setActiveVertical,
  } = useStore();

  const activeConvo = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConvo?.messages || [];

  // Blinking cursor animation
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 1, duration: 400, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 0, duration: 400, easing: Easing.ease, useNativeDriver: true }),
      ])
    );
    if (isStreaming) {
      blink.start();
    } else {
      blink.stop();
      cursorAnim.setValue(0);
    }
    return () => blink.stop();
  }, [isStreaming]);

  const handleSend = useCallback((text: string) => {
    let convoId = activeConversationId;
    if (!convoId) {
      convoId = createConversation(activeVertical || undefined);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(convoId, userMsg);

    // Add streaming placeholder
    const assistantId = `msg_${Date.now()}_assistant`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    addMessage(convoId, assistantMsg);
    setIsStreaming(true);

    // Build system prompt
    let systemPrompt = SAL_SYSTEM_PROMPT;
    if (activeVertical) {
      const v = VERTICALS.find((vert) => vert.id === activeVertical);
      if (v) {
        systemPrompt = `You are SAL ${v.name} — the SaintSal ${v.name.toLowerCase()} intelligence engine. ` +
          `Provide expert, detailed analysis in this domain. ` +
          `Built by SaintVision Technologies (US Patent #10,290,222).\n\n${SAL_SYSTEM_PROMPT}`;
      }
    }

    // Build message history for context
    const currentConvo = useStore.getState().conversations.find((c) => c.id === convoId);
    const history = (currentConvo?.messages || [])
      .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content && !m.isStreaming))
      .map((m) => ({ role: m.role, content: m.content }));

    let fullContent = '';

    streamChat(
      history,
      selectedModel,
      systemPrompt,
      // onChunk
      (chunk: string) => {
        fullContent += chunk;
        updateMessage(convoId!, assistantId, {
          content: fullContent,
        });
      },
      // onDone
      (fullText: string, modelUsed: string) => {
        updateMessage(convoId!, assistantId, {
          content: fullText,
          model_used: modelUsed,
          isStreaming: false,
        });
        setIsStreaming(false);
      },
      // onError
      (error: string) => {
        updateMessage(convoId!, assistantId, {
          content: `Connection error: ${error}. Make sure the API is reachable.`,
          isStreaming: false,
        });
        setIsStreaming(false);
      }
    );
  }, [activeConversationId, selectedModel, activeVertical]);

  const handleNewChat = () => {
    setActiveConversation(null);
    setActiveVertical(null);
  };

  const handleVerticalSelect = (id: VerticalId) => {
    setActiveVertical(id);
    createConversation(id);
  };

  // Auto-scroll on new content
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/logo-120.png')}
          style={styles.heroLogo}
        />
        <View style={styles.logoGlowRing} />
      </View>

      <Text style={styles.welcomeTitle}>SaintSal™ Labs</Text>
      <Text style={styles.welcomeSubtitle}>Full Spectrum Intelligence</Text>
      <Text style={styles.welcomeDesc}>
        53 AI models, 88 connectors, one unified engine.{'\n'}
        Search. Build. Analyze. Deploy.
      </Text>

      {/* Quick action pills */}
      <View style={styles.quickActions}>
        {QUICK_PROMPTS.map((prompt, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickAction}
            onPress={() => handleSend(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionText}>{prompt}</Text>
            <Text style={styles.quickActionArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Verticals grid */}
      <Text style={styles.sectionLabel}>VERTICALS</Text>
      <View style={styles.verticalGrid}>
        {VERTICALS.map((v) => (
          <VerticalCard
            key={v.id}
            icon={v.icon}
            name={v.name}
            description={v.description}
            color={v.color}
            onPress={() => handleVerticalSelect(v.id as VerticalId)}
            compact
          />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SALHeader
        showLogo={!activeConvo}
        title={activeConvo?.title}
        subtitle={activeVertical ? VERTICALS.find(v => v.id === activeVertical)?.name : undefined}
        rightAction={
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatBtn} activeOpacity={0.7}>
            <Text style={styles.newChatIcon}>+</Text>
          </TouchableOpacity>
        }
      />

      {/* Active vertical indicator bar */}
      {activeVertical && (
        <View style={styles.verticalBar}>
          <Text style={styles.verticalBarIcon}>
            {VERTICALS.find(v => v.id === activeVertical)?.icon}
          </Text>
          <Text style={[styles.verticalBarText, {
            color: VERTICALS.find(v => v.id === activeVertical)?.color,
          }]}>
            {VERTICALS.find(v => v.id === activeVertical)?.name} Mode
          </Text>
          <TouchableOpacity onPress={() => setActiveVertical(null)} activeOpacity={0.6}>
            <Text style={styles.verticalBarClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {messages.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput
          onSend={handleSend}
          isLoading={isStreaming}
          placeholder={activeVertical
            ? `Ask about ${VERTICALS.find(v => v.id === activeVertical)?.name.toLowerCase()}...`
            : 'Ask SAL anything...'
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  messageList: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  // New chat button
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatIcon: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: '300',
  },
  // Vertical bar
  verticalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  verticalBarIcon: { fontSize: 16 },
  verticalBarText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  verticalBarClose: { color: Colors.textTertiary, fontSize: 14, padding: 4 },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: 80,
    height: 80,
    borderRadius: 22,
  },
  logoGlowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.2)',
  },
  welcomeTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: Colors.gold,
    fontSize: FontSize.md,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  welcomeDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  // Quick actions
  quickActions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  quickActionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  quickActionArrow: {
    color: Colors.gold,
    fontSize: FontSize.md,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  // Verticals
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  verticalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
});
