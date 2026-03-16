/* ═══════════════════════════════════════════════════
   SCREEN 28 — ELITE BUSINESS FORMATION CENTER
   elite_business_formation_center → LLC, Corp, EIN
   Wire: Claude legal guidance + state filings
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, TextInput, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { streamChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const ENTITY_TYPES = [
  { id: 'llc',     label: 'LLC',          icon: '🏛️', desc: 'Limited Liability Company' },
  { id: 'scorp',   label: 'S-Corp',       icon: '📊', desc: 'S Corporation' },
  { id: 'ccorp',   label: 'C-Corp',       icon: '🏢', desc: 'C Corporation' },
  { id: 'sole',    label: 'Sole Prop',    icon: '👤', desc: 'Sole Proprietorship' },
  { id: 'partner', label: 'Partnership',  icon: '🤝', desc: 'General Partnership' },
];

const FORMATION_STEPS = [
  { num: 1, title: 'Choose Entity Type', desc: 'LLC, Corp, or Partnership', status: 'active' },
  { num: 2, title: 'Select State',       desc: 'DE, WY, or home state',     status: 'pending' },
  { num: 3, title: 'Register Business',  desc: 'File Articles of Formation', status: 'pending' },
  { num: 4, title: 'Get EIN',            desc: 'IRS Employer ID Number',     status: 'pending' },
  { num: 5, title: 'Open Bank Account',  desc: 'Business banking setup',     status: 'pending' },
  { num: 6, title: 'Operating Agreement',desc: 'Legal structure document',   status: 'pending' },
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function BusinessFormationScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [entityType, setEntityType] = useState('llc');
  const [state, setState]           = useState('DE');
  const [bizName, setBizName]       = useState('');
  const [advice, setAdvice]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState('formation');
  const xhrRef = useRef(null);

  const handleGetAdvice = async () => {
    if (!bizName.trim()) return Alert.alert('Error', 'Enter your business name first.');
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setAdvice('');
    const entity = ENTITY_TYPES.find(e => e.id === entityType);

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      system: `You are SAL Business Formation Advisor — an expert in US business entity formation, tax optimization, and legal structure. Provide clear, actionable guidance. Do not provide legal advice — recommend consulting an attorney for final decisions.`,
      messages: [{
        role: 'user',
        content: `Business Name: "${bizName}"\nEntity Type: ${entity?.label} (${entity?.desc})\nState of Formation: ${state}\n\nProvide:\n1. Why this entity type is/isn't ideal for my business\n2. Key formation steps for ${state}\n3. Tax implications\n4. Estimated costs\n5. Top 3 action items`
      }],
      onChunk: (chunk) => setAdvice(prev => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => { Alert.alert('Error', err); setLoading(false); },
    });
  };

  const entity = ENTITY_TYPES.find(e => e.id === entityType);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Business Formation</Text>
          <Text style={s.headerSub}>LLC · CORP · EIN · OPERATING AGREEMENT</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['formation', 'guide', 'resources'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Formation Tab */}
        {activeTab === 'formation' && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>ENTITY TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.entityRow}>
              {ENTITY_TYPES.map(e => (
                <TouchableOpacity key={e.id} style={[s.entityChip, entityType === e.id && s.entityActive]} onPress={() => setEntityType(e.id)}>
                  <Text style={s.entityIcon}>{e.icon}</Text>
                  <Text style={[s.entityLabel, entityType === e.id && { color: BG }]}>{e.label}</Text>
                  <Text style={[s.entityDesc, entityType === e.id && { color: BG + 'AA' }]}>{e.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>BUSINESS NAME</Text>
            <TextInput
              style={s.input}
              value={bizName}
              onChangeText={setBizName}
              placeholder="Your Business Name LLC"
              placeholderTextColor="#444"
            />

            <Text style={s.fieldLabel}>STATE OF FORMATION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stateRow}>
              {['DE', 'WY', 'NV', 'TX', 'FL', 'CA', 'NY', ...US_STATES.filter(s => !['DE','WY','NV','TX','FL','CA','NY'].includes(s))].map(st => (
                <TouchableOpacity key={st} style={[s.stateChip, state === st && s.stateActive]} onPress={() => setState(st)}>
                  <Text style={[s.stateTxt, state === st && { color: BG }]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[s.adviceBtn, loading && { opacity: 0.6 }]} onPress={handleGetAdvice} disabled={loading}>
              <Text style={s.adviceBtnTxt}>{loading ? '🤖 ANALYZING...' : '🤖 GET AI GUIDANCE'}</Text>
            </TouchableOpacity>

            {advice.length > 0 && (
              <View style={s.adviceCard}>
                <View style={s.adviceHeader}>
                  <Text style={s.adviceTitle}>SAL FORMATION ADVISOR</Text>
                  <Text style={s.entityBadge}>{entity?.icon} {entity?.label} · {state}</Text>
                </View>
                <Text style={s.adviceText}>{advice}</Text>
                {loading && <Text style={s.adviceCursor}>▋</Text>}
              </View>
            )}
          </View>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>FORMATION CHECKLIST</Text>
            {FORMATION_STEPS.map(step => (
              <View key={step.num} style={s.stepCard}>
                <View style={[s.stepNum, step.status === 'active' ? s.stepNumActive : s.stepNumPending]}>
                  <Text style={[s.stepNumTxt, step.status === 'active' && { color: BG }]}>{step.num}</Text>
                </View>
                <View style={s.stepInfo}>
                  <Text style={[s.stepTitle, step.status === 'pending' && { color: '#6B7280' }]}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
                {step.status === 'active' && <Text style={s.stepArrow}>›</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>OFFICIAL RESOURCES</Text>
            {[
              { name: 'IRS — Get EIN Online',      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' },
              { name: 'Delaware Division of Corps', url: 'https://corp.delaware.gov' },
              { name: 'Wyoming SOS Business',       url: 'https://wyoming.gov/business' },
              { name: 'SBA — Start a Business',     url: 'https://www.sba.gov/business-guide/10-steps-start-your-business' },
            ].map((r, i) => (
              <TouchableOpacity key={i} style={s.resourceCard} onPress={() => Linking.openURL(r.url)}>
                <Text style={s.resourceName}>{r.name}</Text>
                <Text style={s.resourceArrow}>↗</Text>
              </TouchableOpacity>
            ))}
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
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8, marginTop: 10 },
  entityRow: { gap: 8, paddingBottom: 4 },
  entityChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD, width: 110 },
  entityActive: { backgroundColor: GOLD, borderColor: GOLD },
  entityIcon: { fontSize: 20, marginBottom: 4 },
  entityLabel: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1, marginBottom: 2 },
  entityDesc: { fontSize: 8, color: GOLD + '70', textAlign: 'center' },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14 },
  stateRow: { gap: 6, paddingBottom: 4 },
  stateChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  stateActive: { backgroundColor: GOLD, borderColor: GOLD },
  stateTxt: { fontSize: 11, fontWeight: '700', color: GOLD },
  adviceBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  adviceBtnTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  adviceCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: GOLD + '20', marginTop: 16 },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  adviceTitle: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2 },
  entityBadge: { fontSize: 11, color: '#9CA3AF' },
  adviceText: { fontSize: 13, color: '#E8E6E1', lineHeight: 22 },
  adviceCursor: { color: GOLD, fontSize: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 12 },
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  stepNumActive: { backgroundColor: GOLD, borderColor: GOLD },
  stepNumPending: { backgroundColor: 'transparent', borderColor: '#4B5563' },
  stepNumTxt: { fontSize: 13, fontWeight: '800', color: '#4B5563' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  stepDesc: { fontSize: 11, color: '#6B7280' },
  stepArrow: { fontSize: 20, color: GOLD },
  resourceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  resourceName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#E8E6E1' },
  resourceArrow: { fontSize: 16, color: GOLD },
});
