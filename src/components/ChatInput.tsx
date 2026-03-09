/**
 * SaintSal Labs — Chat Input Bar
 * Perplexity-style input with model selector + send
 */
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Keyboard } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '@/config/theme';
import ModelSelector from './ModelSelector';

interface Props {
  onSend: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  showModelSelector?: boolean;
}

export default function ChatInput({ onSend, placeholder, isLoading, showModelSelector = true }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    Keyboard.dismiss();

    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {showModelSelector && (
        <View style={styles.modelRow}>
          <ModelSelector />
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder || 'Ask SAL anything...'}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={10000}
          returnKeyType="default"
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && !isLoading ? styles.sendBtnActive : null]}
            onPress={handleSend}
            disabled={!text.trim() || isLoading}
          >
            <View style={styles.sendArrow}>
              <View style={[styles.arrowLine, text.trim() && !isLoading ? styles.arrowLineActive : null]} />
              <View style={[styles.arrowHead, text.trim() && !isLoading ? styles.arrowHeadActive : null]} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  modelRow: {
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.lg,
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
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.gold,
  },
  sendArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  arrowLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.textMuted,
    borderRadius: 1,
  },
  arrowLineActive: {
    backgroundColor: '#0A0A0F',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.textMuted,
    position: 'absolute',
    top: 0,
  },
  arrowHeadActive: {
    borderBottomColor: '#0A0A0F',
  },
});
