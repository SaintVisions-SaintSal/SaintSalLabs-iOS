/* ── MarkdownText — lightweight markdown renderer for React Native ── */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function MarkdownText({ content, color = '#E8E6E1', accent = '#D4AF37', streaming = false }) {
  const nodes = parseMarkdown(content || '');

  return (
    <View>
      {nodes.map((node, i) => renderNode(node, i, color, accent))}
      {streaming && <Text style={{ color: accent }}>▊</Text>}
    </View>
  );
}

function parseMarkdown(text) {
  const lines = text.split('\n');
  const nodes = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ')) {
      nodes.push({ type: 'h1', text: line.slice(2) });
      i++;
    }
    // H2
    else if (line.startsWith('## ')) {
      nodes.push({ type: 'h2', text: line.slice(3) });
      i++;
    }
    // H3
    else if (line.startsWith('### ')) {
      nodes.push({ type: 'h3', text: line.slice(4) });
      i++;
    }
    // Code block
    else if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push({ type: 'code', text: codeLines.join('\n') });
      i++; // skip closing ```
    }
    // Bullet list
    else if (line.match(/^[-*•]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push({ type: 'ul', items });
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push({ type: 'ol', items });
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      nodes.push({ type: 'hr' });
      i++;
    }
    // Empty line
    else if (line.trim() === '') {
      nodes.push({ type: 'spacer' });
      i++;
    }
    // Paragraph
    else {
      nodes.push({ type: 'p', text: line });
      i++;
    }
  }

  return nodes;
}

function renderNode(node, key, color, accent) {
  switch (node.type) {
    case 'h1':
      return (
        <Text key={key} style={[m.h1, { color }]}>
          {renderInline(node.text, color, accent)}
        </Text>
      );
    case 'h2':
      return (
        <Text key={key} style={[m.h2, { color: accent }]}>
          {renderInline(node.text, color, accent)}
        </Text>
      );
    case 'h3':
      return (
        <Text key={key} style={[m.h3, { color }]}>
          {renderInline(node.text, color, accent)}
        </Text>
      );
    case 'code':
      return (
        <View key={key} style={m.codeBlock}>
          <Text style={m.codeText}>{node.text}</Text>
        </View>
      );
    case 'ul':
      return (
        <View key={key} style={m.list}>
          {node.items.map((item, i) => (
            <View key={i} style={m.listRow}>
              <Text style={[m.bullet, { color: accent }]}>·</Text>
              <Text style={[m.listText, { color }]}>{renderInline(item, color, accent)}</Text>
            </View>
          ))}
        </View>
      );
    case 'ol':
      return (
        <View key={key} style={m.list}>
          {node.items.map((item, i) => (
            <View key={i} style={m.listRow}>
              <Text style={[m.bullet, { color: accent }]}>{i + 1}.</Text>
              <Text style={[m.listText, { color }]}>{renderInline(item, color, accent)}</Text>
            </View>
          ))}
        </View>
      );
    case 'hr':
      return <View key={key} style={[m.hr, { borderTopColor: accent + '30' }]} />;
    case 'spacer':
      return <View key={key} style={m.spacer} />;
    case 'p':
    default:
      return (
        <Text key={key} style={[m.p, { color }]}>
          {renderInline(node.text, color, accent)}
        </Text>
      );
  }
}

// Parse inline: **bold**, *italic*, `code`, plain text
function renderInline(text, color, accent) {
  if (!text) return null;

  const parts = [];
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > last) {
      parts.push(
        <Text key={`t-${last}`} style={{ color }}>
          {text.slice(last, match.index)}
        </Text>
      );
    }

    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push(
        <Text key={`b-${match.index}`} style={{ color, fontWeight: '700' }}>
          {raw.slice(2, -2)}
        </Text>
      );
    } else if (raw.startsWith('*')) {
      parts.push(
        <Text key={`i-${match.index}`} style={{ color, fontStyle: 'italic' }}>
          {raw.slice(1, -1)}
        </Text>
      );
    } else if (raw.startsWith('`')) {
      parts.push(
        <Text key={`c-${match.index}`} style={m.inlineCode}>
          {raw.slice(1, -1)}
        </Text>
      );
    }

    last = match.index + raw.length;
  }

  // Remaining text
  if (last < text.length) {
    parts.push(
      <Text key={`t-end-${last}`} style={{ color }}>
        {text.slice(last)}
      </Text>
    );
  }

  return parts.length > 0 ? parts : text;
}

const m = StyleSheet.create({
  h1:        { fontSize: 20, fontWeight: '800', lineHeight: 28, marginTop: 12, marginBottom: 6 },
  h2:        { fontSize: 17, fontWeight: '800', lineHeight: 24, letterSpacing: 0.5, marginTop: 10, marginBottom: 4 },
  h3:        { fontSize: 15, fontWeight: '700', lineHeight: 22, marginTop: 8, marginBottom: 4 },
  p:         { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  list:      { marginBottom: 8 },
  listRow:   { flexDirection: 'row', gap: 8, marginBottom: 4, paddingLeft: 4 },
  bullet:    { fontSize: 14, lineHeight: 22, fontWeight: '700', flexShrink: 0 },
  listText:  { fontSize: 14, lineHeight: 22, flex: 1 },
  codeBlock: { backgroundColor: '#111827', borderRadius: 8, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  codeText:  { fontFamily: 'Courier', fontSize: 12, color: '#86EFAC', lineHeight: 18 },
  inlineCode:{ fontFamily: 'Courier', fontSize: 12, color: '#86EFAC', backgroundColor: '#1F2937', paddingHorizontal: 4, borderRadius: 4 },
  hr:        { borderTopWidth: 1, marginVertical: 12 },
  spacer:    { height: 6 },
});
