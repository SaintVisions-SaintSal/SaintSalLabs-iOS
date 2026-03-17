/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — HOOK WORKFLOW V2
   hook_in_workflow_screen — GHL automation + webhooks
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const TRIGGER_TYPES = ['New Contact', 'Lead Stage Change', 'Form Submission', 'SMS Received', 'Email Opened', 'Payment Received', 'Appointment Booked'];
const ACTION_TYPES = ['Send SMS', 'Send Email', 'Add Tag', 'Move Pipeline', 'Create Task', 'Webhook POST', 'AI Response'];

const MOCK_WORKFLOWS = [
  { id: '1', name: 'New Lead → AI Qualification', trigger: 'New Contact', action: 'AI Response', active: true, runs: 127, lastRun: '2 min ago' },
  { id: '2', name: 'Form Submit → Welcome Email', trigger: 'Form Submission', action: 'Send Email', active: true, runs: 84, lastRun: '15 min ago' },
  { id: '3', name: 'Payment → Onboarding SMS', trigger: 'Payment Received', action: 'Send SMS', active: false, runs: 42, lastRun: '3 days ago' },
  { id: '4', name: 'Appointment → Reminder Chain', trigger: 'Appointment Booked', action: 'Send SMS', active: true, runs: 319, lastRun: '8 min ago' },
];

