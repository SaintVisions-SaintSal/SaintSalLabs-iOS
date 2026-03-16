/* ═══════════════════════════════════════════════════
   SCREEN 26 — ELITE CONNECTORS HUB
   elite_connectors_hub → Zapier/Make/N8N + webhooks
   Wire: Make.com + Zapier + webhook orchestration
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, TextInput, Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const CONNECTORS = [
  { id: 'make',    name: 'Make.com',  icon: '⚙️', color: '#7C3AED', status: 'connected', scenarios: 12 },
  { id: 'zapier',  name: 'Zapier',   icon: '⚡', color: '#FF4A00', status: 'connected', scenarios: 8 },
  { id: 'n8n',     name: 'N8N',      icon: '🔗', color: '#EA4B71', status: 'pending',   scenarios: 0 },
  { id: 'webhook', name: 'Webhooks', icon: '🪝', color: '#22C55E', status: 'connected', scenarios: 5 },
  { id: 'slack',   name: 'Slack',    icon: '💬', color: '#4A154B', status: 'connected', scenarios: 3 },
  { id: 'notion',  name: 'Notion',   icon: '📋', color: '#FFFFFF', status: 'pending',   scenarios: 0 },
];

const RECENT_TRIGGERS = [
  { name: 'New GHL Contact → SAL Nurture', platform: 'Make.com', runs: 248, status: 'active' },
  { name: 'Stripe Payment → Welcome Email', platform: 'Zapier',   runs: 91,  status: 'active' },
  { name: 'Form Submit → Slack Notify',     platform: 'Webhooks', runs: 34,  status: 'active' },
  { name: 'Apollo Lead → GHL Pipeline',    platform: 'Make.com', runs: 156, status: 'paused' },
];

export default function EliteConnectorsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('connectors');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testPayload, setTestPayload] = useState('{"event": "test", "data": {}}');
  const [testing, setTesting] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) return Alert.alert('Error', 'Enter a webhook URL to test.');
    setTesting(true);
    try {
      const payload = JSON.parse(testPayload);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      Alert.alert('Webhook Test', `Status: ${res.status} ${res.statusText || 'OK'}`);
    } catch (err) {
      Alert.alert('Webhook Test', `Error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Elite Connectors Hub</Text>
          <Text style={s.headerSub}>MAKE · ZAPIER · WEBHOOKS · N8N</Text>
        </View>
        <View style={s.liveBadge}>
          <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['connectors', 'automations', 'webhooks'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Connectors Tab */}
        {activeTab === 'connectors' && (
          <View style={s.pad}>
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statValue}>{CONNECTORS.filter(c => c.status === 'connected').length}</Text>
                <Text style={s.statLabel}>CONNECTED</Text>
              </View>
              <View style={s.statCard}>
                <Text style={[s.statValue, { color: '#F59E0B' }]}>
                  {CONNECTORS.filter(c => c.status === 'pending').length}
                </Text>
                <Text style={s.statLabel}>PENDING</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>
                  {CONNECTORS.reduce((sum, c) => sum + c.scenarios, 0)}
                </Text>
                <Text style={s.statLabel}>SCENARIOS</Text>
              </View>
            </View>

            {CONNECTORS.map(conn => (
              <View key={conn.id} style={[s.connCard, { borderColor: conn.color + '20' }]}>
                <View style={[s.connIconWrap, { backgroundColor: conn.color + '20' }]}>
                  <Text style={s.connIcon}>{conn.icon}</Text>
                </View>
                <View style={s.connInfo}>
                  <Text style={s.connName}>{conn.name}</Text>
                  <Text style={[s.connStatus, { color: conn.status === 'connected' ? '#22C55E' : '#F59E0B' }]}>
                    ● {conn.status === 'connected' ? `${conn.scenarios} active scenarios` : 'Configure required'}
                  </Text>
                </View>
                <TouchableOpacity style={[s.connAction, { borderColor: conn.color + '40' }]}>
                  <Text style={[s.connActionTxt, { color: conn.color }]}>
                    {conn.status === 'connected' ? 'MANAGE' : 'SETUP'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Automations Tab */}
        {activeTab === 'automations' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>RECENT AUTOMATIONS</Text>
            {RECENT_TRIGGERS.map((t, i) => (
              <View key={i} style={s.autoCard}>
                <View style={s.autoTop}>
                  <Text style={s.autoPlatform}>{t.platform}</Text>
                  <View style={[s.statusBadge, { backgroundColor: t.status === 'active' ? '#22C55E18' : '#F59E0B18', borderColor: t.status === 'active' ? '#22C55E40' : '#F59E0B40' }]}>
                    <Text style={[s.statusTxt, { color: t.status === 'active' ? '#22C55E' : '#F59E0B' }]}>
                      {t.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={s.autoName}>{t.name}</Text>
                <Text style={s.autoRuns}>{t.runs} total runs</Text>
              </View>
            ))}
            <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('Coming Soon', 'Automation builder coming soon.')}>
              <Text style={s.addBtnTxt}>+ CREATE AUTOMATION</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>YOUR WEBHOOK ENDPOINT</Text>
            <View style={s.webhookEndpoint}>
              <Text style={s.webhookUrl} numberOfLines={1}>{API_BASE}/api/webhooks/sal</Text>
              <TouchableOpacity onPress={() => { Clipboard.setString(`${API_BASE}/api/webhooks/sal`); Alert.alert('Copied!', 'Webhook URL copied.'); }}>
                <Text style={s.copyIcon}>⧉</Text>
              </TouchableOpacity>
            </View>

            <Text style={[s.fieldLabel, { marginTop: 20 }]}>TEST OUTBOUND WEBHOOK</Text>
            <TextInput
              style={s.input}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://hooks.zapier.com/..."
              placeholderTextColor="#444"
              autoCapitalize="none"
            />
            <Text style={s.fieldLabel}>PAYLOAD (JSON)</Text>
            <TextInput
              style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={testPayload}
              onChangeText={setTestPayload}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={[s.testBtn, testing && { opacity: 0.6 }]} onPress={handleTestWebhook} disabled={testing}>
              <Text style={s.testBtnTxt}>{testing ? '⏳ TESTING...' : '🪝 FIRE WEBHOOK'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  headerSub: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 2, marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: GOLD + '18' },
  statValue: { fontSize: 22, fontWeight: '800', color: GOLD, marginBottom: 2 },
  statLabel: { fontSize: 7, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5 },
  connCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  connIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  connIcon: { fontSize: 20 },
  connInfo: { flex: 1 },
  connName: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  connStatus: { fontSize: 11, fontWeight: '600' },
  connAction: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  connActionTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 10 },
  autoCard: { backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  autoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  autoPlatform: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  statusTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  autoName: { fontSize: 13, fontWeight: '600', color: '#E8E6E1', marginBottom: 5 },
  autoRuns: { fontSize: 11, color: '#6B7280' },
  addBtn: { borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  addBtnTxt: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 2 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8 },
  webhookEndpoint: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 10, padding: 12, gap: 10 },
  webhookUrl: { flex: 1, fontSize: 12, color: '#22C55E', fontFamily: 'monospace' },
  copyIcon: { fontSize: 18, color: GOLD },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14, marginBottom: 4 },
  testBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  testBtnTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
});
