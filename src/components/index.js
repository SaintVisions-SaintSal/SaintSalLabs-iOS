/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SHARED COMPONENTS
═══════════════════════════════════════════════════ */
export { default as ComputeBar } from './ComputeBar';
export { default as VerticalSwitcher } from './VerticalSwitcher';
export { default as OnboardingTooltip } from './OnboardingTooltip';
export { default as ErrorState } from './ErrorState';
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { C } from '../config/theme';

/* ─── SAL Logo Mark (Gold Helmet) ────────────────── */
export const SALMark = ({ size = 32 }) => (
  <Image
    source={require('../../assets/logo-80.png')}
    style={{ width: size, height: size, borderRadius: size / 2 }}
    resizeMode="contain"
  />
);

/* ─── Section Header ──────────────────────────────── */
export const SectionHeader = ({ title, subtitle, accent }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 20, fontWeight: '800', color: accent || C.amber, marginBottom: 4 }}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={{ fontSize: 13, color: C.textGhost }}>{subtitle}</Text>
    ) : null}
  </View>
);

/* ─── Starter Prompt Button ───────────────────────── */
export const StarterBtn = ({ text, accent, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      padding: 12, borderRadius: 10, marginBottom: 8,
      borderWidth: 1, borderColor: accent + '28',
      backgroundColor: accent + '08',
    }}
    activeOpacity={0.7}
  >
    <Text style={{ fontSize: 13, color: accent + 'CC' }}>{text}</Text>
  </TouchableOpacity>
);

/* ─── Chat Message Bubble ─────────────────────────── */
export const ChatBubble = ({ msg, accent }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copyText = () => {
    Clipboard.setStringAsync(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={[styles.bubble, { marginBottom: 16 }]}>
      {/* Avatar */}
      <View style={[
        styles.avatar,
        {
          backgroundColor: isUser ? '#1E1E28' : accent,
          borderRadius: isUser ? 14 : 8,
        },
      ]}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: isUser ? '#666' : '#000' }}>
          {isUser ? 'C' : 'S'}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={styles.bubbleHeader}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: isUser ? '#777' : accent }}>
            {isUser ? 'You' : 'SAL'}
          </Text>
          {!isUser && !msg.streaming && msg.content ? (
            <TouchableOpacity onPress={copyText} style={styles.copyBtn}>
              <Text style={{ fontSize: 11, color: copied ? accent : '#444' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Message text */}
        {msg.streaming && !msg.content ? (
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 4 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, { backgroundColor: accent }]} />
            ))}
          </View>
        ) : (
          <MessageText content={msg.content} isUser={isUser} streaming={msg.streaming} accent={accent} />
        )}
      </View>
    </View>
  );
};

/* ─── Simple Markdown-ish text renderer ───────────── */
export const MessageText = ({ content, isUser, streaming, accent }) => {
  if (!content) return null;

  if (isUser) {
    return (
      <Text style={[styles.msgText, { color: '#999' }]}>{content}</Text>
    );
  }

  // Split on code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <View>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n').replace(/```$/, '').trimEnd();
          return <CodeBlock key={i} lang={lang} code={code} />;
        }
        // Format inline markdown
        return (
          <Text key={i} style={[styles.msgText, { color: '#D4D1CB' }]}>
            {formatInline(part)}
            {streaming && i === parts.length - 1 ? (
              <Text style={{ color: accent }}>▊</Text>
            ) : null}
          </Text>
        );
      })}
    </View>
  );
};

/* Very basic inline formatting */
const formatInline = (text) => text; // React Native Text doesn't parse HTML; keep plain

/* ─── Code Block ──────────────────────────────────── */
export const CodeBlock = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.codeBlock}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeLang}>{lang || 'code'}</Text>
        <TouchableOpacity onPress={copyCode}>
          <Text style={styles.codeCopy}>{copied ? '✓ copied' : 'copy'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.codeText} selectable>{code}</Text>
    </View>
  );
};

/* ─── Input Bar ───────────────────────────────────── */
export const InputBar = ({ value, onChange, onSend, placeholder, loading, accent }) => (
  <View style={styles.inputWrap}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || 'Ask SAL anything...'}
      placeholderTextColor={C.textGhost}
      multiline
      returnKeyType="send"
      onSubmitEditing={() => value.trim() && onSend(value)}
      blurOnSubmit={false}
    />
    <TouchableOpacity
      onPress={() => value.trim() && onSend(value)}
      disabled={loading || !value.trim()}
      style={[
        styles.sendBtn,
        { backgroundColor: value.trim() && !loading ? (accent || C.amber) : '#1A1A22' },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={{ fontSize: 14, color: value.trim() ? '#000' : '#444', fontWeight: '700' }}>↑</Text>
      )}
    </TouchableOpacity>
  </View>
);

/* ─── Mode Tab Bar ────────────────────────────────── */
export const ModeBar = ({ modes, active, onSelect }) => (
  <View style={styles.modeBar}>
    {modes.map(m => (
      <TouchableOpacity
        key={m.id}
        onPress={() => onSelect(m.id)}
        style={[
          styles.modeBtn,
          { backgroundColor: active === m.id ? m.color : 'transparent' },
        ]}
      >
        <Text style={[
          styles.modeBtnText,
          { color: active === m.id ? '#000' : '#555', fontWeight: active === m.id ? '700' : '400' },
        ]}>
          {m.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

/* ─── PRO Badge ───────────────────────────────────── */
export const ProBadge = () => (
  <View style={styles.proBadge}>
    <Text style={styles.proBadgeText}>PRO</Text>
  </View>
);

/* ─── Vertical Selector Card ──────────────────────── */
export const VerticalCard = ({ label, accent, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.vertCard,
      {
        borderColor: active ? accent + '66' : '#1C1C24',
        backgroundColor: active ? accent + '12' : '#111116',
      },
    ]}
  >
    <Text style={{ fontSize: 12, fontWeight: active ? '700' : '400', color: active ? accent : '#555' }}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bubble: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avatar: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  copyBtn: { padding: 2 },
  msgText: { fontSize: 14, lineHeight: 22 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  codeBlock: { marginVertical: 8, backgroundColor: '#07070B', borderRadius: 9, borderWidth: 1, borderColor: '#191922', overflow: 'hidden' },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, paddingHorizontal: 12, backgroundColor: '#0D0D14', borderBottomWidth: 1, borderBottomColor: '#191922' },
  codeLang: { fontSize: 10, color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: 'monospace' },
  codeCopy: { fontSize: 10.5, color: '#555' },
  codeText: { padding: 13, color: '#C8D3F5', lineHeight: 20, fontFamily: 'monospace', fontSize: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#111118', borderRadius: 14, borderWidth: 1, borderColor: '#1E1E2A', padding: 6, gap: 6, marginHorizontal: 16, marginBottom: 8 },
  input: { flex: 1, color: '#E8E6E1', fontSize: 15, paddingHorizontal: 6, paddingVertical: 6, maxHeight: 120 },
  sendBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeBar: { flexDirection: 'row', backgroundColor: '#0A0A0D', padding: 3, borderRadius: 12, borderWidth: 1, borderColor: '#181820', marginBottom: 18 },
  modeBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 9, alignItems: 'center' },
  modeBtnText: { fontSize: 11, textAlign: 'center' },
  proBadge: { backgroundColor: '#F59E0B18', borderWidth: 1, borderColor: '#F59E0B28', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  proBadgeText: { fontSize: 7.5, fontWeight: '800', color: '#F59E0B' },
  vertCard: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 6 },
});