export default function HookWorkflow() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('New Contact');
  const [selectedAction, setSelectedAction] = useState('AI Response');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookPayload, setWebhookPayload] = useState('{"event":"test","data":{}}');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const toggleWorkflow = (id) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) { Alert.alert('Enter workflow name'); return; }
    const newWf = {
      id: String(Date.now()),
      name: newWorkflowName.trim(),
      trigger: selectedTrigger,
      action: selectedAction,
      active: true,
      runs: 0,
      lastRun: 'Never',
    };
    setWorkflows(prev => [newWf, ...prev]);
    setNewWorkflowName('');
    setActiveTab('workflows');
    Alert.alert('Workflow Created', `"${newWf.name}" is now active!`);
  };

  const testWebhook = async () => {
    if (!webhookUrl.trim()) { Alert.alert('Enter webhook URL'); return; }
    setTestLoading(true);
    setTestResult('');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: webhookPayload,
      });
      const text = await res.text();
      setTestResult(`Status: ${res.status}\n\n${text.substring(0, 500)}`);
    } catch (e) {
      setTestResult(`Error: ${e.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hook Workflow</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'WORKFLOWS', value: workflows.length, icon: '⚡' },
          { label: 'ACTIVE', value: workflows.filter(w => w.active).length, icon: '✅' },
          { label: 'TOTAL RUNS', value: workflows.reduce((a, w) => a + w.runs, 0), icon: '▶️' },
          { label: 'SUCCESS RATE', value: '98.4%', icon: '📊' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tabsRow}>
        {['workflows', 'builder', 'webhooks'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'workflows' ? '⚡ ACTIVE' : tab === 'builder' ? '🔧 BUILD' : '🔗 HOOKS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'workflows' && (
          <View style={styles.section}>
            {workflows.map((wf) => (
              <View key={wf.id} style={styles.workflowCard}>
                <View style={styles.workflowHeader}>
                  <View style={styles.workflowIconBadge}>
                    <Text style={styles.workflowIcon}>⚡</Text>
                  </View>
                  <View style={styles.workflowInfo}>
                    <Text style={styles.workflowName}>{wf.name}</Text>
                    <Text style={styles.workflowMeta}>{wf.trigger} → {wf.action}</Text>
                  </View>
                  <Switch
                    value={wf.active}
                    onValueChange={() => toggleWorkflow(wf.id)}
                    trackColor={{ false: BORDER, true: `${GOLD}66` }}
                    thumbColor={wf.active ? GOLD : MUTED}
                  />
                </View>
                <View style={styles.workflowStats}>
                  <View style={styles.workflowStatItem}>
                    <Text style={styles.workflowStatLabel}>RUNS</Text>
                    <Text style={styles.workflowStatValue}>{wf.runs}</Text>
                  </View>
                  <View style={styles.workflowStatItem}>
                    <Text style={styles.workflowStatLabel}>LAST RUN</Text>
                    <Text style={styles.workflowStatValue}>{wf.lastRun}</Text>
                  </View>
                  <View style={styles.workflowStatItem}>
                    <Text style={styles.workflowStatLabel}>STATUS</Text>
                    <Text style={[styles.workflowStatValue, { color: wf.active ? '#4ade80' : MUTED }]}>
                      {wf.active ? 'ACTIVE' : 'PAUSED'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setActiveTab('builder')}>
              <Text style={styles.addBtnText}>+ CREATE WORKFLOW</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'builder' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflow Builder</Text>

            <View style={styles.builderCard}>
              <Text style={styles.fieldLabel}>WORKFLOW NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. New Lead Auto-Qualify"
                placeholderTextColor={MUTED}
                value={newWorkflowName}
                onChangeText={setNewWorkflowName}
              />
            </View>

            <View style={styles.builderCard}>
              <Text style={styles.fieldLabel}>TRIGGER EVENT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {TRIGGER_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, selectedTrigger === t && styles.chipActive]}
                      onPress={() => setSelectedTrigger(t)}
                    >
                      <Text style={[styles.chipText, selectedTrigger === t && styles.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Arrow */}
            <View style={styles.flowArrow}>
              <View style={styles.flowLine} />
              <Text style={styles.flowArrowText}>⬇ THEN</Text>
              <View style={styles.flowLine} />
            </View>

            <View style={styles.builderCard}>
              <Text style={styles.fieldLabel}>ACTION TO TAKE</Text>
              <View style={styles.actionsGrid}>
                {ACTION_TYPES.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.actionBtn, selectedAction === a && styles.actionBtnActive]}
                    onPress={() => setSelectedAction(a)}
                  >
                    <Text style={[styles.actionBtnText, selectedAction === a && styles.actionBtnTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.workflowPreview}>
              <Text style={styles.previewLabel}>WORKFLOW PREVIEW</Text>
              <View style={styles.previewRow}>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>TRIGGER: {selectedTrigger}</Text>
                </View>
                <Text style={styles.previewArrow}>→</Text>
                <View style={[styles.previewBadge, styles.previewBadgeAction]}>
                  <Text style={styles.previewBadgeText}>ACTION: {selectedAction}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={createWorkflow}>
              <Text style={styles.createBtnText}>⚡ CREATE WORKFLOW</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'webhooks' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Webhook Tester</Text>

            <View style={styles.builderCard}>
              <Text style={styles.fieldLabel}>WEBHOOK URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                placeholderTextColor={MUTED}
                value={webhookUrl}
                onChangeText={setWebhookUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.builderCard}>
              <Text style={styles.fieldLabel}>PAYLOAD (JSON)</Text>
              <TextInput
                style={[styles.input, { minHeight: 100, fontFamily: 'Courier', fontSize: 12 }]}
                placeholder='{"event": "test"}'
                placeholderTextColor={MUTED}
                value={webhookPayload}
                onChangeText={setWebhookPayload}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.testBtn, testLoading && styles.testBtnDisabled]}
              onPress={testWebhook}
              disabled={testLoading}
            >
              {testLoading ? <ActivityIndicator color={BLACK} size="small" /> : <Text style={styles.testBtnText}>🔗 FIRE TEST WEBHOOK</Text>}
            </TouchableOpacity>

            {testResult && (
              <View style={styles.testResultCard}>
                <Text style={styles.testResultLabel}>RESPONSE</Text>
                <Text style={styles.testResultText}>{testResult}</Text>
              </View>
            )}

            <View style={styles.salHookCard}>
              <Text style={styles.fieldLabel}>SAINTSALLABS WEBHOOK URL</Text>
              <View style={styles.hookUrlBox}>
                <Text style={styles.hookUrl} numberOfLines={1}>
                  https://saintsallabs-api.onrender.com/api/webhooks/ghl
                </Text>
                <TouchableOpacity onPress={() => Alert.alert('Copied!', 'Webhook URL copied to clipboard')}>
                  <Text style={styles.copyBtn}>📋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hookNote}>Use this URL in GHL → Automations → Webhook</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  liveBadgeText: { color: '#4ade80', fontWeight: '700', fontSize: 10, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 10, alignItems: 'center', gap: 2 },
  statIcon: { fontSize: 14 },
  statValue: { color: GOLD, fontSize: 16, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  statLabel: { color: MUTED, fontSize: 8, letterSpacing: 1, fontFamily: 'PublicSans-Regular' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  tabActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tabText: { color: MUTED, fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  tabTextActive: { color: GOLD },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { gap: 14 },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  workflowCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 14 },
  workflowHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  workflowIconBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center' },
  workflowIcon: { fontSize: 20 },
  workflowInfo: { flex: 1 },
  workflowName: { color: '#e2e8f0', fontWeight: '600', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  workflowMeta: { color: MUTED, fontSize: 11, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  workflowStats: { flexDirection: 'row', gap: 0, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 12 },
  workflowStatItem: { flex: 1, alignItems: 'center' },
  workflowStatLabel: { color: MUTED, fontSize: 8, fontWeight: '700', letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  workflowStatValue: { color: GOLD, fontSize: 14, fontWeight: '700', marginTop: 4, fontFamily: 'PublicSans-Bold' },
  addBtn: { borderWidth: 1, borderColor: `${GOLD}4D`, borderRadius: 10, borderStyle: 'dashed', padding: 16, alignItems: 'center' },
  addBtnText: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  builderCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  fieldLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  input: { color: '#fff', fontSize: 14, padding: 14, backgroundColor: SURFACE, borderRadius: 8, borderWidth: 1, borderColor: BORDER, fontFamily: 'PublicSans-Regular' },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  chipActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  chipText: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  chipTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  flowArrow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flowLine: { flex: 1, height: 1, backgroundColor: BORDER },
  flowArrowText: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  actionBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  actionBtnText: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  actionBtnTextActive: { color: GOLD, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  workflowPreview: { backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  previewLabel: { color: MUTED, fontSize: 9, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewBadge: { flex: 1, backgroundColor: GOLD_DIM, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: `${GOLD}33` },
  previewBadgeAction: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' },
  previewBadgeText: { color: '#e2e8f0', fontSize: 11, fontFamily: 'PublicSans-Regular' },
  previewArrow: { color: GOLD, fontSize: 18 },
  createBtn: { backgroundColor: GOLD, borderRadius: 10, padding: 18, alignItems: 'center' },
  createBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  testBtn: { backgroundColor: GOLD, borderRadius: 10, padding: 16, alignItems: 'center' },
  testBtnDisabled: { opacity: 0.6 },
  testBtnText: { color: BLACK, fontWeight: '800', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  testResultCard: { backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: `${GOLD}33`, padding: 16, gap: 8 },
  testResultLabel: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  testResultText: { color: '#e2e8f0', fontSize: 12, fontFamily: 'PublicSans-Regular', lineHeight: 18 },
  salHookCard: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}33`, borderRadius: 12, padding: 16, gap: 10 },
  hookUrlBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE, borderRadius: 8, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  hookUrl: { flex: 1, color: '#e2e8f0', fontSize: 11, fontFamily: 'PublicSans-Regular' },
  copyBtn: { fontSize: 18 },
  hookNote: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
});
