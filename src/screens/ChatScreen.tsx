/**
 * SaintSal Labs — Chat Screen
 * Perplexity-style AI chat with streaming, model selection, source citations
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, TierColors } from '@/config/theme';
import { SAL_MODELS, VERTICALS } from '@/config/api';
import { useStore } from '@/lib/store';
import { salClient } from '@/lib/api';
import SALHeader from '@/components/SALHeader';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import VerticalCard from '@/components/VerticalCard';
import type { ChatMessage, VerticalId } from '@/types';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const {
    conversations, activeConversationId, selectedModel, activeVertical,
    createConversation, addMessage, updateMessage, setActiveConversation, setActiveVertical,
  } = useStore();

  const activeConvo = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConvo?.messages || [];

  const handleSend = useCallback(async (text: string) => {
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

    try {
      // Build system prompt based on vertical
      let system = '';
      if (activeVertical) {
        const v = VERTICALS.find((v) => v.id === activeVertical);
        system = `You are SAL ${v?.name} — the SaintSal ${v?.name.toLowerCase()} intelligence engine. ` +
          `Provide expert, detailed analysis in this domain. ` +
          `Built by SaintVision Technologies (US Patent #10,290,222).`;
      }

      // Use streaming
      let fullContent = '';
      let modelUsed = '';
      for await (const chunk of salClient.chatStream(text, selectedModel, system)) {
        if (chunk.type === 'model') {
          modelUsed = chunk.model || '';
        } else if (chunk.type === 'text' && chunk.content) {
          fullContent += chunk.content;
          updateMessage(convoId, assistantId, {
            content: fullContent,
            model_used: modelUsed,
          });
        } else if (chunk.type === 'done') {
          updateMessage(convoId, assistantId, {
            content: fullContent,
            model_used: modelUsed,
            isStreaming: false,
          });
        }
      }
    } catch (error: any) {
      // Fallback to non-streaming
      try {
        const result = await salClient.chat(text, selectedModel);
        updateMessage(convoId, assistantId, {
          content: result.content,
          model_used: result.model_used,
          provider: result.provider,
          tokens_in: result.tokens_in,
          tokens_out: result.tokens_out,
          cost: result.cost,
          latency_ms: result.latency_ms,
          isStreaming: false,
        });
      } catch (fallbackErr: any) {
        updateMessage(convoId, assistantId, {
          content: `Connection error: ${fallbackErr.message}. Make sure the SAL Engine is running.`,
          isStreaming: false,
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [activeConversationId, selectedModel, activeVertical]);

  const handleNewChat = () => {
    setActiveConversation(null);
    setActiveVertical(null);
  };

  const handleVerticalSelect = (id: VerticalId) => {
    setActiveVertical(id);
    const convoId = createConversation(id);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Empty state — show welcome + verticals
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require('../../assets/logo-120.png')} style={{ width: 80, height: 80, borderRadius: 22, marginBottom: Spacing.lg }} />
      <Text style={styles.welcomeTitle}>SaintSal™ Labs</Text>
      <Text style={styles.welcomeSubtitle}>Full Spectrum Intelligence</Text>
      <Text style={styles.welcomeDesc}>
        53 AI models, 88 connectors, one unified engine.{'\n'}
        Search. Build. Analyze. Deploy.
      </Text>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        {['What can you build me?', 'Analyze the market today', 'Deep research on AI agents'].map((prompt, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickAction}
            onPress={() => handleSend(prompt)}
          >
            <Text style={styles.quickActionText}>{prompt}</Text>
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
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SALHeader
        showLogo={!activeConvo}
        title={activeConvo?.title}
        subtitle={activeVertical ? VERTICALS.find(v => v.id === activeVertical)?.name : undefined}
        rightAction={
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatBtn}>
            <Text style={styles.newChatIcon}>+</Text>
          </TouchableOpacity>
        }
      />

      {/* Vertical indicator */}
      {activeVertical && (
        <View style={styles.verticalBar}>
          <Text style={styles.verticalBarIcon}>
            {VERTICALS.find(v => v.id === activeVertical)?.icon}
          </Text>
          <Text style={[styles.verticalBarText, {
            color: VERTICALS.find(v => v.id === activeVertical)?.color
          }]}>
            {VERTICALS.find(v => v.id === activeVertical)?.name} Mode
          </Text>
          <TouchableOpacity onPress={() => setActiveVertical(null)}>
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
  quickActions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  quickAction: {
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
  },
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
