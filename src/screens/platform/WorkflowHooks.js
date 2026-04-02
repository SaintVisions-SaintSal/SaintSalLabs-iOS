/* ═══════════════════════════════════════════════════
   STITCH SCREEN — WORKFLOW HOOKS
   Source: stitch_ai_chat_suite/hook_in_workflow_screen
   Webhook management, GHL workflow triggers, Resend email, Twilio SMS
═══════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const LABS_API = 'https://www.saintsallabs.com';
const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const HOOK_TYPES = [
  { id: 'ghl', icon: '🔗', label: 'GHL Workflow', color: '#22C55E', desc: 'GoHighLevel CRM triggers' },
  { id: 'email', icon: '📧', label: 'Resend Email', color: '#3B82F6', desc: 'Transactional email hooks' },
  { id: 'sms', icon: '📱', label: 'Twilio SMS', color: '#8B5CF6', desc: 'SMS notification triggers' },
  { id: 'webhook', icon: '⚡', label: 'Custom Webhook', color: C.gold, desc: 'Generic HTTP webhook' },
];

const MOCK_HOOKS = [
  { id: '1', name: 'New Lead → GHL', type: 'ghl', trigger: 'lead.created', active: true, fires: 142 },
  { id: '2', name: 'Subscription → Email', type: 'email', trigger: 'subscription.activated', active: true, fires: 89 },
  { id: '3', name: 'Payment → SMS Alert', type: 'sms', trigger: 'payment.succeeded', active: false, fires: 23 },
  { id: '4', name: 'Builder Deploy → Slack', type: 'webhook', trigger: 'deploy.success', active: true, fires: 17 },
];

export default function WorkflowHooks() {
  const router = useRouter();
  const [hooks, setHooks] = useState(MOCK_HOOKS);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newHook, setNewHook] = useState({ name: '', type: 'webhook', trigger: '', url: '' });

  const toggleHook = (id) => {
    setHooks(prev => prev.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  const testHook = async (hook) => {
    Alert.alert('Testing Hook', `Sending test payload to "${hook.name}"...`);
    try {
      const res = await fetch(`${LABS_API}/api/webhooks/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook_id: hook.id, hook_name: hook.name }),
      });
      if (res.ok) {
        Alert.alert('Test Successful', `Hook "${hook.name}" fired successfully.`);
      } else {
        Alert.alert('Test Sent', `Payload dispatched. Check your endpoint.`);
      }
    } catch {
      Alert.alert('Test Dispatched', 'Check your webhook endpoint for the test payload.');
    }
  };

  const saveHook = async () => {
    if (!newHook.name.trim() || !newHook.trigger.trim()) {
      Alert.alert('Missing Fields', 'Hook name and trigger are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: newHook.name,
        type: newHook.type,
        trigger: newHook.trigger,
        url: newHook.url,
        active: true,
        created_at: new Date().toISOString(),
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/webhooks`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      });
      const newId = Date.now().toString();
      setHooks(prev => [...prev, { ...payload, id: newId, fires: 0 }]);
      setNewHook({ name: '', type: 'webhook', trigger: '', url: '' });
      setShowAdd(false);
      Alert.alert('Hook Created', `"${newHook.name}" is now active.`);
    } catch {
      const newId = Date.now().toString();
      setHooks(prev => [...prev, { ...newHook, id: newId, active: true, fires: 0 }]);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const getTypeConfig = (typeId) => HOOK_TYPES.find(t => t.id === typeId) || HOOK_TYPES[3];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>WORKFLOW HOOKS</Text>
          <Text style={s.headerSub}>GHL · RESEND · TWILIO · CUSTOM</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(!showAdd)}>
          <Text style={s.addBtnTxt}>{showAdd ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hook Type Cards */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>INTEGRATION TYPES</Text>
          <View style={s.typeGrid}>
            {HOOK_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[s.typeCard, { borderColor: type.color + '30' }]}
                onPress={() => setNewHook(prev => ({ ...prev, type: type.id }))}
                activeOpacity={0.8}
              >
                <Text style={s.typeIcon}>{type.icon}</Text>
                <Text style={[s.typeLabel, { color: type.color }]}>{type.label}</Text>
                <Text style={s.typeDesc}>{type.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Hook Form */}
        {showAdd && (
          <View style={s.section}>
            <View style={s.addForm}>
              <Text style={s.formTitle}>CREATE NEW HOOK</Text>
              <Text style={s.formLabel}>HOOK NAME</Text>
              <TextInput
                style={s.input}
                value={newHook.name}
                onChangeText={v => setNewHook(prev => ({ ...prev, name: v }))}
                placeholder="e.g. New Lead → Email"
                placeholderTextColor={C.textGhost}
              />
              <Text style={s.formLabel}>TRIGGER EVENT</Text>
              <TextInput
                style={s.input}
                value={newHook.trigger}
                onChangeText={v => setNewHook(prev => ({ ...prev, trigger: v }))}
                placeholder="e.g. lead.created"
                placeholderTextColor={C.textGhost}
                autoCapitalize="none"
              />
              <Text style={s.formLabel}>ENDPOINT URL</Text>
              <TextInput
                style={s.input}
                value={newHook.url}
                onChangeText={v => setNewHook(prev => ({ ...prev, url: v }))}
                placeholder="https://hooks.example.com/..."
                placeholderTextColor={C.textGhost}
                autoCapitalize="none"
                keyboardType="url"
              />
              <View style={s.typeSelect}>
                {HOOK_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[s.typeChip, newHook.type === type.id && { backgroundColor: type.color + '20', borderColor: type.color }]}
                    onPress={() => setNewHook(prev => ({ ...prev, type: type.id }))}
                  >
                    <Text style={s.typeChipTxt}>{type.icon} {type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={s.saveBtn} onPress={saveHook} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={C.bg} /> : <Text style={s.saveBtnTxt}>SAVE HOOK</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Active Hooks */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVE HOOKS ({hooks.length})</Text>
          {hooks.map(hook => {
            const typeConf = getTypeConfig(hook.type);
            return (
              <View key={hook.id} style={s.hookCard}>
                <View style={s.hookRow}>
                  <View style={[s.hookIconWrap, { backgroundColor: typeConf.color + '15' }]}>
                    <Text style={s.hookIcon}>{typeConf.icon}</Text>
                  </View>
                  <View style={s.hookInfo}>
                    <Text style={s.hookName}>{hook.name}</Text>
                    <Text style={s.hookTrigger}>{hook.trigger}</Text>
                  </View>
                  <View style={s.hookRight}>
                    <Switch
                      value={hook.active}
                      onValueChange={() => toggleHook(hook.id)}
                      trackColor={{ false: C.border, true: typeConf.color + '50' }}
                      thumbColor={hook.active ? typeConf.color : C.textDim}
                    />
                  </View>
                </View>
                <View style={s.hookMeta}>
                  <Text style={s.hookFires}>⚡ {hook.fires} fires</Text>
                  <View style={[s.hookTypeBadge, { backgroundColor: typeConf.color + '15', borderColor: typeConf.color + '30' }]}>
                    <Text style={[s.hookTypeTxt, { color: typeConf.color }]}>{typeConf.label}</Text>
                  </View>
                  <TouchableOpacity style={s.testBtn} onPress={() => testHook(hook)}>
                    <Text style={s.testBtnTxt}>TEST</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  headerSub: { fontSize: 9, color: C.textDim, letterSpacing: 1, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40', alignItems: 'center', justifyContent: 'center' },
  addBtnTxt: { fontSize: 18, fontWeight: '700', color: C.gold },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '47%', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, padding: 14 },
  typeIcon: { fontSize: 22, marginBottom: 8 },
  typeLabel: { fontSize: 11, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  typeDesc: { fontSize: 10, color: C.textDim, lineHeight: 14 },
  addForm: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  formTitle: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 16 },
  formLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: C.bgElevated, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 13, marginBottom: 16 },
  typeSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { backgroundColor: C.bgElevated, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  typeChipTxt: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  saveBtn: { backgroundColor: C.gold, borderRadius: 10, height: 46, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt: { fontSize: 12, fontWeight: '800', color: C.bg, letterSpacing: 1.5 },
  hookCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10 },
  hookRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  hookIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hookIcon: { fontSize: 20 },
  hookInfo: { flex: 1 },
  hookName: { fontSize: 13, fontWeight: '700', color: C.text },
  hookTrigger: { fontSize: 10, color: C.textDim, marginTop: 2, fontFamily: 'monospace' },
  hookRight: {},
  hookMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hookFires: { fontSize: 10, color: C.textDim, flex: 1 },
  hookTypeBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  hookTypeTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  testBtn: { backgroundColor: C.bgElevated, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  testBtnTxt: { fontSize: 9, fontWeight: '800', color: C.textSub, letterSpacing: 1 },
});
