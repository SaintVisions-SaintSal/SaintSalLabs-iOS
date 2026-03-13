import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const PROJECT = { name: 'SaintSal Builder', id: 'proj_saintsal_9x2kf' };

const API_KEYS = [
  { label: 'Claude (Anthropic)', key: 'sk-ant-api03-xxxx-xxxx', provider: 'claude' },
  { label: 'Grok (xAI)', key: '', provider: 'grok', placeholder: 'Enter xAI API Key' },
  { label: 'ElevenLabs (Voice)', key: 'xi-apiKey-xxxx-xxxx', provider: 'eleven' },
  { label: 'Google Stitch (Search)', key: '', provider: 'google', placeholder: 'G-Cloud Project ID' },
];

const SERVICES = [
  { name: 'Supabase', desc: 'Auth & Database', status: 'connected', icon: '⚡' },
  { name: 'Stripe', desc: 'Payments', status: 'connected', icon: '💳' },
  { name: 'GitHub', desc: 'Repository', status: 'connected', icon: '🔗' },
  { name: 'Vercel', desc: 'Hosting & Edge', status: 'connected', icon: '▲' },
];

const ENVS = ['Development', 'Staging', 'Production'];

export default function APISettingsScreen() {
  const router = useRouter();
  const [keys, setKeys] = useState(
    API_KEYS.reduce((acc, k) => ({ ...acc, [k.provider]: k.key }), {})
  );
  const [revealed, setRevealed] = useState({});
  const [activeEnv, setActiveEnv] = useState('Production');
  const [webhookUrl, setWebhookUrl] = useState('https://api.saintsal.build/webhooks/deploy');

  const toggleReveal = (provider) => {
    setRevealed((p) => ({ ...p, [provider]: !p[provider] }));
  };

  const copyKey = (provider) => {
    const val = keys[provider];
    if (!val) return Alert.alert('Empty', 'No key to copy');
    Clipboard.setString(val);
    Alert.alert('Copied', 'API key copied to clipboard');
  };

  const regenerateKey = (provider) => {
    Alert.alert('Regenerate Key', 'This will invalidate the current key. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Regenerate', style: 'destructive', onPress: () => {
        const newKey = `sk-${provider}-${Math.random().toString(36).slice(2, 10)}`;
        setKeys((p) => ({ ...p, [provider]: newKey }));
      }},
    ]);
  };

  const maskKey = (val) => {
    if (!val) return '';
    if (val.length <= 8) return '••••••••';
    return val.slice(0, 8) + '••••••••••••';
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}><Text style={s.headerIcon}>←</Text></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>SaintSal Builder</Text>
          <Text style={s.headerSub}>DEPLOYMENT & API SETTINGS</Text>
        </View>
        <TouchableOpacity style={s.pushBtn}>
          <Text style={s.pushBtnText}>🚀 Push Live</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Project Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>PROJECT INFO</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Project Name</Text>
              <Text style={s.infoValue}>{PROJECT.name}</Text>
            </View>
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={s.infoLabel}>Project ID</Text>
              <TouchableOpacity onPress={() => { Clipboard.setString(PROJECT.id); Alert.alert('Copied'); }}>
                <Text style={s.infoMono}>{PROJECT.id}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Environment Selector */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ENVIRONMENT</Text>
          <View style={s.envRow}>
            {ENVS.map((env) => (
              <TouchableOpacity
                key={env}
                style={[s.envPill, activeEnv === env && s.envPillActive]}
                onPress={() => setActiveEnv(env)}
              >
                {activeEnv === env && <Text style={s.envDot}>⚡</Text>}
                <Text style={[s.envText, activeEnv === env && s.envTextActive]}>{env}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Keys */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>API KEYS</Text>
          {API_KEYS.map((apiKey) => (
            <View key={apiKey.provider} style={s.keyCard}>
              <Text style={s.keyLabel}>{apiKey.label}</Text>
              <View style={s.keyInputRow}>
                <View style={s.keyInput}>
                  <Text style={s.keyValue} numberOfLines={1}>
                    {revealed[apiKey.provider]
                      ? (keys[apiKey.provider] || apiKey.placeholder || 'Not set')
                      : (keys[apiKey.provider] ? maskKey(keys[apiKey.provider]) : apiKey.placeholder || 'Not set')}
                  </Text>
                </View>
                <TouchableOpacity style={s.keyBtn} onPress={() => toggleReveal(apiKey.provider)}>
                  <Text style={{ fontSize: 14 }}>{revealed[apiKey.provider] ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.keyBtn} onPress={() => copyKey(apiKey.provider)}>
                  <Text style={{ fontSize: 14 }}>📋</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.keyBtn} onPress={() => regenerateKey(apiKey.provider)}>
                  <Text style={{ fontSize: 14 }}>🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Connected Services */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>CONNECTED SERVICES</Text>
          {SERVICES.map((svc) => (
            <View key={svc.name} style={s.serviceRow}>
              <View style={s.serviceIcon}>
                <Text style={{ fontSize: 18 }}>{svc.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.serviceName}>{svc.name}</Text>
                <Text style={s.serviceDesc}>{svc.desc}</Text>
              </View>
              <View style={s.statusDot} />
              <Text style={s.statusLabel}>Connected</Text>
            </View>
          ))}
        </View>

        {/* Webhook URL */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>WEBHOOK URL</Text>
          <View style={s.webhookCard}>
            <TextInput
              style={s.webhookInput}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://your-webhook-url.com"
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={s.webhookCopy}
              onPress={() => { Clipboard.setString(webhookUrl); Alert.alert('Copied'); }}
            >
              <Text style={{ fontSize: 14 }}>📋</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.webhookHint}>POST events will be sent to this URL on deploy</Text>
        </View>

        {/* Domain */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>DOMAIN</Text>
          <View style={s.domainCard}>
            <View style={s.domainRow}>
              <View style={s.domainIcon}>
                <Text style={{ fontSize: 14 }}>🔗</Text>
              </View>
              <Text style={s.domainUrl}>app.saintsal.build</Text>
              <View style={s.domainStatus}>
                <Text style={s.domainStatusText}>ACTIVE</Text>
              </View>
            </View>
            <View style={[s.domainRow, { backgroundColor: C.bgElevated, borderTopWidth: 1, borderTopColor: C.border }]}>
              <View style={[s.domainIcon, { backgroundColor: C.bgHover }]}>
                <Text style={{ fontSize: 14 }}>➕</Text>
              </View>
              <Text style={s.domainAdd}>Add custom domain...</Text>
              <TouchableOpacity style={s.configureBtn}>
                <Text style={s.configureBtnText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={[s.section, { marginBottom: 40 }]}>
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => Alert.alert('Saved', 'All settings saved successfully')}
          >
            <Text style={s.saveBtnText}>Save Credentials</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderGlow, backgroundColor: C.bgCard },
  headerBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 16, color: C.amber },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: C.amber, marginTop: 2 },
  pushBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: C.amber },
  pushBtnText: { fontSize: 12, fontWeight: '800', color: C.bg },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 12 },
  infoCard: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  infoLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  infoValue: { fontSize: 14, fontWeight: '700', color: C.text },
  infoMono: { fontSize: 12, fontFamily: 'monospace', color: C.amber },
  envRow: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  envPill: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  envPillActive: { backgroundColor: C.amber },
  envDot: { fontSize: 10 },
  envText: { fontSize: 12, fontWeight: '700', color: C.textDim },
  envTextActive: { color: C.bg },
  keyCard: { marginBottom: 16 },
  keyLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.textDim, marginBottom: 8, textTransform: 'uppercase' },
  keyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyInput: { flex: 1, height: 48, backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border, justifyContent: 'center', paddingHorizontal: 14 },
  keyValue: { fontSize: 13, color: C.amber, fontFamily: 'monospace' },
  keyBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  serviceIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: C.borderGlow },
  serviceName: { fontSize: 14, fontWeight: '700', color: C.text },
  serviceDesc: { fontSize: 11, color: C.textDim, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, marginRight: 8 },
  statusLabel: { fontSize: 11, fontWeight: '700', color: C.green },
  webhookCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  webhookInput: { flex: 1, height: 48, paddingHorizontal: 14, fontSize: 12, fontFamily: 'monospace', color: C.amber },
  webhookCopy: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: C.border },
  webhookHint: { fontSize: 11, color: C.textDim, marginTop: 8 },
  domainCard: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  domainRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  domainIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  domainUrl: { flex: 1, fontSize: 13, fontFamily: 'monospace', color: C.text },
  domainStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: C.greenGhost },
  domainStatusText: { fontSize: 9, fontWeight: '800', color: C.green, letterSpacing: 1 },
  domainAdd: { flex: 1, fontSize: 12, color: C.textDim, fontStyle: 'italic' },
  configureBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.borderGlow },
  configureBtnText: { fontSize: 11, fontWeight: '700', color: C.amber },
  saveBtn: { height: 50, borderRadius: 12, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderGlow, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: C.amber, letterSpacing: 1 },
});
