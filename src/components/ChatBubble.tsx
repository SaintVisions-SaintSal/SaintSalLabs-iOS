/**
 * SaintSal Labs — Chat Bubble
 * Perplexity-style message rendering with model badge + sources
 */
import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, TierColors } from '@/config/theme';
import type { ChatMessage } from '@/types';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Model badge for assistant */}
      {!isUser && message.model_used && (
        <View style={styles.modelBadge}>
          <View style={[styles.modelDot, {
            backgroundColor: message.model_used.includes('Haiku') || message.model_used.includes('Flash')
              ? TierColors.mini
              : message.model_used.includes('Opus')
              ? TierColors.max
              : TierColors.pro
          }]} />
          <Text style={styles.modelText}>{message.model_used}</Text>
          {message.latency_ms ? (
            <Text style={styles.latencyText}>{message.latency_ms}ms</Text>
          ) : null}
        </View>
      )}

      {/* Message content */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {message.content}
          {isStreaming && <Text style={styles.cursor}>▊</Text>}
        </Text>
      </View>

      {/* Sources */}
      {message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Sources</Text>
          {message.sources.map((src, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sourceItem}
              onPress={() => Linking.openURL(src.url)}
            >
              <Text style={styles.sourceNumber}>{i + 1}</Text>
              <View style={styles.sourceTextContainer}>
                <Text style={styles.sourceTitle} numberOfLines={1}>{src.title}</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>{src.source || new URL(src.url).hostname}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Token info */}
      {!isUser && message.tokens_in != null && !isStreaming && (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {message.tokens_in + (message.tokens_out || 0)} tokens
          </Text>
          {message.cost != null && message.cost > 0 && (
            <Text style={styles.metaText}>
              ${message.cost.toFixed(4)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  modelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modelText: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  latencyText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  userBubble: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  messageText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: '#0A0A0F',
    fontWeight: '500',
  },
  cursor: {
    color: Colors.gold,
    fontSize: FontSize.md,
  },
  sourcesContainer: {
    marginTop: Spacing.sm,
    maxWidth: '85%',
  },
  sourcesLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: 4,
    gap: Spacing.sm,
  },
  sourceNumber: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '700',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.bgInput,
    textAlign: 'center',
    lineHeight: 18,
  },
  sourceTextContainer: {
    flex: 1,
  },
  sourceTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  sourceUrl: {
    color: Colors.blue,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 4,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
