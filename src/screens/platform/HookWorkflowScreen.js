/* ═══════════════════════════════════════════════════
   SCREEN 27 — HOOK IN WORKFLOW
   hook_in_workflow_screen → Make.com + SAL orchestration
   Wire: SAL /api/sal/respond endpoint + workflow builder
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, TextInput, Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SAL_BACKEND, API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const WORKFLOW_TEMPLATES = [
  {
    id: 'lead_nurture',
    name: 'Lead Nurture Automation',
    icon: '🎯',
    trigger: 'New GHL Contact',
    steps: ['SAL analyzes lead', 'Personalized SMS sent', 'CRM pipeline updated', 'Follow-up scheduled'],
    status: 'active',
    runs: 156,
  },
  {
    id: 'content_publish',
    name: 'Content Publishing Flow',
    icon: '✍️',
    trigger: 'New Blog Post',
    steps: ['SAL generates social posts', 'Published to all platforms', 'Email campaign sent', 'Analytics tracked'],
    status: 'active',
    runs: 43,
  },
  {
    id: 'deal_pipeline',
    name: 'Deal Pipeline Automation',
    icon: '💼',
    trigger: 'Deal Stage Change',
    steps: ['SAL analyzes deal', 'Contract draft generated', 'Client notified', 'Task created'],
    status: 'paused',
    runs: 28,
  },
];

const SAL_ENDPOINT = `${SAL_BACKEND}/api/sal/respond`;

export default function HookWorkflowScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workflows');
  const [testInput, setTestInput] = useState('{"contact": {"name": "John Doe", "email": "john@example.com"}, "trigger": "new_lead"}');
  const [testOutput, setTestOutput] = useState('');
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

  const handleTestSAL = async () => {
    setTesting(true);
    setTestOutput('');
    try {
      const payload = JSON.parse(testInput);
      const res = await fetch(SAL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTestOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setTestOutput(`Error: ${err.message}`);
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
          <Text style={s.headerTitle}>Hook In Workflow</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>SAL ORCHESTRATION BRAIN · MAKE.COM</Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <Text style={s.liveBadgeTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['workflows', 'builder', 'test'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>ACTIVE WORKFLOWS</Text>
            {WORKFLOW_TEMPLATES.map(wf => (
              <View key={wf.id} style={s.wfCard}>
                <View style={s.wfHeader}>
                  <Text style={s.wfIcon}>{wf.icon}</Text>
                  <View style={s.wfInfo}>
                    <Text style={s.wfName}>{wf.name}</Text>
                    <Text style={s.wfTrigger}>⚡ {wf.trigger}</Text>
                  </View>
                  <View style={[s.wfStatus, { backgroundColor: wf.status === 'active' ? '#22C55E18' : '#F59E0B18', borderColor: wf.status === 'active' ? '#22C55E40' : '#F59E0B40' }]}>
                    <Text style={[s.wfStatusTxt, { color: wf.status === 'active' ? '#22C55E' : '#F59E0B' }]}>{wf.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={s.wfSteps}>
                  {wf.steps.map((step, i) => (
                    <View key={i} style={s.wfStep}>
                      <View style={s.wfStepDot} />
                      <Text style={s.wfStepTxt}>{step}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.wfRuns}>{wf.runs} total runs</Text>
              </View>
            ))}
            <TouchableOpacity style={s.addBtn} onPress={() => setActiveTab('builder')}>
              <Text style={s.addBtnTxt}>+ CREATE WORKFLOW</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Builder Tab */}
        {activeTab === 'builder' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>SAL RESPOND ENDPOINT</Text>
            <View style={s.endpointCard}>
              <Text style={s.endpointLabel}>POST</Text>
              <Text style={s.endpointUrl} numberOfLines={1}>{SAL_ENDPOINT}</Text>
              <TouchableOpacity onPress={() => { Clipboard.setString(SAL_ENDPOINT); Alert.alert('Copied!', 'Endpoint URL copied.'); }}>
                <Text style={s.copyIcon}>⧉</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.sectionLabel, { marginTop: 16 }]}>HOW IT WORKS</Text>
            {[
              { step: '1', title: 'Trigger Event', desc: 'Any event from Make.com, Zapier, or your app', icon: '⚡' },
              { step: '2', title: 'SAL Analyzes', desc: 'AI processes context and determines action', icon: '🤖' },
              { step: '3', title: 'Action Executed', desc: 'GHL updated, email sent, or response returned', icon: '✅' },
            ].map(item => (
              <View key={item.step} style={s.howStep}>
                <View style={s.howStepNum}>
                  <Text style={s.howStepNumTxt}>{item.step}</Text>
                </View>
                <View style={s.howStepInfo}>
                  <Text style={s.howStepTitle}>{item.icon} {item.title}</Text>
                  <Text style={s.howStepDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>TEST PAYLOAD (JSON)</Text>
            <TextInput
              style={[s.input, { minHeight: 120, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 }]}
              value={testInput}
              onChangeText={setTestInput}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={[s.testBtn, testing && { opacity: 0.6 }]} onPress={handleTestSAL} disabled={testing}>
              <Text style={s.testBtnTxt}>{testing ? '⏳ TESTING SAL...' : '🧪 TEST SAL ENDPOINT'}</Text>
            </TouchableOpacity>

            {testOutput.length > 0 && (
              <View style={s.outputCard}>
                <Text style={s.outputLabel}>RESPONSE</Text>
                <Text style={s.outputText}>{testOutput}</Text>
              </View>
            )}
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
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { fontSize: 7, fontWeight: '700', color: GOLD + '80', letterSpacing: 1.5 },
  liveBadge: { backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  liveBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 12 },
  wfCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 12 },
  wfHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  wfIcon: { fontSize: 24 },
  wfInfo: { flex: 1 },
  wfName: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  wfTrigger: { fontSize: 11, color: '#6B7280' },
  wfStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  wfStatusTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  wfSteps: { gap: 6, marginBottom: 10 },
  wfStep: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wfStepDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  wfStepTxt: { fontSize: 12, color: '#9CA3AF' },
  wfRuns: { fontSize: 10, color: '#4B5563', fontWeight: '600' },
  addBtn: { borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  addBtnTxt: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 2 },
  endpointCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 10, padding: 12, gap: 10, borderWidth: 1, borderColor: GOLD + '30' },
  endpointLabel: { fontSize: 10, fontWeight: '800', color: GOLD, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  endpointUrl: { flex: 1, fontSize: 11, color: '#22C55E', fontFamily: 'monospace' },
  copyIcon: { fontSize: 18, color: GOLD },
  howStep: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: GOLD + '18' },
  howStepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  howStepNumTxt: { fontSize: 14, fontWeight: '800', color: BG },
  howStepInfo: { flex: 1 },
  howStepTitle: { fontSize: 13, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  howStepDesc: { fontSize: 11, color: '#6B7280' },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8 },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14 },
  testBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  testBtnTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  outputCard: { backgroundColor: '#0A0A0A', borderRadius: 10, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#333' },
  outputLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8 },
  outputText: { fontSize: 11, color: '#22C55E', fontFamily: 'monospace', lineHeight: 18 },
});
