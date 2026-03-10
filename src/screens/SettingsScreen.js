/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SETTINGS SCREEN
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Switch, Alert, Linking,
} from 'react-native';
import { C } from '../config/theme';

const MODELS = [
  { id: 'mini',     label: 'SAL Mini',     desc: 'Fast · Claude Haiku + GPT-5 Fast + Gemini Flash', tier: 'Free' },
  { id: 'pro',      label: 'SAL Pro',      desc: 'Balanced · Claude Sonnet + GPT-5 Core + Gemini 2.5', tier: 'Starter' },
  { id: 'max',      label: 'SAL Max',      desc: 'Deep · Claude Opus + Extended Thinking', tier: 'Pro' },
  { id: 'max_fast', label: 'SAL Max Fast', desc: 'Parallel execution · Teams exclusive', tier: 'Teams' },
];

export default function SettingsScreen() {
  const [selectedModel, setSelectedModel] = useState('pro');
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [apiUrl, setApiUrl] = useState('https://saintsallabs-api.onrender.com');
  const [editingUrl, setEditingUrl] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>cap@hacpglobal.ai · Saint Vision Technologies LLC</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Profile */}
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Ryan Capatosto</Text>
            <Text style={styles.profileEmail}>cap@hacpglobal.ai</Text>
            <Text style={styles.profileTier}>Saint Vision Technologies LLC · Founder & CEO</Text>
          </View>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Default Model */}
        <Text style={styles.sectionLabel}>DEFAULT MODEL</Text>
        <View style={styles.card}>
          {MODELS.map(m => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedModel(m.id)}
              style={[styles.modelRow, { borderColor: selectedModel === m.id ? C.amber + '44' : 'transparent' }]}
            >
              <View style={[styles.radio, { borderColor: selectedModel === m.id ? C.amber : '#333' }]}>
                {selectedModel === m.id && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.modelLabel, { color: selectedModel === m.id ? C.amber : C.text }]}>{m.label}</Text>
                  <View style={styles.tierBadge}><Text style={styles.tierBadgeText}>{m.tier}+</Text></View>
                </View>
                <Text style={styles.modelDesc}>{m.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Streaming responses</Text>
              <Text style={styles.toggleSub}>Show token-by-token as SAL types</Text>
            </View>
            <Switch
              value={streamingEnabled}
              onValueChange={setStreamingEnabled}
              trackColor={{ false: '#1A1A22', true: C.amber + '66' }}
              thumbColor={streamingEnabled ? C.amber : '#555'}
            />
          </View>
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: C.borderSm }]}>
            <View>
              <Text style={styles.toggleLabel}>Haptic feedback</Text>
              <Text style={styles.toggleSub}>Vibration on interactions</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#1A1A22', true: C.amber + '66' }}
              thumbColor={hapticsEnabled ? C.amber : '#555'}
            />
          </View>
        </View>

        {/* API Configuration */}
        <Text style={styles.sectionLabel}>API GATEWAY</Text>
        <View style={styles.card}>
          <Text style={styles.apiLabel}>Gateway URL</Text>
          {editingUrl ? (
            <TextInput
              style={styles.apiInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => setEditingUrl(false)}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingUrl(true)}>
              <Text style={styles.apiUrl}>{apiUrl}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.apiHint}>Tap to edit · Connects to SaintSalLabs-API on Render</Text>
        </View>

        {/* App Info */}
        <Text style={styles.sectionLabel}>APP INFO</Text>
        <View style={styles.infoCard}>
          {[
            ['Version', '1.0.2'],
            ['Build', 'Production'],
            ['Bundle ID', 'com.saintvision.saintsallabs'],
            ['Patent', 'US #10,290,222'],
            ['Platform', 'iOS'],
          ].map(([k, v]) => (
            <View key={k} style={styles.infoRow}>
              <Text style={styles.infoKey}>{k}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          {[
            { label: 'Visit saintsallabs.com', url: 'https://saintsallabs.com' },
            { label: 'Email support', url: 'mailto:cap@hacpglobal.ai' },
            { label: 'Privacy Policy', url: 'https://saintsallabs.com/privacy' },
            { label: 'Terms of Service', url: 'https://saintsallabs.com/terms' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              onPress={() => Linking.openURL(item.url)}
              style={styles.linkRow}
            >
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SaintSal™ Labs · Responsible Intelligence</Text>
          <Text style={styles.footerSub}>Saint Vision Technologies LLC · HACP Protocol · Patent #10,290,222</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.borderSm, backgroundColor: C.sidebar },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.amber },
  headerSub: { fontSize: 11, color: C.textGhost, marginTop: 1 },
  sectionLabel: { fontSize: 9, color: '#333', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  profileCard: { backgroundColor: '#111116', borderWidth: 1, borderColor: C.amber + '22', borderRadius: 13, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#000' },
  profileName: { fontSize: 15, fontWeight: '700', color: C.text },
  profileEmail: { fontSize: 12, color: C.amber, marginTop: 2 },
  profileTier: { fontSize: 10.5, color: '#444', marginTop: 2 },
  proBadge: { backgroundColor: '#F59E0B18', borderWidth: 1, borderColor: '#F59E0B44', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: C.amber },
  card: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  modelRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 10, marginHorizontal: 6, marginVertical: 3, borderColor: 'transparent' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  modelLabel: { fontSize: 13.5, fontWeight: '600' },
  modelDesc: { fontSize: 11, color: '#555', marginTop: 2, lineHeight: 16 },
  tierBadge: { backgroundColor: '#1A1A22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tierBadgeText: { fontSize: 9, fontWeight: '700', color: '#555' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  toggleLabel: { fontSize: 13.5, color: C.text, fontWeight: '500', marginBottom: 2 },
  toggleSub: { fontSize: 11, color: '#555' },
  apiLabel: { fontSize: 11, color: '#555', paddingHorizontal: 14, paddingTop: 14, marginBottom: 6 },
  apiInput: { color: C.amber, fontSize: 13, paddingHorizontal: 14, paddingBottom: 10 },
  apiUrl: { color: C.amber, fontSize: 13, paddingHorizontal: 14, paddingBottom: 10 },
  apiHint: { fontSize: 10.5, color: '#333', paddingHorizontal: 14, paddingBottom: 12 },
  infoCard: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderBottomWidth: 1, borderBottomColor: '#141420' },
  infoKey: { fontSize: 13, color: '#666' },
  infoVal: { fontSize: 13, color: C.text, fontWeight: '500' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#141420' },
  linkLabel: { fontSize: 13.5, color: C.amber },
  linkArrow: { fontSize: 14, color: '#333' },
  footer: { alignItems: 'center', paddingTop: 20, gap: 4 },
  footerText: { fontSize: 12, color: '#333', fontWeight: '600' },
  footerSub: { fontSize: 10, color: '#222' },
});
